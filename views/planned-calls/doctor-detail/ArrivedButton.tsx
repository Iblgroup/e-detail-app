import { DoctorActionButton } from './DoctorActionButton';

interface ArrivedButtonProps {
  onPress?: () => void;
  arrived?: boolean;
  enabled?: boolean;
}

export function ArrivedButton({ onPress, arrived = false, enabled = true }: ArrivedButtonProps) {
  return (
    <DoctorActionButton
      label="ARRIVED"
      iconName="location-outline"
      onPress={onPress}
      active={arrived}
      enabled={enabled}
      variant="outline"
    />
  );
}
