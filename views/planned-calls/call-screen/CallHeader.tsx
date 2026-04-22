import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface CallHeaderProps {
  elapsedSeconds?: number;
  canEndCall?: boolean;
  onEndCall?: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function CallHeader({ elapsedSeconds = 0, canEndCall = true, onEndCall }: CallHeaderProps) {
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
      <View style={styles.bar}>
        <View style={styles.left}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE CALL</Text>
          </View>
          <View style={styles.timerRow}>
            <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.6)" />
            <Text style={styles.timer}>{formatTime(elapsedSeconds)}</Text>
          </View>
        </View>

        <View style={styles.right}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="chatbubble-outline" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="bookmark-outline" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="expand-outline" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <Pressable
            disabled={!canEndCall}
            style={[styles.endCallBtn, !canEndCall && styles.endCallBtnDisabled]}
            onPress={handleEndCall}
          >
            <Ionicons name="call-outline" size={14} color="#FFFFFF" />
            <Text style={styles.endCallText}>End Call</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: '#12121E',
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
    fontSize: 11,
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
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 4,
  },
  endCallBtnDisabled: {
    opacity: 0.45,
  },
  endCallText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
