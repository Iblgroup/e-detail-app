import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
  const { isAuthenticated, isHydrated, login, isSyncingOfflineUsers } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sign In is disabled while the on-open offline login sync runs (or while
  // submitting), so the offline account list is ready before the first sign-in.
  const signInDisabled = isSubmitting || isSyncingOfflineUsers;

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.textOnDark} />
      </SafeAreaView>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      setLoginError('Enter both username and password.');
      return;
    }

    setLoginError('');
    setIsSubmitting(true);

    try {
      await login(username, password);
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : 'Unable to sign in right now.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroCard}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />
            <Text style={styles.heroEyebrow}>Searle E-Detailing</Text>
            <Text style={styles.heroTitle}>Plan smarter field visits from one secure place.</Text>
            <Text style={styles.heroSubtitle}>
              Sign in to access your team coverage, doctor planning, analytics, and call workflows.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome back</Text>
            <Text style={styles.formSubtitle}>Use your Medical Rep account to continue.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputShell}>
                <Ionicons name="person-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Enter your username"
                  placeholderTextColor="#8B96A8"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputShell}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#8B96A8"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword((current) => !current)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            {loginError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
                <Text style={styles.errorText}>{loginError}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => {
                void handleSubmit();
              }}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && !signInDisabled ? styles.submitButtonPressed : null,
                signInDisabled ? styles.submitButtonDisabled : null,
              ]}
              disabled={signInDisabled}
            >
              {signInDisabled ? (
                <ActivityIndicator color={Colors.textOnDark} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.textOnDark} />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#EAF1FB',
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    gap: 18,
    justifyContent: 'center',
  },
  heroCard: {
    overflow: 'hidden',
    borderRadius: 28,
    padding: 24,
    backgroundColor: Colors.secondary,
    minHeight: 220,
    justifyContent: 'center',
  },
  heroGlowOne: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(89, 167, 255, 0.30)',
    top: -80,
    right: -60,
  },
  heroGlowTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    bottom: -70,
    left: -30,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  heroTitle: {
    color: Colors.textOnDark,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '900',
    maxWidth: 440,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 14,
    maxWidth: 480,
  },
  formCard: {
    borderRadius: 26,
    backgroundColor: Colors.surface,
    padding: 22,
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  formTitle: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  formSubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  inputShell: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8E2F0',
    backgroundColor: '#F8FAFD',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  errorBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F5B9B9',
    backgroundColor: Colors.dangerBg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: Colors.danger,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  submitButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitButtonPressed: {
    opacity: 0.88,
  },
  submitButtonDisabled: {
    opacity: 0.72,
  },
  submitButtonText: {
    color: Colors.textOnDark,
    fontSize: 16,
    fontWeight: '800',
  },
});
