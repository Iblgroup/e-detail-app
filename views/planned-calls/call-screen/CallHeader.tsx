import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface CallHeaderProps {
  elapsedSeconds?: number;
  canEndCall?: boolean;
  onEndCall?: () => void;
}

export function CallHeader({
  canEndCall = true,
  onEndCall,
}: CallHeaderProps) {
  const handleEndCall = () => {
    if (!canEndCall) return;

    if (onEndCall) {
      onEndCall();
      return;
    }

    router.back();
  };

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        disabled={!canEndCall}
        style={[styles.endCallBtn, !canEndCall && styles.endCallBtnDisabled]}
        onPress={handleEndCall}
      >
        <Ionicons name="close" size={16} color="#FFFFFF" />
        <Text style={styles.endCallText}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // Anchored to the same line as the SlideViewer "Slide X/Y" pill:
  // overlay bottom (18) + dots row (5) + gap (12) + pill marginBottom (2).
  wrap: {
    position: 'absolute',
    right: 18,
    bottom: 37,
    zIndex: 30,
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
