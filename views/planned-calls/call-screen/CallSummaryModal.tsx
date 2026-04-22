import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/theme';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export interface CallSummaryData {
  feedback: string;
  jointCall: string;
  samplesProvided: string;
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
  const [jointCall, setJointCall] = useState('No');
  const [samplesProvided, setSamplesProvided] = useState('No');
  const [feedback, setFeedback] = useState('');

  const safeSlidesViewed = useMemo(
    () => Math.min(Math.max(slidesViewed, 0), totalSlides),
    [slidesViewed, totalSlides]
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Call Summary</Text>
            <Text style={styles.subtitle}>Please complete the call report</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.statsRow}>
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
            <View style={styles.optionRow}>
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

            <Text style={styles.fieldLabel}>Doctor's Feedback</Text>
            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              style={styles.feedbackInput}
              placeholder="Enter notes, questions, or concerns..."
              placeholderTextColor="#7B8493"
              multiline
              textAlignVertical="top"
            />

            <View style={styles.actions}>
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
                    feedback: feedback.trim(),
                    jointCall,
                    samplesProvided,
                  })
                }
                variant="primary"
                style={styles.submitButton}
                textStyle={styles.submitText}
              />
            </View>
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
  sheet: {
    width: '100%',
    maxWidth: 510,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
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
  content: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
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
    fontSize: 11,
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
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 26,
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
    fontSize: 12,
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
    fontSize: 15,
    fontWeight: '800',
  },
  largeOptionTextActive: {
    color: '#FFFFFF',
  },
  feedbackInput: {
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8DEE8',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#202735',
    fontSize: 14,
    marginBottom: 30,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    paddingVertical: 10,
  },
  cancelText: {
    fontSize: 15,
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
    fontSize: 15,
    fontWeight: '800',
  },
});
