import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface DetailFieldProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function DetailField({ iconName, label, value }: DetailFieldProps) {
  return (
    <View style={styles.field}>
      <Ionicons name={iconName} size={16} color={Colors.primary} />
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

interface ProfessionalDetailsCardProps {
  hospital: string;
  address: string;
  lastVisit: string;
  doctorRating: string;
  pmdcNumber: string;
  scheduledTime?: string;
}

export function ProfessionalDetailsCard({
  hospital,
  address,
  lastVisit,
  doctorRating,
  pmdcNumber,
  scheduledTime,
}: ProfessionalDetailsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Professional Details</Text>
      <View style={styles.grid}>
        <DetailField iconName="location-outline" label="HOSPITAL" value={hospital} />
        <DetailField iconName="location-outline" label="ADDRESS" value={address} />
        {scheduledTime ? (
          <DetailField iconName="alarm-outline" label="CALL TIME" value={scheduledTime} />
        ) : null}
        <DetailField iconName="time-outline" label="LAST VISIT" value={lastVisit} />
        <DetailField iconName="ribbon-outline" label="DOCTOR RATING" value={doctorRating} />
        <DetailField iconName="card-outline" label="PMDC NUMBER" value={pmdcNumber} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '45%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
});
