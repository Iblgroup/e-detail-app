import { Colors } from '@/constants/theme';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Platform, StyleSheet, View } from 'react-native';

const TUTORIAL_VIDEO_URL =
  'https://file-examples.com/storage/fe5add0b7e69f1a4793292f/2017/04/file_example_MP4_480_1_5MG.mp4';

export function TutorialVideoCard() {
  const tutorialVideoPlayer = useVideoPlayer(TUTORIAL_VIDEO_URL, (player) => {
    player.loop = false;
  });

  return (
    <View style={styles.videoCard}>
      {Platform.OS === 'web' ? (
        <video
          controls
          src={TUTORIAL_VIDEO_URL}
          style={styles.webVideoPlayer}
        />
      ) : (
        <VideoView
          player={tutorialVideoPlayer}
          nativeControls
          contentFit="cover"
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
  videoPlayer: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.secondary,
  },
  webVideoPlayer: {
    width: '100%',
    height: 220,
    display: 'block',
    borderRadius: 16,
    backgroundColor: Colors.secondary,
    objectFit: 'cover',
  },
});
