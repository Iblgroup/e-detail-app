import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import axios from '@/config/axios';
import {
  saveOfflineCredential,
  verifyOfflineCredential,
} from '@/lib/offline/offlineAuth';
import {
  saveOfflineUsers,
  verifyOfflineUser,
  type OfflineUserRecord,
} from '@/lib/offline/offlineUsers';
import { bootstrapPlannedBulk } from '@/lib/offline/plannedBulk';
import { OFFLINE_SYNC_KEY } from '@/config/app-sync';

/**
 * The mobile app is used exclusively by TSOs / MIEs (field reps), so the only
 * role we surface here is 'rep'. Login is authenticated against the shared
 * `user_validation` backend (POST /api/auth/login).
 */
export type UserRole = 'rep';

export const ROLE_LABELS: Record<UserRole, string> = {
  rep: 'Medical Rep',
};

export interface AuthUser {
  userId: number | string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  /** Team name (display), e.g. "TITANS EXTOR". */
  team?: string;
  /** tso_staff.tsoid — used as the MIE id by the sync/planned flows. */
  mieId?: string;
  /** new_teams.teamid the TSO belongs to. */
  teamId?: number;
}

interface PersistedSession {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  role: UserRole | null;
  canEdit: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface LoginResponse {
  success: boolean;
  message?: string;
  user: {
    userId: number | string;
    username: string;
    displayName?: string;
    email?: string;
    teamId?: number | string | null;
    teamName?: string | null;
    mieId?: number | string | null;
  };
  roles: { id: number; name: string }[];
}

const SESSION_STORAGE_KEY = 'e_detail_app_session';
const sessionFileUri = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}e-detail-app-session.json`
  : null;

/**
 * Authenticate against the shared backend. Only TSO/MIE users can use the app,
 * so we require the login to resolve a `mieId` (tso_staff.tsoid) + `teamId`;
 * otherwise the account isn't a field rep and can't sync any doctors.
 */
async function apiLogin(
  username: string,
  password: string,
): Promise<PersistedSession> {
  let payload: LoginResponse;
  try {
    // The axios response interceptor already unwraps `response.data`.
    payload = (await axios.post('/auth/login', {
      username: username.trim(),
      password,
    })) as unknown as LoginResponse;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Unable to sign in. Please try again.';
    const wrapped = new Error(message) as Error & { isNetworkError?: boolean };
    // No `response` means the request never reached the server (offline /
    // unreachable), as opposed to a real 401/403 from the backend.
    wrapped.isNetworkError = !error?.response;
    throw wrapped;
  }

  if (!payload?.success || !payload.user) {
    throw new Error(payload?.message || 'Invalid username or password');
  }

  const { user: u } = payload;
  if (u.mieId == null || u.teamId == null) {
    throw new Error(
      'This account is not registered as a field rep (MIE). Please contact your administrator.',
    );
  }

  const user: AuthUser = {
    userId: u.userId,
    username: u.username,
    name: u.displayName || u.username,
    email: u.email ?? undefined,
    role: 'rep',
    team: u.teamName ?? undefined,
    mieId: String(u.mieId),
    teamId: Number(u.teamId),
  };

  return {
    token: `session-${user.userId}-${Date.now()}`,
    user,
  };
}

interface OfflineUsersResponse {
  success: boolean;
  count: number;
  users: OfflineUserRecord[];
}

/**
 * Pull the ACTIVE user login mirror and cache it on-device so ANY active user
 * can sign in offline — even before anyone has signed in on this device. Uses
 * the shared app key (no user credentials needed) so it can run on app open.
 * Best-effort: when offline or on error it silently keeps the existing mirror.
 */
export async function bootstrapOfflineUsers(): Promise<void> {
  if (!OFFLINE_SYNC_KEY) return;
  try {
    const payload = (await axios.post(
      '/auth/offline-users',
      {},
      { headers: { 'x-app-key': OFFLINE_SYNC_KEY } },
    )) as unknown as OfflineUsersResponse;
    if (payload?.success && Array.isArray(payload.users)) {
      await saveOfflineUsers(payload.users);
    }
  } catch (error) {
    console.warn('[Auth] Failed to sync offline users mirror', error);
  }
}

/** Build a rep session from a mirrored user record (throws if not a field rep). */
function offlineRecordToSession(rec: OfflineUserRecord): PersistedSession {
  if (rec.mieId == null || rec.teamId == null) {
    throw new Error(
      'This account is not registered as a field rep (MIE). Please contact your administrator.',
    );
  }
  const user: AuthUser = {
    userId: rec.userId,
    username: rec.username,
    name: rec.displayName || rec.username,
    email: rec.email ?? undefined,
    role: 'rep',
    team: rec.teamName ?? undefined,
    mieId: String(rec.mieId),
    teamId: Number(rec.teamId),
  };
  return { token: `offline-${user.userId}-${Date.now()}`, user };
}

export async function readStoredSession(): Promise<PersistedSession | null> {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PersistedSession) : null;
    }

    if (!sessionFileUri) {
      return null;
    }

    const fileInfo = await FileSystem.getInfoAsync(sessionFileUri);
    if (!fileInfo.exists) {
      return null;
    }

    const raw = await FileSystem.readAsStringAsync(sessionFileUri);
    return raw ? (JSON.parse(raw) as PersistedSession) : null;
  } catch (error) {
    console.warn('[Auth] Failed to read stored session', error);
    return null;
  }
}

async function writeStoredSession(session: PersistedSession | null): Promise<void> {
  try {
    if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
      if (session) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
      return;
    }

    if (!sessionFileUri) {
      return;
    }

    if (session) {
      await FileSystem.writeAsStringAsync(sessionFileUri, JSON.stringify(session));
      return;
    }

    const fileInfo = await FileSystem.getInfoAsync(sessionFileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(sessionFileUri, { idempotent: true });
    }
  } catch (error) {
    console.warn('[Auth] Failed to persist session', error);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const storedSession = await readStoredSession();

      if (!isMounted) {
        return;
      }

      setToken(storedSession?.token ?? null);
      setUser(storedSession?.user ?? null);
      setIsHydrated(true);
    };

    void hydrate();
    // On app open, pull the login mirror + all reps' planned lists so a user who
    // has never signed in on this device can still log in AND see their planned
    // calls offline. Best-effort: no-ops when offline (keeps last cached copy).
    void bootstrapOfflineUsers();
    void bootstrapPlannedBulk();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const nextSession = await apiLogin(username, password);
      setToken(nextSession.token);
      setUser(nextSession.user);
      await writeStoredSession(nextSession);
      // Cache a verifiable credential so this user can log in offline later.
      await saveOfflineCredential(
        username,
        password,
        nextSession.token,
        nextSession.user,
      );
      // Refresh the login mirror + planned bulk after a successful online login
      // (best-effort; doesn't block the login).
      void bootstrapOfflineUsers();
      void bootstrapPlannedBulk();
    } catch (error: any) {
      // Only fall back to offline login when the server was unreachable — a real
      // 401/403 must still surface as an invalid-credentials error.
      if (error?.isNetworkError) {
        // 1) Any active user via the on-device login mirror.
        const mirrorRecord = await verifyOfflineUser(username, password);
        if (mirrorRecord) {
          const session = offlineRecordToSession(mirrorRecord);
          setToken(session.token);
          setUser(session.user);
          await writeStoredSession(session);
          return;
        }
        // 2) Fallback: this device's last online user (salted-hash cache).
        const offlineSession = await verifyOfflineCredential(username, password);
        if (offlineSession) {
          setToken(offlineSession.token);
          setUser(offlineSession.user);
          await writeStoredSession(offlineSession);
          return;
        }
        throw new Error(
          'You appear to be offline and no saved login was found on this device. Connect to the internet to sign in the first time.',
        );
      }
      throw error;
    }
  };

  const logout = async () => {
    // Logout only drops the session — it intentionally KEEPS all offline data:
    // the React Query cache (doctors / forcing / SKUs / unplanned pool), the
    // downloaded slide images, planned bulk, sync metadata, login mirror, and
    // the call outbox. This way the rep gets their full dataset back on the next
    // login — even offline, and even after the app was killed. Queries are keyed
    // per rep (mieId/teamId), so a different rep signing in here won't see this
    // rep's cached data (they fetch/sync their own). When online, screens
    // refetch the latest.
    setToken(null);
    setUser(null);
    await writeStoredSession(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isHydrated,
      role: user?.role ?? null,
      canEdit: false,
      login,
      logout,
    }),
    [isHydrated, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
