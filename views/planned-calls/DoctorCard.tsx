import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CompletedCallReport, getCompletedCallReport } from './callCompletionStore';
import { CallType } from './callTypes';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  address?: string;
  lastVisit: string;
  scheduledTime?: string;
  status?: 'pending' | 'completed';
  isNewDoctor?: boolean;
  isNewDoctorPending?: boolean;
}

interface DoctorCardProps {
  doctor: Doctor;
  callType?: CallType;
  onPress?: (doctor: Doctor) => boolean | void;
}

export function DoctorCard({ doctor, callType = 'planned', onPress }: DoctorCardProps) {
  const isCompleted = doctor.status === 'completed';

  const getFallbackCompletedReport = (): CompletedCallReport => ({
    doctorName: doctor.name,
    durationSeconds: 62,
    slidesViewed: 3,
    totalSlides: 3,
    feedback: 'Doctor responded positively and requested a follow-up discussion.',
    slideTimes: [53, 8, 1],
  });

  const handlePress = () => {
    const handled = onPress?.(doctor);
    if (handled) return;

    if (isCompleted) {
      const report = getCompletedCallReport(doctor.id, callType) ?? getFallbackCompletedReport();

      router.push({
        pathname: '/call-analytics/[id]',
        params: {
          id: doctor.id,
          callType,
          doctorName: report.doctorName ?? doctor.name,
          duration: String(report.durationSeconds),
          slidesViewed: String(report.slidesViewed),
          totalSlides: String(report.totalSlides),
          feedback: report.feedback,
          slideTimes: report.slideTimes.join(','),
        },
      });
      return;
    }

    router.push({
      pathname: '/doctor/[id]',
      params: {
        id: doctor.id,
        callType,
        completed: isCompleted ? '1' : '0',
        name: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital,
        address: doctor.address,
        lastVisit: doctor.lastVisit,
        scheduledTime: doctor.scheduledTime,
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        isCompleted && styles.cardCompleted,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrapper, isCompleted && styles.iconWrapperCompleted]}>
        <Ionicons
          name="pulse-outline"
          size={22}
          color={isCompleted ? Colors.success : Colors.primary}
        />
      </View>

      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{doctor.name}</Text>
          {doctor.isNewDoctor || doctor.isNewDoctorPending || doctor.scheduledTime ? (
            <View style={styles.titleBadges}>
              {doctor.isNewDoctor || doctor.isNewDoctorPending ? (
                <View style={styles.newDoctorPill}>
                  <Text style={styles.newDoctorPillText}>New Doctor</Text>
                </View>
              ) : null}
              {doctor.scheduledTime ? (
                <View style={styles.timePill}>
                  <Ionicons name="alarm-outline" size={11} color={Colors.primary} />
                  <Text style={styles.timePillText}>{doctor.scheduledTime}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
        <Text style={styles.specialty}>{doctor.specialty}</Text>
        <View style={[styles.metaRow, isCompleted && styles.metaRowCompleted]}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>{doctor.hospital}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
            <Text style={styles.metaText}>Last visit: {doctor.lastVisit}</Text>
          </View>
        </View>
      </View>

      {isCompleted ? (
        <View style={styles.completedBadge}>
          <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
          <Text style={styles.completedText}>Completed</Text>
        </View>
      ) : (
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardCompleted: {
    borderLeftColor: 'transparent',
  },
  pressed: {
    opacity: 0.75,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperCompleted: {
    backgroundColor: Colors.successBg,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  newDoctorPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FEF3C7',
  },
  newDoctorPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: Colors.primaryLight,
  },
  timePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  specialty: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  metaRowCompleted: {
    flexWrap: 'nowrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    borderRadius: 10,
    backgroundColor: Colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedText: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
});
