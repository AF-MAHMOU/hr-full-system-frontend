/**
 * NotificationContainer Component
 * Container that displays toast notifications
 */

'use client';

import React from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { Toast } from '../Toast';
import { NotificationPosition } from '../../types/notification';
import styles from './NotificationContainer.module.css';

export interface NotificationContainerProps {
  position?: NotificationPosition;
  maxNotifications?: number;
}

export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = NotificationPosition.TOP_RIGHT,
  maxNotifications = 5,
}) => {
  const { notifications, removeNotification } = useNotificationContext();

  // Filter and limit notifications
  const displayedNotifications = notifications.slice(0, maxNotifications);

  if (displayedNotifications.length === 0) {
    return null;
  }

  const positionClass = position.replace('_', '-').toLowerCase();

  return (
    <div className={`${styles.container} ${styles[`container--${positionClass}`]}`}>
      {displayedNotifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
          position={position}
        />
      ))}
    </div>
  );
};

