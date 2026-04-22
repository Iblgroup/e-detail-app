import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { CallType } from './callTypes';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  address?: string;
  lastVisit: string;
  status?: 'pending' | 'completed';
}

interface DoctorCardProps {
  doctor: Doctor;
  callType?: CallType;
  onPress?: () => void;
}

export function DoctorCard({ doctor, callType = 'planned', onPress }: DoctorCardProps) {
  const isCompleted = doctor.status === 'completed';

  const handlePress = () => {
    onPress?.();
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
        <Text style={styles.name}>{doctor.name}</Text>
        <Text style={styles.specialty}>{doctor.specialty}</Text>
        <View style={styles.metaRow}>
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
          <Ionicons name="checkmark-circle-outline" size={15} color={Colors.success} />
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
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  specialty: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
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
    gap: 5,
    borderRadius: 10,
    backgroundColor: Colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  completedText: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '800',
  },
});
