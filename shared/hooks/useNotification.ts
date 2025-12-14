/**
 * useNotification Hook
 * Hook to easily show notifications from any component
 */

import { useCallback } from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';
import type { NotificationOptions, NotificationType } from '../types/notification';

export const useNotification = (defaultModule?: string) => {
  const context = useNotificationContext();

  const showNotification = useCallback(
    (message: string, options?: NotificationOptions) => {
      return context.showNotification(message, {
        ...options,
        module: options?.module || defaultModule,
      });
    },
    [context, defaultModule]
  );

  const showSuccess = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'type'>) => {
      return context.showSuccess(message, {
        ...options,
        module: options?.module || defaultModule,
      });
    },
    [context, defaultModule]
  );

  const showError = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'type'>) => {
      return context.showError(message, {
        ...options,
        module: options?.module || defaultModule,
      });
    },
    [context, defaultModule]
  );

  const showWarning = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'type'>) => {
      return context.showWarning(message, {
        ...options,
        module: options?.module || defaultModule,
      });
    },
    [context, defaultModule]
  );

  const showInfo = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'type'>) => {
      return context.showInfo(message, {
        ...options,
        module: options?.module || defaultModule,
      });
    },
    [context, defaultModule]
  );

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification: context.removeNotification,
    clearNotifications: context.clearNotifications,
    clearModuleNotifications: context.clearModuleNotifications,
    notifications: context.notifications,
  };
};

