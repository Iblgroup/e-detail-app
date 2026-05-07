import { Colors } from '@/constants/theme';
import { Asset } from 'expo-asset';
import { VideoView, useVideoPlayer } from 'expo-video';
import type { CSSProperties } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

const tutorialVideoSource = require('../../assets/videos/file_example_MP4_480_1_5MG.mp4');
const tutorialVideoAsset = Asset.fromModule(tutorialVideoSource);
const tutorialVideoUri = tutorialVideoAsset.uri ?? tutorialVideoAsset.localUri ?? '';

const webVideoPlayerStyle: CSSProperties = {
  width: '100%',
  height: 'auto',
  aspectRatio: '16 / 9',
  display: 'block',
  borderRadius: 16,
  backgroundColor: Colors.secondary,
  objectFit: 'contain',
};

export function TutorialVideoCard() {
  const tutorialVideoPlayer = useVideoPlayer(tutorialVideoSource, (player) => {
    player.loop = false;
  });

  return (
    <View style={styles.videoCard}>
      <View style={styles.header}>
        <Text style={styles.title}>E-Detailing App Tutorial</Text>
        <Text style={styles.subtitle}>Quick walkthrough for calls, reporting, and doctor visits</Text>
      </View>

      {Platform.OS === 'web' ? (
        <video
          controls
          src={tutorialVideoUri}
          style={webVideoPlayerStyle}
        />
      ) : (
        <VideoView
          player={tutorialVideoPlayer}
          nativeControls
          contentFit="contain"
          style={styles.videoPlayer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 8,
    marginBottom: 14,
    boxShadow: '0px 1px 4px rgba(43, 115, 184, 0.08)',
    elevation: 2,
  },
  header: {
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 10,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.secondary,
  },
});
