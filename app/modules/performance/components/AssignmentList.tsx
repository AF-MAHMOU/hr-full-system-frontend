/**
 * Assignment List Component
 * Displays and manages appraisal assignments
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { AppraisalAssignment } from '../types';
import { AppraisalAssignmentStatus } from '../types';
import AssignmentModal from './AssignmentModal';
import ExportButton from './ExportButton';
import styles from './AssignmentList.module.css';

interface AssignmentListProps {
  filters?: {
    cycleId?: string;
    templateId?: string;
    employeeProfileId?: string;
    managerProfileId?: string;
    departmentId?: string;
    status?: string;
  };
}

export default function AssignmentList({ filters }: AssignmentListProps) {
  const [assignments, setAssignments] = useState<AppraisalAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AppraisalAssignment | null>(null);
  const [highPerformerAppraisalIds, setHighPerformerAppraisalIds] = useState<Set<string>>(new Set());

  // Fetch all high performers to create a lookup map
  const fetchHighPerformers = async () => {
    try {
      const highPerformers = await performanceApi.getAllHighPerformers();
      // Create a Set of appraisal record IDs that are high performers
      const hpIds = new Set<string>();
      highPerformers.forEach((hp: any) => {
        if (hp._id) {
          hpIds.add(hp._id.toString());
        }
      });
      setHighPerformerAppraisalIds(hpIds);
    } catch (err) {
      // Silently fail - high performer status is optional
      console.warn('Could not fetch high performers:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceApi.getAssignments(filters);
      console.log('[AssignmentList] Fetched assignments:', data);
      if (data.length > 0) {
        console.log('[AssignmentList] Sample assignment structure:', {
          _id: data[0]._id,
          employeeProfileId: data[0].employeeProfileId,
          templateId: data[0].templateId,
          managerProfileId: data[0].managerProfileId,
          fullAssignment: data[0]
        });
      }
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchHighPerformers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleCreateNew = () => {
    setSelectedAssignment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (assignment: AppraisalAssignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      await performanceApi.removeAssignment(id);
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to remove assignment');
    }
  };

  const formatStatus = (status: AppraisalAssignmentStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading assignments...</div>
      </Card>
    );
  }

  if (error && assignments.length === 0) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <h2>Appraisal Assignments</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* REQ-AE-11: HR Employee exports ad-hoc appraisal summaries */}
          {/* Export is available in Assignments tab for ad-hoc summaries */}
          {filters?.cycleId && (
            <ExportButton
              cycleId={filters.cycleId}
              departmentId={filters.departmentId}
              employeeId={filters.employeeProfileId}
              status={filters.status}
              variant="outline"
              size="sm"
            />
          )}
          {/* Note: Generate Outcome Report is in Cycle Progress dashboard (REQ-OD-06) */}
          <Button variant="primary" size="md" onClick={handleCreateNew}>
            + Assign Template
          </Button>
        </div>
      </div>

      {assignments.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No assignments found.</p>
            <Button variant="outline" size="sm" onClick={handleCreateNew}>
              Assign Template
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="lg" shadow="warm">
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Template</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>High Performer</th>
                  <th>Assigned Date</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => {
                  // Handle populated fields - backend returns employeeProfileId, templateId, managerProfileId, departmentId, positionId as populated objects
                  const employee = (assignment as any).employeeProfileId;
                  const template = (assignment as any).templateId;
                  const manager = (assignment as any).managerProfileId;
                  const department = (assignment as any).departmentId;
                  const position = (assignment as any).positionId;
                  
                  // Get employee name
                  const employeeName = employee && typeof employee === 'object'
                    ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.fullName || 'N/A'
                    : 'N/A';
                  
                  // Get department name
                  const departmentName = department && typeof department === 'object'
                    ? department.name || 'N/A'
                    : 'N/A';
                  
                  // Get position title
                  const positionTitle = position && typeof position === 'object'
                    ? position.title || 'N/A'
                    : 'N/A';
                  
                  // Get template name
                  const templateName = template && typeof template === 'object'
                    ? template.name || 'N/A'
                    : 'N/A';
                  
                  // Get manager name
                  const managerName = manager && typeof manager === 'object'
                    ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || manager.fullName || 'N/A'
                    : 'N/A';
                  
                  // Check if this assignment's evaluation is flagged as high performer
                  const appraisalId = assignment.latestAppraisalId;
                  let isHighPerformer = false;
                  if (appraisalId) {
                    // Handle both object (populated) and string (ID) formats
                    const appraisalIdStr = typeof appraisalId === 'object' 
                      ? ((appraisalId as any)._id?.toString() || (appraisalId as any).toString())
                      : appraisalId.toString();
                    isHighPerformer = highPerformerAppraisalIds.has(appraisalIdStr);
                  }
                  
                  return (
                  <tr key={assignment._id}>
                    <td>{employeeName}</td>
                    <td>{departmentName}</td>
                    <td>{positionTitle}</td>
                    <td>{templateName}</td>
                    <td>{managerName}</td>
                    <td>
                      <span className={`${styles.status} ${styles[assignment.status.toLowerCase()]}`}>
                        {formatStatus(assignment.status)}
                      </span>
                    </td>
                    <td>
                      {isHighPerformer ? (
                        <span className={styles.highPerformerBadge} title="Flagged as High Performer">
                          ⭐ High Performer
                        </span>
                      ) : (
                        <span className={styles.notHighPerformer}>-</span>
                      )}
                    </td>
                    <td>{formatDate(assignment.assignedAt)}</td>
                    <td>{formatDate(assignment.dueDate)}</td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(assignment)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => assignment._id && handleDelete(assignment._id)}
                          disabled={
                            assignment.status === AppraisalAssignmentStatus.SUBMITTED ||
                            assignment.status === AppraisalAssignmentStatus.PUBLISHED ||
                            assignment.status === AppraisalAssignmentStatus.ACKNOWLEDGED
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <AssignmentModal
        assignment={selectedAssignment}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAssignment(null);
        }}
        onSuccess={() => {
          setIsModalOpen(false);
          setSelectedAssignment(null);
          fetchAssignments();
        }}
      />
      
    </>
  );
}

