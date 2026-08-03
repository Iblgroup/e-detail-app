import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { DASH } from '@/views/planned-calls/mapDoctor';
import type { Doctor } from '@/views/planned-calls/DoctorCard';

interface DoctorListCardProps {
  doctor: Doctor;
}

/** Up to two initials for the avatar, e.g. "ABDUL GHAFOOR" → "AG". */
function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : ''}`.toUpperCase();
}

/**
 * A doctor in the reference book. Deliberately styled apart from
 * `DoctorCard` (the Call Reporting row) — an initials avatar, the doctor's
 * class and PMDC on show, and no call affordance — so the two lists never read
 * as the same screen. Opens the detail in view-only mode.
 */
export function DoctorListCard({ doctor }: DoctorListCardProps) {
  const hasClass = Boolean(doctor.doctorClass) && doctor.doctorClass !== DASH;
  const hasPmdc = Boolean(doctor.pmdc) && doctor.pmdc !== DASH;

  const openDetail = () => {
    router.push({
      pathname: '/doctor/[id]',
      params: {
        id: doctor.id,
        viewOnly: '1',
        name: doctor.name,
        specialty: doctor.specialty,
        specialtyId: doctor.specialtyId ? String(doctor.specialtyId) : undefined,
        hospital: doctor.hospital,
        address: doctor.address,
        city: doctor.city,
        lastVisit: doctor.lastVisit,
        doctorClass: doctor.doctorClass,
        pmdc: doctor.pmdc,
        teamId: doctor.teamId ? String(doctor.teamId) : undefined,
      },
    });
  };

  return (
    <Pressable
      onPress={openDetail}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initialsOf(doctor.name)}</Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.name} numberOfLines={2}>
            {doctor.name}
          </Text>
          <View style={styles.specialtyChip}>
            <Text style={styles.specialtyText} numberOfLines={1}>
              {doctor.specialty}
            </Text>
          </View>
        </View>

        {hasClass ? (
          <View style={styles.classPill}>
            <Text style={styles.classPillText}>{doctor.doctorClass}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="business-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {doctor.city || doctor.address || DASH}
          </Text>
        </View>
        {hasPmdc ? (
          <View style={styles.metaItem}>
            <Ionicons name="card-outline" size={13} color={Colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              PMDC {doctor.pmdc}
            </Text>
          </View>
        ) : null}
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            Last visit: {doctor.lastVisit}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 12,
  },
  pressed: {
    opacity: 0.75,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.textOnDark,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleBlock: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  specialtyChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    maxWidth: '100%',
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  classPill: {
    minWidth: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
  },
  classPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
    columnGap: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
});
