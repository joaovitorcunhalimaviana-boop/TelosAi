/**
 * Tipos TypeScript para o sistema de notificações em tempo real
 */

// ============================================
// TIPOS DE NOTIFICAÇÃO
// ============================================

export type NotificationType =
  | 'red_flag_critical'
  | 'red_flag_high'
  | 'red_flag_medium'
  | 'followup_completed'
  | 'followup_overdue'
  | 'patient_created'
  | 'surgery_created'
  | 'system_alert'
  | 'info';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  red_flag_critical: 'Alerta Crítico',
  red_flag_high: 'Alerta Alto',
  red_flag_medium: 'Alerta Médio',
  followup_completed: 'Follow-up Respondido',
  followup_overdue: 'Follow-up Atrasado',
  patient_created: 'Novo Paciente',
  surgery_created: 'Nova Cirurgia',
  system_alert: 'Alerta do Sistema',
  info: 'Informação',
};

// ============================================
// PRIORIDADES
// ============================================

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
};

export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: 'blue',
  medium: 'yellow',
  high: 'orange',
  critical: 'red',
};

// ============================================
// INTERFACE NOTIFICATION
// ============================================

export interface Notification {
  id: string;
  createdAt: Date;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  readAt?: Date | null;
  data?: Record<string, any> | null;
  actionUrl?: string | null;
}

// ============================================
// NOTIFICATION DATA TYPES
// ============================================

export interface RedFlagNotificationData {
  patientId: string;
  patientName: string;
  surgeryId: string;
  followUpId: string;
  followUpResponseId: string;
  dayNumber: number;
  redFlags: string[];
  riskLevel: string;
}

export interface FollowUpNotificationData {
  patientId: string;
  patientName: string;
  surgeryId: string;
  followUpId: string;
  dayNumber: number;
}

export interface PatientNotificationData {
  patientId: string;
  patientName: string;
}

export interface SurgeryNotificationData {
  patientId: string;
  patientName: string;
  surgeryId: string;
  surgeryType: string;
}

// ============================================
// SSE EVENT
// ============================================

export interface NotificationEvent {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
}

// ============================================
// API TYPES
// ============================================

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data?: Record<string, any>;
  actionUrl?: string;
}

export interface MarkAsReadInput {
  notificationId: string;
}

export interface GetNotificationsParams {
  userId: string;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
  type?: NotificationType;
  priority?: NotificationPriority;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCritical: number;
  byHigh: number;
  byMedium: number;
  byLow: number;
}

// ============================================
// FILTERS
// ============================================

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  read?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

// ============================================
// VALIDATORS
// ============================================

export function isNotificationType(value: string): value is NotificationType {
  return [
    'red_flag_critical',
    'red_flag_high',
    'red_flag_medium',
    'followup_completed',
    'followup_overdue',
    'patient_created',
    'surgery_created',
    'system_alert',
    'info',
  ].includes(value);
}

export function isNotificationPriority(value: string): value is NotificationPriority {
  return ['low', 'medium', 'high', 'critical'].includes(value);
}

// ============================================
// HELPERS
// ============================================

export function getPriorityFromRiskLevel(riskLevel: string): NotificationPriority {
  switch (riskLevel.toLowerCase()) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
    default:
      return 'low';
  }
}

export function getNotificationTypeFromRiskLevel(riskLevel: string): NotificationType {
  switch (riskLevel.toLowerCase()) {
    case 'critical':
      return 'red_flag_critical';
    case 'high':
      return 'red_flag_high';
    case 'medium':
      return 'red_flag_medium';
    default:
      return 'info';
  }
}

export function shouldPlaySound(priority: NotificationPriority): boolean {
  return priority === 'critical' || priority === 'high';
}

export function formatNotificationTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d atrás`;
  if (hours > 0) return `${hours}h atrás`;
  if (minutes > 0) return `${minutes}min atrás`;
  return 'agora';
}
