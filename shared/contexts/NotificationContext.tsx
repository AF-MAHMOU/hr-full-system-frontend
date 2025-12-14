/**
 * Notification Context
 * Provides global notification state and methods
 */

'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import type {
  Notification,
  NotificationOptions,
  NotificationContextValue,
} from '../types/notification';
import { NotificationType } from '../types/notification';

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  defaultDuration?: number;
  maxNotifications?: number;
}

export const NotificationProvider = ({
  children,
  defaultDuration = 5000,
  maxNotifications = 5,
}: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Auto-remove notifications after duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      if (notification?.onClose) {
        notification.onClose();
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  const showNotification = useCallback(
    (message: string, options?: NotificationOptions): string => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const notification: Notification = {
        id,
        type: options?.type || NotificationType.INFO,
        title: options?.title,
        message,
        duration: options?.duration !== undefined ? options.duration : defaultDuration,
        module: options?.module,
        action: options?.action,
        onClose: options?.onClose,
        createdAt: new Date(),
      };

      setNotifications((prev) => {
        const newNotifications = [notification, ...prev];
        // Limit the number of notifications
        return newNotifications.slice(0, maxNotifications);
      });

      return id;
    },
    [defaultDuration, maxNotifications]
  );

  const showSuccess = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'type'>): string => {
      return showNotification(message, { ...options, type: NotificationType.SUCCESS });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'type'>): string => {
      return showNotification(message, { ...options, type: NotificationType.ERROR });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'type'>): string => {
      return showNotification(message, { ...options, type: NotificationType.WARNING });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'type'>): string => {
      return showNotification(message, { ...options, type: NotificationType.INFO });
    },
    [showNotification]
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearModuleNotifications = useCallback((module: string) => {
    setNotifications((prev) => prev.filter((n) => n.module !== module));
  }, []);

  const value: NotificationContextValue = {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications,
    clearModuleNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

