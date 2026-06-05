export type QueueJobStatus = 'Queued' | 'Active' | 'Paused';

export function normalizeQueueStatus(status?: string): QueueJobStatus | null {
  const normalized = (status ?? '').trim().toLowerCase();

  if (normalized === 'active' || normalized === 'in progress') return 'Active';
  if (normalized === 'paused') return 'Paused';
  if (normalized === 'queued' || normalized === 'pending') return 'Queued';

  return null;
}

export function calculateProgress(totalTime?: number, timeElapsed?: number, expedited = false): number {
  if (totalTime == null || totalTime === 0 || timeElapsed == null) return 0;
  const effectiveTotal = expedited ? totalTime / 2 : totalTime;
  if (effectiveTotal <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((timeElapsed / effectiveTotal) * 100)));
}

export function formatTimeLeft(totalTime?: number, timeElapsed?: number, expedited = false): string {
  if (totalTime == null || timeElapsed == null) {
    return 'No estimate';
  }

  const effectiveTotal = expedited ? totalTime / 2 : totalTime;
  const remaining = Math.max(0, effectiveTotal - timeElapsed);
  return remaining === 0 ? 'Complete' : `${Math.ceil(remaining)} min left`;
}
