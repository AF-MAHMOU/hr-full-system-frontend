/**
 * ManagerReviewsView Component
 * Displays direct reports' appraisal assignments for managers to review (REQ-AE-03)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { useNotification } from '@/shared/hooks/useNotification';
import type { AppraisalAssignment, AppraisalCycle, PerformanceImprovementPlan } from '../types';
import { AppraisalAssignmentStatus } from '../types';
import ManagerReviewForm from './ManagerReviewForm';
import PIPFormModal from './PIPFormModal';
import PIPViewModal from './PIPViewModal';
import styles from './ManagerReviewsView.module.css';

interface ManagerReviewsViewProps {
  managerId: string;
}

export default function ManagerReviewsView({ managerId }: ManagerReviewsViewProps) {
  const [assignments, setAssignments] = useState<AppraisalAssignment[]>([]);
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [employeePIPs, setEmployeePIPs] = useState<Map<string, PerformanceImprovementPlan[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<AppraisalAssignment | null>(null);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [isPIPFormOpen, setIsPIPFormOpen] = useState(false);
  const [selectedPIPAppraisalId, setSelectedPIPAppraisalId] = useState<string>('');
  const [existingPIP, setExistingPIP] = useState<PerformanceImprovementPlan | null>(null);
  const [selectedPIPForView, setSelectedPIPForView] = useState<PerformanceImprovementPlan | null>(null);
  const [isPIPViewOpen, setIsPIPViewOpen] = useState(false);
  const { showError } = useNotification();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentsData, cyclesData] = await Promise.all([
        performanceApi.getManagerAssignments(managerId),
        performanceApi.getCycles(),
      ]);
      setAssignments(assignmentsData);
      setCycles(cyclesData);

      // Fetch PIPs for all employees in the assignments
      const employeeIds = new Set<string>();
      assignmentsData.forEach((assignment: any) => {
        const employee = assignment.employeeProfileId || assignment.employee;
        if (employee && typeof employee === 'object' && employee._id) {
          employeeIds.add(employee._id.toString());
        } else if (employee && typeof employee === 'string') {
          employeeIds.add(employee);
        }
      });

      // Fetch PIPs for each employee
      const pipsMap = new Map<string, PerformanceImprovementPlan[]>();
      for (const empId of employeeIds) {
        try {
          const pips = await performanceApi.getPIPsByEmployee(empId);
          if (pips && pips.length > 0) {
            pipsMap.set(empId, pips);
          }
        } catch (err) {
          // Employee might not have PIPs, that's fine
          console.debug(`No PIPs found for employee ${empId}`);
        }
      }
      setEmployeePIPs(pipsMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [managerId]);

  const fetchAssignments = useCallback(async (cycleId?: string) => {
    try {
      setLoading(true);
      const data = await performanceApi.getManagerAssignments(managerId, cycleId);
      setAssignments(data);

      // Fetch PIPs for all employees in the assignments
      const employeeIds = new Set<string>();
      data.forEach((assignment: any) => {
        const employee = assignment.employeeProfileId || assignment.employee;
        if (employee && typeof employee === 'object' && employee._id) {
          employeeIds.add(employee._id.toString());
        } else if (employee && typeof employee === 'string') {
          employeeIds.add(employee);
        }
      });

      // Fetch PIPs for each employee
      const pipsMap = new Map<string, PerformanceImprovementPlan[]>();
      for (const empId of employeeIds) {
        try {
          const pips = await performanceApi.getPIPsByEmployee(empId);
          if (pips && pips.length > 0) {
            pipsMap.set(empId, pips);
          }
        } catch (err) {
          // Employee might not have PIPs, that's fine
          console.debug(`No PIPs found for employee ${empId}`);
        }
      }
      setEmployeePIPs(pipsMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [managerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedCycleId) {
      fetchAssignments(selectedCycleId);
    } else {
      fetchAssignments();
    }
  }, [selectedCycleId, fetchAssignments]);

  const formatStatus = (status: AppraisalAssignmentStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: AppraisalAssignmentStatus) => {
    switch (status) {
      case AppraisalAssignmentStatus.NOT_STARTED:
        return styles.statusNotStarted;
      case AppraisalAssignmentStatus.IN_PROGRESS:
        return styles.statusInProgress;
      case AppraisalAssignmentStatus.SUBMITTED:
        return styles.statusSubmitted;
      case AppraisalAssignmentStatus.PUBLISHED:
        return styles.statusPublished;
      case AppraisalAssignmentStatus.ACKNOWLEDGED:
        return styles.statusAcknowledged;
      default:
        return styles.statusDefault;
    }
  };

  const handleReviewClick = (assignment: AppraisalAssignment) => {
    setSelectedAssignment(assignment);
    setIsReviewFormOpen(true);
  };

  const handleReviewSuccess = () => {
    setIsReviewFormOpen(false);
    setSelectedAssignment(null);
    fetchAssignments(selectedCycleId || undefined);
  };

  const handleCreatePIP = async (assignment: AppraisalAssignment) => {
    try {
      // Get the evaluation/appraisal record ID
      const evaluationId = (assignment as any).latestAppraisalId;
      if (!evaluationId) {
        showError('No appraisal record found for this assignment. Please complete the review first.');
        return;
      }

      // Check if PIP already exists
      let existing: PerformanceImprovementPlan | null = null;
      try {
        existing = await performanceApi.getPIPByAppraisalId(evaluationId);
      } catch (err: any) {
        // PIP doesn't exist yet, that's fine
        existing = null;
      }

      setExistingPIP(existing);
      setSelectedPIPAppraisalId(evaluationId);
      setIsPIPFormOpen(true);
    } catch (err: any) {
      console.error('Error checking for existing PIP:', err);
      setExistingPIP(null);
      const evaluationId = (assignment as any).latestAppraisalId;
      if (evaluationId) {
        setSelectedPIPAppraisalId(evaluationId);
        setIsPIPFormOpen(true);
      } else {
        showError('No appraisal record found for this assignment. Please complete the review first.');
      }
    }
  };

  const handlePIPSuccess = () => {
    setIsPIPFormOpen(false);
    setSelectedPIPAppraisalId('');
    setExistingPIP(null);
    fetchAssignments(selectedCycleId || undefined);
  };

  if (loading && assignments.length === 0) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading team reviews...</div>
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
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Team Reviews</h2>
          <p>Review and complete appraisals for your direct reports</p>
        </div>
        {cycles.length > 0 && (
          <div className={styles.filter}>
            <label htmlFor="cycleFilter">Filter by Cycle:</label>
            <select
              id="cycleFilter"
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className={styles.select}
            >
              <option value="">All Cycles</option>
              {cycles.map((cycle) => (
                <option key={cycle._id} value={cycle._id}>
                  {cycle.name} ({cycle.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {assignments.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No team reviews found.</p>
            <p className={styles.note}>
              {selectedCycleId
                ? 'No assignments found for the selected cycle.'
                : 'You don\'t have any direct reports with appraisal assignments yet.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className={styles.employeesList}>
          {(() => {
            // Group assignments by employee
            const employeeMap = new Map<string, {
              employee: any;
              assignments: AppraisalAssignment[];
              pips: PerformanceImprovementPlan[];
            }>();

            assignments.forEach((assignment) => {
              const employee = (assignment as any).employeeProfileId || assignment.employee;
              let employeeId = '';
              let employeeObj: any = null;

              if (employee && typeof employee === 'object') {
                employeeId = employee._id?.toString() || employee.toString();
                employeeObj = employee;
              } else if (employee) {
                employeeId = employee.toString();
              }

              if (!employeeId) return;

              if (!employeeMap.has(employeeId)) {
                const pips = employeePIPs.get(employeeId) || [];
                employeeMap.set(employeeId, {
                  employee: employeeObj,
                  assignments: [],
                  pips,
                });
              }

              employeeMap.get(employeeId)!.assignments.push(assignment);
            });

            return Array.from(employeeMap.values()).map((employeeData, idx) => {
              const employee = employeeData.employee;
              const employeeName = employee && typeof employee === 'object'
                ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Employee'
                : 'Employee';
              const employeeId = employee?._id?.toString() || employee?.toString() || '';

              return (
                <Card key={employeeId || idx} padding="lg" shadow="warm" className={styles.employeeCard}>
                  <div className={styles.employeeHeader}>
                    <h3>{employeeName}</h3>
                    {employee?.workEmail && (
                      <span className={styles.employeeEmail}>{employee.workEmail}</span>
                    )}
                  </div>

                  {/* Appraisal Assignments Section */}
                  <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Appraisal Assignments</h4>
                    {employeeData.assignments.length === 0 ? (
                      <p className={styles.noData}>No appraisal assignments</p>
                    ) : (
                      <div className={styles.assignmentsList}>
                        {employeeData.assignments.map((assignment) => {
                          const template = (assignment as any).templateId || assignment.template;
                          const cycle = (assignment as any).cycleId || assignment.cycle;
                          
                          return (
                            <div key={assignment._id} className={styles.assignmentItem}>
                              <div className={styles.assignmentHeader}>
                                <span className={styles.assignmentTitle}>
                                  {template && typeof template === 'object' ? template.name : 'Appraisal'}
                                </span>
                                <span className={`${styles.statusBadge} ${getStatusBadgeClass(assignment.status)}`}>
                                  {formatStatus(assignment.status)}
                                </span>
                              </div>
                              <div className={styles.assignmentDetails}>
                                <span>Cycle: {cycle && typeof cycle === 'object' ? cycle.name : 'N/A'}</span>
                                <span>Due: {formatDate(assignment.dueDate)}</span>
                              </div>
                              <div className={styles.assignmentActions}>
                                {/* Manager can review when employee has submitted (REQ-AE-03) */}
                                {/* Show "Review" button for SUBMITTED, IN_PROGRESS, NOT_STARTED, ACKNOWLEDGED */}
                                {(assignment.status === AppraisalAssignmentStatus.SUBMITTED ||
                                  assignment.status === AppraisalAssignmentStatus.IN_PROGRESS ||
                                  assignment.status === AppraisalAssignmentStatus.NOT_STARTED ||
                                  assignment.status === AppraisalAssignmentStatus.ACKNOWLEDGED) && (
                                  <Button
                                    onClick={() => handleReviewClick(assignment)}
                                    variant="primary"
                                    size="sm"
                                  >
                                    Review
                                  </Button>
                                )}
                                {/* View/Edit review for PUBLISHED (in case manager needs to update) */}
                                {assignment.status === AppraisalAssignmentStatus.PUBLISHED && (
                                  <Button
                                    onClick={() => handleReviewClick(assignment)}
                                    variant="secondary"
                                    size="sm"
                                  >
                                    View/Edit Review
                                  </Button>
                                )}
                                {(assignment.status === AppraisalAssignmentStatus.SUBMITTED ||
                                  assignment.status === AppraisalAssignmentStatus.PUBLISHED ||
                                  assignment.status === AppraisalAssignmentStatus.ACKNOWLEDGED) && (
                                  <Button
                                    onClick={() => handleCreatePIP(assignment)}
                                    variant="secondary"
                                    size="sm"
                                  >
                                    Create PIP
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Performance Improvement Plans Section */}
                  {employeeData.pips.length > 0 && (
                    <div className={styles.section}>
                      <h4 className={styles.sectionTitle}>Performance Improvement Plans</h4>
                      <div className={styles.pipsList}>
                        {employeeData.pips.map((pip) => {
                          const getPIPStatusClass = (status: string) => {
                            switch (status) {
                              case 'DRAFT':
                                return styles.pipStatusDraft;
                              case 'ACTIVE':
                                return styles.pipStatusActive;
                              case 'COMPLETED':
                                return styles.pipStatusCompleted;
                              case 'CANCELLED':
                                return styles.pipStatusCancelled;
                              default:
                                return styles.pipStatusDefault;
                            }
                          };

                          return (
                            <div key={pip.appraisalRecordId} className={styles.pipItem}>
                              <div className={styles.pipHeader}>
                                <span className={styles.pipTitle}>{pip.title}</span>
                                <span className={`${styles.statusBadge} ${getPIPStatusClass(pip.status)}`}>
                                  {pip.status}
                                </span>
                              </div>
                              <div className={styles.pipDetails}>
                                <span>Start: {formatDate(pip.startDate)}</span>
                                <span>Target: {formatDate(pip.targetCompletionDate)}</span>
                                {pip.actualCompletionDate && (
                                  <span>Completed: {formatDate(pip.actualCompletionDate)}</span>
                                )}
                              </div>
                              <div className={styles.pipActions}>
                                <Button
                                  onClick={() => {
                                    setSelectedPIPForView(pip);
                                    setIsPIPViewOpen(true);
                                  }}
                                  variant="primary"
                                  size="sm"
                                >
                                  View Details
                                </Button>
                                <Button
                                  onClick={async () => {
                                    try {
                                      const existing = await performanceApi.getPIPByAppraisalId(pip.appraisalRecordId);
                                      setExistingPIP(existing);
                                      setSelectedPIPAppraisalId(pip.appraisalRecordId);
                                      setIsPIPFormOpen(true);
                                    } catch (err) {
                                      setExistingPIP(null);
                                      setSelectedPIPAppraisalId(pip.appraisalRecordId);
                                      setIsPIPFormOpen(true);
                                    }
                                  }}
                                  variant="secondary"
                                  size="sm"
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            });
          })()}
        </div>
      )}

      {isReviewFormOpen && selectedAssignment && (
        <ManagerReviewForm
          assignment={selectedAssignment}
          isOpen={isReviewFormOpen}
          onClose={() => {
            setIsReviewFormOpen(false);
            setSelectedAssignment(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}

      {isPIPFormOpen && selectedPIPAppraisalId && (
        <PIPFormModal
          isOpen={isPIPFormOpen}
          onClose={() => {
            setIsPIPFormOpen(false);
            setSelectedPIPAppraisalId('');
            setExistingPIP(null);
          }}
          onSuccess={handlePIPSuccess}
          appraisalRecordId={selectedPIPAppraisalId}
          existingPIP={existingPIP}
        />
      )}

      {isPIPViewOpen && selectedPIPForView && (
        <PIPViewModal
          pip={selectedPIPForView}
          isOpen={isPIPViewOpen}
          onClose={() => {
            setIsPIPViewOpen(false);
            setSelectedPIPForView(null);
          }}
        />
      )}
    </div>
  );
}

