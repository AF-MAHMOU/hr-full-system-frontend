/**
 * NotificationBell Component
 * Shows notification bell icon with badge count in navbar
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotificationContext } from '../../contexts/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { performanceApi } from '@/app/modules/performance/api/performanceApi';
import { AppraisalAssignmentStatus } from '@/app/modules/performance/types';
import NotificationDropdown from './NotificationDropdown';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const { user } = useAuth();
  const { notifications } = useNotificationContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingAcknowledgments, setPendingAcknowledgments] = useState(0);
  const [newAssignments, setNewAssignments] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for pending acknowledgments
  const checkPendingAcknowledgments = useCallback(async () => {
    if (!user?.userid) {
      setPendingAcknowledgments(0);
      return;
    }

    try {
      setLoading(true);
      const employeeId = user.userid;
      if (!employeeId) {
        setPendingAcknowledgments(0);
        return;
      }
      
      const assignments = await performanceApi.getEmployeeAssignments(employeeId);
      
      if (!Array.isArray(assignments) || assignments.length === 0) {
        setPendingAcknowledgments(0);
        setNewAssignments(0);
        return;
      }
      
      // Count published assignments that need acknowledgment
      const publishedCount = assignments.filter((a: any) => {
        const status = a.status;
        return (
          status === AppraisalAssignmentStatus.PUBLISHED || 
          status === 'PUBLISHED' ||
          String(status).toUpperCase() === 'PUBLISHED'
        );
      }).length;
      
      // Count new assignments (NOT_STARTED or IN_PROGRESS) that haven't been acknowledged
      const newAssignmentsCount = assignments.filter((a: any) => {
        const status = a.status;
        return (
          status === AppraisalAssignmentStatus.NOT_STARTED ||
          status === 'NOT_STARTED' ||
          status === AppraisalAssignmentStatus.IN_PROGRESS ||
          status === 'IN_PROGRESS'
        );
      }).length;
      
      setPendingAcknowledgments(publishedCount);
      setNewAssignments(newAssignmentsCount);
    } catch (error) {
      // Silently fail - don't show error to user, just don't show badge
      console.error('Error checking pending acknowledgments:', error);
      setPendingAcknowledgments(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check on mount and when user changes
  useEffect(() => {
    if (user?.userType === 'employee') {
      checkPendingAcknowledgments();
      
      // Refresh every 30 seconds
      const interval = setInterval(checkPendingAcknowledgments, 30000);
      return () => clearInterval(interval);
    }
  }, [user, checkPendingAcknowledgments]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // Total notification count (toast notifications + pending acknowledgments + new assignments)
  const totalCount = notifications.length + pendingAcknowledgments + newAssignments;
  const hasNotifications = totalCount > 0;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleBellClick = () => {
    toggleDropdown();
    // Refresh pending acknowledgments when opening
    if (!isDropdownOpen && user?.userType === 'employee') {
      checkPendingAcknowledgments();
    }
  };

  // Don't show for non-employees
  if (user?.userType !== 'employee') {
    return null;
  }

  return (
    <div className={styles.notificationBellContainer} ref={containerRef}>
      <button
        className={`${styles.bellButton} ${hasNotifications ? styles.hasNotifications : ''}`}
        onClick={handleBellClick}
        aria-label={`Notifications${hasNotifications ? ` (${totalCount} new)` : ''}`}
        aria-expanded={isDropdownOpen}
      >
        <span className={styles.bellIcon}>🔔</span>
        {hasNotifications && (
          <span className={styles.badge} aria-hidden="true">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <NotificationDropdown
          pendingAcknowledgments={pendingAcknowledgments}
          newAssignments={newAssignments}
          onClose={() => setIsDropdownOpen(false)}
          onRefresh={checkPendingAcknowledgments}
        />
      )}
    </div>
  );
}

