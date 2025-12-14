'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/shared/components';
import { useNotification } from '@/shared/hooks/useNotification';
import { performanceApi } from '../api/performanceApi';
import type { OneOnOneMeeting } from '../types';
import { MeetingStatus } from '../types';
import { hrApi } from '@/app/modules/hr/api/hrApi';
import styles from './EmployeeMeetingsView.module.css';

interface EmployeeMeetingsViewProps {
  employeeId: string;
}

export default function EmployeeMeetingsView({ employeeId }: EmployeeMeetingsViewProps) {
  const { showError } = useNotification();
  const [meetings, setMeetings] = useState<OneOnOneMeeting[]>([]);
  const [managers, setManagers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const data = await performanceApi.getMeetingsByEmployee(employeeId);
      setMeetings(data);
      
      // Fetch manager details for each unique manager
      // Note: HR Employees may not have permission to fetch other employees' profiles
      // So we'll try to fetch but handle errors gracefully
      const uniqueManagerIds = [...new Set(data.map(m => m.managerId))];
      const managerPromises = uniqueManagerIds.map(async (managerId) => {
        try {
          const manager = await hrApi.getEmployeeById(managerId);
          return { [managerId]: manager };
        } catch (error: any) {
          // If 403 Forbidden, HR Employee doesn't have permission - just show manager ID
          if (error?.response?.status === 403) {
            console.warn(`Cannot fetch manager ${managerId} details: Permission denied`);
            return { [managerId]: { firstName: 'Manager', lastName: `(${managerId.substring(0, 8)}...)` } };
          }
          return { [managerId]: null };
        }
      });
      
      const managerData = await Promise.all(managerPromises);
      const managersMap = Object.assign({}, ...managerData);
      setManagers(managersMap);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  }, [employeeId, showError]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const getStatusBadgeClass = (status: MeetingStatus) => {
    switch (status) {
      case MeetingStatus.SCHEDULED:
        return styles.statusScheduled;
      case MeetingStatus.COMPLETED:
        return styles.statusCompleted;
      case MeetingStatus.CANCELLED:
        return styles.statusCancelled;
      case MeetingStatus.RESCHEDULED:
        return styles.statusRescheduled;
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading meetings...</div>
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>1-on-1 Meetings</h2>
          <p>Scheduled meetings with your manager</p>
        </div>
      </div>

      {meetings.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No meetings scheduled yet.</p>
            <p className={styles.note}>
              Your manager will schedule 1-on-1 meetings with you. You&apos;ll receive a notification when a meeting is scheduled.
            </p>
          </div>
        </Card>
      ) : (
        <div className={styles.meetingsList}>
          {meetings.map((meeting) => {
            const manager = managers[meeting.managerId];
            const managerName = manager
              ? `${manager.firstName} ${manager.lastName}`
              : 'Manager';
            
            return (
              <Card key={meeting.id} padding="md" shadow="warm">
                <div className={styles.meetingCard}>
                  <div className={styles.meetingHeader}>
                    <div>
                      <h3>Meeting with {managerName}</h3>
                      <p className={styles.date}>
                        {formatDate(meeting.scheduledDate)}
                      </p>
                    </div>
                    <div className={styles.meetingActions}>
                      <span
                        className={`${styles.status} ${getStatusBadgeClass(
                          meeting.status,
                        )}`}
                      >
                        {meeting.status}
                      </span>
                    </div>
                  </div>
                  {meeting.agenda && (
                    <div className={styles.agenda}>
                      <strong>Agenda:</strong>
                      <p>{meeting.agenda}</p>
                    </div>
                  )}
                  {meeting.meetingNotes && (
                    <div className={styles.notes}>
                      <strong>Notes:</strong>
                      <p>{meeting.meetingNotes}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

