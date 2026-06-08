export type QueueJobStatus = 'Pending' | 'Active' | 'Paused' | 'Completed';

export function normalizeQueueStatus(status?: string): QueueJobStatus {
  const normalized = (status ?? '').trim().toLowerCase();

  if (normalized === 'active' || normalized === 'in progress') return 'Active';
  if (normalized === 'paused') return 'Paused';
  if (normalized === 'completed' || normalized === 'complete') return 'Completed';

  return 'Pending';
}

export function calculateProgress(totalTime?: number, timeElapsed?: number): number {
  if (totalTime == null || totalTime === 0 || timeElapsed == null) return 0;
  return Math.min(100, Math.max(0, Math.round((timeElapsed / totalTime) * 100)));
}

export function formatTimeLeft(totalTime?: number, timeElapsed?: number): string {
  if (totalTime == null || timeElapsed == null) {
    return 'No estimate';
  }

  const remaining = Math.max(0, totalTime - timeElapsed);
  return remaining === 0 ? 'Complete' : `${remaining} min left`;
}
