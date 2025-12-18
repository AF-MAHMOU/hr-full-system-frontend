/**
 * EmployeeGoalsView Component
 * REQ-PP-12: Employee views goals set by their line manager
 * Read-only view for employees to see their assigned goals
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/shared/components';
import { useNotification } from '@/shared/hooks/useNotification';
import { performanceApi, type PerformanceGoal } from '../api/performanceApi';
import styles from './EmployeeGoalsView.module.css';

interface EmployeeGoalsViewProps {
  employeeId: string;
}

export default function EmployeeGoalsView({ employeeId }: EmployeeGoalsViewProps) {
  const { showError } = useNotification();
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await performanceApi.getGoalsByEmployee(employeeId, statusFilter || undefined);
      setGoals(data);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [employeeId, statusFilter, showError]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return styles.statusCompleted;
      case 'IN_PROGRESS':
        return styles.statusInProgress;
      case 'NOT_STARTED':
        return styles.statusNotStarted;
      case 'CANCELLED':
        return styles.statusCancelled;
      case 'ON_HOLD':
        return styles.statusOnHold;
      default:
        return '';
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const calculateProgress = (goal: PerformanceGoal): number => {
    if (!goal.targetValue || goal.targetValue === 0) return 0;
    if (goal.currentValue === undefined) return 0;
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>My Goals</h2>
        <div className={styles.actions}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="ON_HOLD">On Hold</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Card padding="lg">
          <p>Loading goals...</p>
        </Card>
      ) : goals.length === 0 ? (
        <Card padding="lg">
          <p>No goals assigned yet. Your line manager will set goals for you.</p>
        </Card>
      ) : (
        <div className={styles.goalsGrid}>
          {goals.map((goal) => {
            const progress = calculateProgress(goal);
            return (
              <Card key={goal.id} padding="md" className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <h3>{goal.goalTitle}</h3>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>
                <div className={styles.goalMeta}>
                  <p><strong>Start Date:</strong> {formatDate(goal.startDate)}</p>
                  <p><strong>Due Date:</strong> {formatDate(goal.dueDate)}</p>
                  {goal.category && (
                    <p><strong>Category:</strong> {goal.category}</p>
                  )}
                  {goal.priority && (
                    <p><strong>Priority:</strong> {goal.priority}</p>
                  )}
                </div>
                <p className={styles.description}>{goal.description}</p>
                
                {goal.targetMetric && goal.targetValue !== undefined && (
                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span><strong>Target:</strong> {goal.targetValue} {goal.targetUnit || ''} {goal.targetMetric}</span>
                      {goal.currentValue !== undefined && (
                        <span><strong>Current:</strong> {goal.currentValue} {goal.targetUnit || ''}</span>
                      )}
                    </div>
                    {goal.currentValue !== undefined && goal.targetValue > 0 && (
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    {goal.currentValue !== undefined && goal.targetValue > 0 && (
                      <div className={styles.progressText}>
                        {progress}% Complete
                      </div>
                    )}
                  </div>
                )}

                {goal.finalComments && (
                  <div className={styles.comments}>
                    <strong>Manager Comments:</strong> {goal.finalComments}
                  </div>
                )}

                {goal.completedAt && (
                  <div className={styles.completedInfo}>
                    <strong>Completed:</strong> {formatDate(goal.completedAt)}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

