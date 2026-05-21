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

export type UserRole = 'bm' | 'nsm' | 'sm' | 'rm' | 'rep';

export const ROLE_LABELS: Record<UserRole, string> = {
  bm: 'Business Manager',
  nsm: 'National Sales Manager',
  sm: 'Sales Manager',
  rm: 'Regional Manager',
  rep: 'Medical Rep',
};

export interface AuthUser {
  username: string;
  name: string;
  role: UserRole;
  team?: string;
  sapId?: string;
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

type DummyAccount = AuthUser & { password: string };

const DUMMY_ACCOUNTS: DummyAccount[] = [
  {
    username: 'rmextor',
    password: 'rmextor123',
    name: 'M Hassan Khalid Extor',
    role: 'rm',
    team: 'TITANS EXTOR',
    sapId: '11001489',
  },
  {
    username: 'rmvibrant',
    password: 'rmvibrant123',
    name: 'Muhammad Faisal Suk Vib',
    role: 'rm',
    team: 'VIBRANT',
    sapId: '11002454',
  },
];

const SESSION_STORAGE_KEY = 'e_detail_app_session';
const sessionFileUri = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}e-detail-app-session.json`
  : null;

async function readStoredSession(): Promise<PersistedSession | null> {
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

async function dummyLogin(
  username: string,
  password: string,
): Promise<PersistedSession> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const normalizedUsername = username.trim().toLowerCase();
  const account = DUMMY_ACCOUNTS.find(
    (candidate) =>
      candidate.username.toLowerCase() === normalizedUsername &&
      candidate.password === password,
  );

  if (!account) {
    throw new Error('Invalid username or password');
  }

  const { password: _password, ...user } = account;

  return {
    token: `dummy-token-${user.role}-${Date.now()}`,
    user,
  };
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

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    const nextSession = await dummyLogin(username, password);
    setToken(nextSession.token);
    setUser(nextSession.user);
    await writeStoredSession(nextSession);
  };

  const logout = async () => {
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
