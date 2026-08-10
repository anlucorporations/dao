export interface NotificationItem {
  id: string;
  proposalId: number;
  title: string;
  message: string;
  type: 'UNANIMOUS_EXECUTION' | 'VOTING_FINISHED' | 'PROPOSAL_CREATED' | 'PROPOSAL_REJECTED' | 'SECOND_PERIOD';
  timestamp: number;
  read: boolean;
  recipient?: string;
  amountETH?: string;
}

const READ_NOTIFICATIONS_KEY = 'dao_read_notifications_v1';

export function getReadNotificationIds(account: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${READ_NOTIFICATIONS_KEY}_${account.toLowerCase()}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNotificationAsRead(account: string, notificationId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getReadNotificationIds(account);
    if (!current.includes(notificationId)) {
      const updated = [...current, notificationId];
      localStorage.setItem(`${READ_NOTIFICATIONS_KEY}_${account.toLowerCase()}`, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Error al guardar notificacion leida:', err);
  }
}

export function markAllNotificationsAsRead(account: string, notificationIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getReadNotificationIds(account);
    const set = new Set([...current, ...notificationIds]);
    localStorage.setItem(`${READ_NOTIFICATIONS_KEY}_${account.toLowerCase()}`, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.error('Error al marcar todas las notificaciones como leidas:', err);
  }
}
