import { DoctorActionButton } from './DoctorActionButton';

interface CancelCallButtonProps {
  onPress?: () => void;
  enabled?: boolean;
}

export function CancelCallButton({ onPress, enabled = true }: CancelCallButtonProps) {
  return (
    <DoctorActionButton
      label="END CALL"
      iconName="close-outline"
      enabled={enabled}
      onPress={onPress}
      variant="danger"
    />
  );
}
