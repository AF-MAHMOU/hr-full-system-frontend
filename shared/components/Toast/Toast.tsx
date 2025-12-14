/**
 * Toast Component
 * Individual toast notification
 */

'use client';

import React, { useEffect, useState } from 'react';
import type { Notification, NotificationPosition } from '../../types/notification';
import styles from './Toast.module.css';

export interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
  position?: NotificationPosition;
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose, position }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Animation duration
  };

  // Auto-close if duration is set
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  return (
    <div
      className={`${styles.toast} ${styles[`toast--${notification.type}`]} ${isExiting ? styles['toast--exiting'] : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.icon}>{getIcon()}</div>
      <div className={styles.content}>
        {notification.title && (
          <div className={styles.title}>{notification.title}</div>
        )}
        <div className={styles.message}>{notification.message}</div>
        {notification.action && (
          <button
            className={styles.actionButton}
            onClick={notification.action.onClick}
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

