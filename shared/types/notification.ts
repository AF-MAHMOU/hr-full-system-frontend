/**
 * Notification Types
 * Types for the notification system
 */

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export enum NotificationPosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  TOP_CENTER = 'top-center',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  BOTTOM_CENTER = 'bottom-center',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // in milliseconds, 0 means persistent
  module?: string; // Module name (e.g., 'performance', 'leaves', etc.)
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  createdAt: Date;
}

export interface NotificationOptions {
  type?: NotificationType;
  title?: string;
  duration?: number;
  module?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export interface NotificationContextValue {
  notifications: Notification[];
  showNotification: (message: string, options?: NotificationOptions) => string;
  showSuccess: (message: string, options?: Omit<NotificationOptions, 'type'>) => string;
  showError: (message: string, options?: Omit<NotificationOptions, 'type'>) => string;
  showWarning: (message: string, options?: Omit<NotificationOptions, 'type'>) => string;
  showInfo: (message: string, options?: Omit<NotificationOptions, 'type'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  clearModuleNotifications: (module: string) => void;
}

