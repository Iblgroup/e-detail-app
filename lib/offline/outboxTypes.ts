export type OutboxStatus = 'pending' | 'failed';

export interface OutboxRow {
  client_id: string;
  payload: string;
  status: OutboxStatus;
  attempts: number;
  last_error: string | null;
  created_at: string;
}
