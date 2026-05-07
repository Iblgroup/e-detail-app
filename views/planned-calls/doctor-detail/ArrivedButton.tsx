import { DoctorActionButton } from './DoctorActionButton';

interface ArrivedButtonProps {
  onPress?: () => void;
  arrived?: boolean;
}

export function ArrivedButton({ onPress, arrived = false }: ArrivedButtonProps) {
  return (
    <DoctorActionButton
      label="ARRIVED"
      iconName="location-outline"
      onPress={onPress}
      active={arrived}
      variant="outline"
    />
  );
}
