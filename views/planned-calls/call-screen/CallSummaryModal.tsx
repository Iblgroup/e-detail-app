import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/theme';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface CallSummaryData {
  feedback: string;
  jointCall: string;
  samplesProvided: string;
  doctorInterest: 'High' | 'Medium' | 'Low';
}

interface CallSummaryModalProps {
  visible: boolean;
  durationSeconds: number;
  slidesViewed: number;
  totalSlides: number;
  onCancel: () => void;
  onSubmit: (summary: CallSummaryData) => void;
}

const JOINT_CALL_OPTIONS = ['No', 'NSM', 'HOS', 'SM', 'RM'];
const SAMPLE_OPTIONS = ['Yes', 'No'];
const DOCTOR_INTEREST_OPTIONS = ['High', 'Medium', 'Low'] as const;
const QUICK_FEEDBACK_OPTIONS = [
  'Interested',
  'Need Follow-up',
  'Asked for Samples',
  'Requested Literature',
  'Price Concern',
  'Competitor Mentioned',
  'Next Visit Planned',
  'Not Interested',
] as const;

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = (safeSeconds % 60).toString().padStart(2, '0');

  return `${minutes}:${remainingSeconds}`;
}

export function CallSummaryModal({
  visible,
  durationSeconds,
  slidesViewed,
  totalSlides,
  onCancel,
  onSubmit,
}: CallSummaryModalProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  const [jointCall, setJointCall] = useState('No');
  const [samplesProvided, setSamplesProvided] = useState('No');
  const [doctorInterest, setDoctorInterest] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);

  const safeSlidesViewed = useMemo(
    () => Math.min(Math.max(slidesViewed, 0), totalSlides),
    [slidesViewed, totalSlides]
  );

  const feedbackSummary = useMemo(
    () => selectedFeedback.join(', '),
    [selectedFeedback]
  );

  const toggleFeedback = (option: string) => {
    setSelectedFeedback((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View
        style={[
          styles.backdrop,
          isLandscape && styles.backdropLandscape,
          {
            paddingTop: Math.max(insets.top, isLandscape ? 14 : 22),
            paddingBottom: Math.max(insets.bottom, isLandscape ? 14 : 22),
            paddingLeft: Math.max(insets.left, isLandscape ? 16 : 22),
            paddingRight: Math.max(insets.right, isLandscape ? 16 : 22),
          },
        ]}
      >
        <View
          style={[
            styles.sheet,
            isLandscape && styles.sheetLandscape,
            {
              maxHeight: height - Math.max(insets.top, isLandscape ? 14 : 22) - Math.max(insets.bottom, isLandscape ? 14 : 22),
              maxWidth: isLandscape
                ? Math.min(width - Math.max(insets.left, 16) - Math.max(insets.right, 16), 820)
                : Math.min(width - Math.max(insets.left, 22) - Math.max(insets.right, 22), 510),
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Call Summary</Text>
            <Text style={styles.subtitle}>Please complete the call report</Text>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={[styles.content, isLandscape && styles.contentLandscape]}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={[styles.statsRow, isLandscape && styles.statsRowLandscape]}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{formatDuration(durationSeconds)}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Slides</Text>
                <Text style={styles.statValue}>
                  {safeSlidesViewed} / {totalSlides}
                </Text>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Was this a joint call?</Text>
            <View style={[styles.optionRow, isLandscape && styles.optionRowLandscape]}>
              {JOINT_CALL_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setJointCall(option)}
                  style={[styles.optionButton, jointCall === option && styles.optionButtonActive]}
                >
                  <Text style={[styles.optionText, jointCall === option && styles.optionTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Samples Provided?</Text>
            <View style={styles.twoColumnRow}>
              {SAMPLE_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setSamplesProvided(option)}
                  style={[
                    styles.largeOptionButton,
                    samplesProvided === option && styles.largeOptionButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.largeOptionText,
                      samplesProvided === option && styles.largeOptionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Doctor Interest</Text>
            <View style={styles.threeColumnRow}>
              {DOCTOR_INTEREST_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setDoctorInterest(option)}
                  style={[
                    styles.largeOptionButton,
                    doctorInterest === option && styles.largeOptionButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.largeOptionText,
                      doctorInterest === option && styles.largeOptionTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Quick Feedback</Text>
            <Text style={styles.helperText}>Select the points that match this doctor call.</Text>
            <View style={[styles.feedbackOptions, isLandscape && styles.feedbackOptionsLandscape]}>
              {QUICK_FEEDBACK_OPTIONS.map((option) => {
                const selected = selectedFeedback.includes(option);

                return (
                  <Pressable
                    key={option}
                    onPress={() => toggleFeedback(option)}
                    style={[
                      styles.feedbackChip,
                      selected && styles.feedbackChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.feedbackChipText,
                        selected && styles.feedbackChipTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={[styles.actions, isLandscape && styles.actionsLandscape]}>
            <AppButton
              label="Cancel"
              onPress={onCancel}
              variant="secondary"
              style={styles.cancelButton}
              textStyle={styles.cancelText}
            />
            <AppButton
              label="End Call & Submit"
              onPress={() =>
                onSubmit({
                  feedback: feedbackSummary,
                  jointCall,
                  samplesProvided,
                  doctorInterest,
                })
              }
              variant="primary"
              style={styles.submitButton}
              textStyle={styles.submitText}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  backdropLandscape: {
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  sheet: {
    width: '100%',
    maxWidth: 510,
    maxHeight: '92%',
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  sheetLandscape: {
    borderRadius: 20,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    marginTop: 10,
  },
  scrollArea: {
    flexGrow: 0,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  contentLandscape: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  statsRowLandscape: {
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    paddingVertical: 17,
    alignItems: 'center',
  },
  statLabel: {
    color: '#94A0B2',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#202735',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 8,
  },
  fieldLabel: {
    color: '#44536A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 7,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 26,
  },
  optionRowLandscape: {
    marginBottom: 20,
  },
  optionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    color: '#5B6A7F',
    fontSize: 14,
    fontWeight: '800',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 26,
  },
  threeColumnRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 26,
  },
  largeOptionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeOptionButtonActive: {
    backgroundColor: Colors.primary,
  },
  largeOptionText: {
    color: '#5B6A7F',
    fontSize: 16,
    fontWeight: '800',
  },
  largeOptionTextActive: {
    color: '#FFFFFF',
  },
  helperText: {
    color: '#7B8493',
    fontSize: 13,
    marginBottom: 30,
  },
  feedbackOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
  },
  feedbackOptionsLandscape: {
    marginBottom: 20,
  },
  feedbackChip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#EEF2F6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  feedbackChipText: {
    color: '#5B6A7F',
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackChipTextActive: {
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8EDF5',
    backgroundColor: '#FFFFFF',
  },
  actionsLandscape: {
    paddingTop: 10,
    paddingBottom: 12,
  },
  cancelButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '800',
  },
  submitButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 0,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  submitText: {
    color: Colors.textOnDark,
    fontSize: 16,
    fontWeight: '800',
  },
});
