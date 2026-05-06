type PendingReturnToNewDoctor = {
  shouldOpenForm: boolean;
  pendingDoctorId?: string;
};

let pendingReturnToNewDoctor: PendingReturnToNewDoctor | null = null;

export function queueReturnToNewDoctor(pendingDoctorId?: string) {
  pendingReturnToNewDoctor = {
    shouldOpenForm: true,
    pendingDoctorId,
  };
}

export function consumeReturnToNewDoctor() {
  const nextValue = pendingReturnToNewDoctor;
  pendingReturnToNewDoctor = null;
  return nextValue;
}
