/**
 * Notification Utilities
 * Helper functions for notifications
 */

import type { NotificationOptions, NotificationType } from '../types/notification';

/**
 * Create notification options with module context
 */
export const createNotificationOptions = (
  type: NotificationType,
  module?: string,
  options?: Omit<NotificationOptions, 'type' | 'module'>
): NotificationOptions => {
  return {
    ...options,
    type,
    module,
  };
};

/**
 * Format error message from API error
 */
export const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

/**
 * Format success message
 */
export const formatSuccessMessage = (action: string, resource?: string): string => {
  if (resource) {
    return `${resource} ${action} successfully`;
  }
  return `${action} successfully`;
};

