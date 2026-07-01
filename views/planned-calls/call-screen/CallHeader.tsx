import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface CallHeaderProps {
  elapsedSeconds?: number;
  canEndCall?: boolean;
  onEndCall?: () => void;
}

export function CallHeader({
  canEndCall = true,
  onEndCall,
}: CallHeaderProps) {
  const isWeb = Platform.OS === 'web';

  const handleEndCall = () => {
    if (!canEndCall) return;

    if (onEndCall) {
      onEndCall();
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View pointerEvents="none" style={styles.topGradient}>
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="callHeaderGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#020617" stopOpacity={isWeb ? 0.65 : 0.18} />
              <Stop offset="0.38" stopColor="#020617" stopOpacity={isWeb ? 0.28 : 0.08} />
              <Stop offset="0.72" stopColor="#020617" stopOpacity={isWeb ? 0.1 : 0.02} />
              <Stop offset="1" stopColor="#020617" stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#callHeaderGradient)" />
        </Svg>
      </View>
      <View style={styles.bar}>
        {/* LIVE CALL pill + timer hidden */}
        <View style={styles.left} />

        <View style={styles.right}>
          <Pressable
            disabled={!canEndCall}
            style={[styles.endCallBtn, !canEndCall && styles.endCallBtnDisabled]}
            onPress={handleEndCall}
          >
            <Ionicons name="close" size={16} color="#FFFFFF" />
            <Text style={styles.endCallText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: 'transparent',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'web' ? 112 : 88,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timer: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  endCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  endCallBtnDisabled: {
    opacity: 0.45,
  },
  endCallText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
