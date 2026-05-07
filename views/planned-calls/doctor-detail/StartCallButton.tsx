import { DoctorActionButton } from './DoctorActionButton';

interface StartCallButtonProps {
  enabled?: boolean;
  onPress?: () => void;
}

export function StartCallButton({ enabled = false, onPress }: StartCallButtonProps) {
  return (
    <DoctorActionButton
      label="START DOCTOR CALL"
      iconName="play"
      enabled={enabled}
      onPress={onPress}
      variant="filled"
    />
  );
}
