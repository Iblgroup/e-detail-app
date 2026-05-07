import { DoctorActionButton } from './DoctorActionButton';

interface AddTokenButtonProps {
  onPress?: () => void;
  active?: boolean;
}

export function AddTokenButton({ onPress, active = false }: AddTokenButtonProps) {
  return (
    <DoctorActionButton
      label="ADD CARD (TOKEN)"
      iconName="card-outline"
      onPress={onPress}
      active={active}
      variant="outline"
    />
  );
}
