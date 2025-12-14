'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Input } from '@/shared/components';
import { useNotification } from '@/shared/hooks/useNotification';
import { useAuth } from '@/shared/hooks/useAuth';
import { performanceApi } from '../api/performanceApi';
import type {
  OneOnOneMeeting,
  CreateOneOnOneMeetingDto,
  UpdateOneOnOneMeetingDto,
} from '../types';
import { MeetingStatus } from '../types';
import { hrApi } from '@/app/modules/hr/api/hrApi';
import styles from './OneOnOneMeetingsView.module.css';

export default function OneOnOneMeetingsView() {
  const { showSuccess, showError } = useNotification();
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<OneOnOneMeeting[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<OneOnOneMeeting | null>(null);
  const [formData, setFormData] = useState<CreateOneOnOneMeetingDto>({
    employeeId: '',
    scheduledDate: '',
    agenda: '',
    meetingNotes: '',
  });

  const managerId = user?.userid;

  const fetchMeetings = useCallback(async () => {
    if (!managerId) return;
    try {
      setLoading(true);
      const data = await performanceApi.getMeetingsByManager(managerId);
      setMeetings(data);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  }, [managerId, showError]);

  const fetchEmployees = useCallback(async () => {
    if (!managerId) return;
    try {
      // Get team members from manager assignments
      const assignments = await performanceApi.getManagerAssignments(managerId);
      // Extract employee IDs - handle both string and object (populated) cases
      const uniqueEmployeeIds = [...new Set(
        assignments.map(a => {
          const empId = a.employeeProfileId;
          // If it's an object (populated), extract _id, otherwise use the string
          return typeof empId === 'object' && empId !== null 
            ? (empId as any)._id || (empId as any).toString()
            : empId?.toString() || empId;
        }).filter(id => id) // Filter out any null/undefined values
      )];
      
      // Fetch employee details for each unique employee
      const employeePromises = uniqueEmployeeIds.map(async (empId) => {
        try {
          // Ensure empId is a string
          const empIdString = typeof empId === 'object' && empId !== null
            ? (empId as any)._id || (empId as any).toString()
            : String(empId);
          const emp = await hrApi.getEmployeeById(empIdString);
          return emp;
        } catch (err) {
          console.error(`Failed to fetch employee ${empId}:`, err);
          return null;
        }
      });
      
      const employeeData = await Promise.all(employeePromises);
      setEmployees(employeeData.filter(e => e !== null));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      setEmployees([]);
    }
  }, [managerId]);

  useEffect(() => {
    fetchMeetings();
    fetchEmployees();
  }, [fetchMeetings, fetchEmployees]);

  const handleOpenModal = (meeting?: OneOnOneMeeting) => {
    if (meeting) {
      setEditingMeeting(meeting);
      setFormData({
        employeeId: meeting.employeeId,
        scheduledDate: meeting.scheduledDate.split('T')[0] + 'T' + meeting.scheduledDate.split('T')[1]?.substring(0, 5) || '',
        agenda: meeting.agenda || '',
        meetingNotes: meeting.meetingNotes || '',
      });
    } else {
      setEditingMeeting(null);
      setFormData({
        employeeId: '',
        scheduledDate: '',
        agenda: '',
        meetingNotes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMeeting(null);
    setFormData({
      employeeId: '',
      scheduledDate: '',
      agenda: '',
      meetingNotes: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingMeeting) {
        await performanceApi.updateOneOnOneMeeting(editingMeeting.id!, formData as UpdateOneOnOneMeetingDto);
        showSuccess('Meeting updated successfully');
      } else {
        await performanceApi.createOneOnOneMeeting(formData);
        showSuccess('Meeting scheduled successfully');
      }
      handleCloseModal();
      fetchMeetings();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to save meeting');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) {
      return;
    }
    try {
      await performanceApi.deleteOneOnOneMeeting(id);
      showSuccess('Meeting deleted successfully');
      fetchMeetings();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to delete meeting');
    }
  };

  const handleStatusChange = async (id: string, status: MeetingStatus) => {
    try {
      await performanceApi.updateOneOnOneMeeting(id, { status });
      showSuccess('Meeting status updated successfully');
      fetchMeetings();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to update meeting status');
    }
  };

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
          <h1>1-on-1 Meetings</h1>
          <p>Schedule and manage one-on-one meetings with your team members</p>
        </div>
        <Button onClick={() => handleOpenModal()} variant="primary">
          Schedule Meeting
        </Button>
      </div>

      {meetings.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No meetings scheduled yet.</p>
            <Button onClick={() => handleOpenModal()} variant="primary">
              Schedule First Meeting
            </Button>
          </div>
        </Card>
      ) : (
        <div className={styles.meetingsList}>
          {meetings.map((meeting) => {
            const employee = employees.find(e => e._id === meeting.employeeId);
            return (
              <Card key={meeting.id} padding="md" shadow="warm">
                <div className={styles.meetingCard}>
                  <div className={styles.meetingHeader}>
                    <div>
                      <h3>
                        {employee
                          ? `${employee.firstName} ${employee.lastName}`
                          : 'Employee'}
                      </h3>
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
                      {meeting.status === MeetingStatus.SCHEDULED && (
                        <>
                          <Button
                            onClick={() => handleOpenModal(meeting)}
                            variant="secondary"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() =>
                              handleStatusChange(meeting.id!, MeetingStatus.COMPLETED)
                            }
                            variant="success"
                            size="sm"
                          >
                            Mark Complete
                          </Button>
                          <Button
                            onClick={() =>
                              handleStatusChange(meeting.id!, MeetingStatus.CANCELLED)
                            }
                            variant="error"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => handleDelete(meeting.id!)}
                        variant="error"
                        size="sm"
                      >
                        Delete
                      </Button>
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

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
        size="lg"
      >
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Employee *</label>
            <select
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
              className={styles.select}
              disabled={!!editingMeeting}
            >
              <option value="">Select an employee...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Scheduled Date & Time *</label>
            <Input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) =>
                setFormData({ ...formData, scheduledDate: e.target.value })
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label>Agenda</label>
            <Input
              value={formData.agenda}
              onChange={(e) =>
                setFormData({ ...formData, agenda: e.target.value })
              }
              placeholder="Meeting agenda or topics to discuss"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Notes</label>
            <textarea
              value={formData.meetingNotes}
              onChange={(e) =>
                setFormData({ ...formData, meetingNotes: e.target.value })
              }
              placeholder="Additional notes or preparation items"
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.formActions}>
            <Button onClick={handleCloseModal} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={!formData.employeeId || !formData.scheduledDate}
            >
              {editingMeeting ? 'Update' : 'Schedule'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

