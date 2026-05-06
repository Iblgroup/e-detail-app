import { AppButton } from '@/components/ui/AppButton';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, useWindowDimensions, View } from 'react-native';

interface SettingsCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}

function SettingsCard({ icon, title, children }: SettingsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
}

function PasswordField({ label, placeholder, icon }: PasswordFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrap}>
        <Ionicons name={icon} size={18} color="#9AA7B8" />
        <TextInput
          secureTextEntry
          placeholder={placeholder}
          placeholderTextColor="#7B8493"
          style={styles.input}
        />
      </View>
    </View>
  );
}

interface SecurityRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

function SecurityRow({ label, value, onValueChange }: SecurityRowProps) {
  return (
    <View style={styles.securityRow}>
      <Text style={styles.securityLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#DDE4EC', true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.surface}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [sessionTimeoutEnabled, setSessionTimeoutEnabled] = useState(true);

  return (
    <ScreenLayout
      title="Settings"
      subtitle="Manage your account and security preferences"
      contentStyle={styles.content}
    >
      <View style={[styles.grid, isWide && styles.gridWide]}>
        <View style={[styles.sideColumn, isWide && styles.sideColumnWide]}>
          <View style={styles.accountCard}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={34} color={Colors.primary} />
            </View>
            <Text style={styles.accountTitle}>Account Info</Text>
            <Text style={styles.accountSubtitle}>Member since Jan 2024</Text>

            <View style={styles.accountMeta}>
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Role</Text>
                <Text style={styles.accountValue}>Medical Rep</Text>
              </View>
              <View style={styles.accountRow}>
                <Text style={styles.accountLabel}>Region</Text>
                <Text style={styles.accountValue}>South Zone</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.mainColumn, isWide && styles.mainColumnWide]}>
          <SettingsCard icon="lock-closed-outline" title="Change Password">
            <PasswordField
              label="New Password"
              placeholder="Minimum 6 characters"
              icon="lock-closed-outline"
            />
            <PasswordField
              label="Confirm Password"
              placeholder="Repeat new password"
              icon="checkmark-circle-outline"
            />
            <AppButton
              label="Update Password"
              onPress={() => {}}
              icon={<Ionicons name="arrow-forward" size={18} color={Colors.textOnDark} />}
              style={styles.updateButton}
            />
          </SettingsCard>

          <SettingsCard icon="shield-checkmark-outline" title="Security Settings">
            <SecurityRow
              label="Two-Factor Authentication"
              value={twoFactorEnabled}
              onValueChange={setTwoFactorEnabled}
            />
            <SecurityRow
              label="Biometric Login"
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
            />
            <SecurityRow
              label="Session Timeout (15 mins)"
              value={sessionTimeoutEnabled}
              onValueChange={setSessionTimeoutEnabled}
            />
          </SettingsCard>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },
  grid: {
    gap: 16,
  },
  gridWide: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  },
  mainColumn: {
    gap: 16,
  },
  mainColumnWide: {
    flex: 1,
  },
  sideColumn: {
    gap: 16,
  },
  sideColumnWide: {
    width: 280,
  },
  card: {
    borderRadius: 16,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardBody: {
    padding: 18,
    gap: 16,
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  inputWrap: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9E0EA',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  updateButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    paddingHorizontal: 18,
    marginTop: 4,
  },
  securityRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  securityLabel: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  accountCard: {
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(43,115,184,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  accountTitle: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '800',
  },
  accountSubtitle: {
    color: Colors.text,
    fontSize: 14,
    marginTop: 5,
    marginBottom: 16,
  },
  accountMeta: {
    width: '100%',
    gap: 12,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  accountLabel: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  accountValue: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '800',
  },
});
