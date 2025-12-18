/**
 * GoalsView Component
 * REQ-PP-12: Line Manager sets and reviews employee objectives
 * Displays and manages performance goals for direct reports
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Input } from '@/shared/components';
import { useNotification } from '@/shared/hooks/useNotification';
import { performanceApi, type PerformanceGoal, type CreatePerformanceGoalDto, type UpdatePerformanceGoalDto } from '../api/performanceApi';
import { hrApi } from '@/app/modules/hr/api/hrApi';
import styles from './GoalsView.module.css';

interface GoalsViewProps {
  managerId: string;
}

export default function GoalsView({ managerId }: GoalsViewProps) {
  const { showSuccess, showError } = useNotification();
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [formData, setFormData] = useState<CreatePerformanceGoalDto>({
    goalTitle: '',
    description: '',
    employeeId: '',
    setBy: managerId,
    cycleId: '',
    category: '',
    type: '',
    priority: '',
    targetMetric: '',
    targetValue: undefined,
    targetUnit: '',
    startDate: '',
    dueDate: '',
  });

  const fetchEmployees = useCallback(async () => {
    try {
      // Get team members from manager assignments
      const assignments = await performanceApi.getManagerAssignments(managerId);
      const uniqueEmployeeIds = [...new Set(
        assignments.map(a => {
          const empId = a.employeeProfileId;
          return typeof empId === 'object' && empId !== null 
            ? (empId as any)._id || (empId as any).toString()
            : empId?.toString() || empId;
        }).filter(id => id)
      )];
      
      const employeePromises = uniqueEmployeeIds.map(async (empId) => {
        try {
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

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch goals for all employees
      const allGoalsPromises = employees.map(async (emp) => {
        try {
          const empId = emp._id || emp.id;
          const employeeGoals = await performanceApi.getGoalsByEmployee(empId, statusFilter || undefined);
          return employeeGoals.map(goal => ({ ...goal, employeeName: `${emp.firstName} ${emp.lastName}` }));
        } catch (err) {
          console.error(`Failed to fetch goals for employee ${emp._id}:`, err);
          return [];
        }
      });
      
      const allGoalsArrays = await Promise.all(allGoalsPromises);
      const allGoals = allGoalsArrays.flat();
      setGoals(allGoals);
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  }, [employees, statusFilter, showError]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (employees.length > 0) {
      fetchGoals();
    }
  }, [employees, statusFilter, fetchGoals]);

  const handleOpenModal = (goal?: PerformanceGoal, employeeId?: string) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        goalTitle: goal.goalTitle,
        description: goal.description,
        employeeId: goal.employeeId,
        setBy: goal.setBy,
        cycleId: goal.cycleId || '',
        category: goal.category || '',
        type: goal.type || '',
        priority: goal.priority || '',
        targetMetric: goal.targetMetric || '',
        targetValue: goal.targetValue,
        targetUnit: goal.targetUnit || '',
        startDate: goal.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : '',
        dueDate: goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : '',
      });
    } else {
      setEditingGoal(null);
      setFormData({
        goalTitle: '',
        description: '',
        employeeId: employeeId || '',
        setBy: managerId,
        cycleId: '',
        category: '',
        type: '',
        priority: '',
        targetMetric: '',
        targetValue: undefined,
        targetUnit: '',
        startDate: '',
        dueDate: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
    setFormData({
      goalTitle: '',
      description: '',
      employeeId: '',
      setBy: managerId,
      cycleId: '',
      category: '',
      type: '',
      priority: '',
      targetMetric: '',
      targetValue: undefined,
      targetUnit: '',
      startDate: '',
      dueDate: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        const updateData: UpdatePerformanceGoalDto = {
          goalTitle: formData.goalTitle,
          description: formData.description,
          category: formData.category || undefined,
          type: formData.type || undefined,
          priority: formData.priority || undefined,
          targetMetric: formData.targetMetric || undefined,
          targetValue: formData.targetValue,
          targetUnit: formData.targetUnit || undefined,
          startDate: formData.startDate || undefined,
          dueDate: formData.dueDate || undefined,
        };
        await performanceApi.updateGoal(editingGoal.id!, updateData);
        showSuccess('Goal updated successfully');
      } else {
        await performanceApi.createGoal(formData);
        showSuccess('Goal created successfully');
      }
      handleCloseModal();
      fetchGoals();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    try {
      await performanceApi.deleteGoal(goalId);
      showSuccess('Goal deleted successfully');
      fetchGoals();
    } catch (error: any) {
      showError(error?.response?.data?.message || 'Failed to delete goal');
    }
  };

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

  const filteredGoals = selectedEmployeeId
    ? goals.filter(g => g.employeeId === selectedEmployeeId)
    : goals;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Employee Goals</h2>
        <div className={styles.actions}>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp._id || emp.id} value={emp._id || emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
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
          <Button
            variant="primary"
            size="md"
            onClick={() => handleOpenModal()}
          >
            + Create Goal
          </Button>
        </div>
      </div>

      {loading ? (
        <Card padding="lg">
          <p>Loading goals...</p>
        </Card>
      ) : filteredGoals.length === 0 ? (
        <Card padding="lg">
          <p>No goals found. Create a goal to get started.</p>
        </Card>
      ) : (
        <div className={styles.goalsGrid}>
          {filteredGoals.map((goal) => (
            <Card key={goal.id} padding="md" className={styles.goalCard}>
              <div className={styles.goalHeader}>
                <h3>{goal.goalTitle}</h3>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(goal.status)}`}>
                  {goal.status.replace('_', ' ')}
                </span>
              </div>
              <div className={styles.goalMeta}>
                <p><strong>Employee:</strong> {(goal as any).employeeName || 'N/A'}</p>
                <p><strong>Start Date:</strong> {formatDate(goal.startDate)}</p>
                <p><strong>Due Date:</strong> {formatDate(goal.dueDate)}</p>
                {goal.targetMetric && (
                  <p><strong>Target:</strong> {goal.targetValue} {goal.targetUnit || ''} {goal.targetMetric}</p>
                )}
                {goal.currentValue !== undefined && (
                  <p><strong>Current:</strong> {goal.currentValue} {goal.targetUnit || ''}</p>
                )}
              </div>
              <p className={styles.description}>{goal.description}</p>
              {goal.finalComments && (
                <div className={styles.comments}>
                  <strong>Comments:</strong> {goal.finalComments}
                </div>
              )}
              <div className={styles.goalActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenModal(goal)}
                >
                  Edit
                </Button>
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => handleDelete(goal.id!)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingGoal ? 'Edit Goal' : 'Create Goal'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Employee *</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              required
              disabled={!!editingGoal}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id || emp.id} value={emp._id || emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Goal Title *</label>
            <Input
              type="text"
              value={formData.goalTitle}
              onChange={(e) => setFormData({ ...formData, goalTitle: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Start Date *</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Due Date *</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Category</label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="">Select Priority</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Target Metric</label>
              <Input
                type="text"
                value={formData.targetMetric}
                onChange={(e) => setFormData({ ...formData, targetMetric: e.target.value })}
                placeholder="e.g., Sales, Projects"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Target Value</label>
              <Input
                type="number"
                value={formData.targetValue || ''}
                onChange={(e) => setFormData({ ...formData, targetValue: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Unit</label>
              <Input
                type="text"
                value={formData.targetUnit}
                onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
                placeholder="e.g., %, units"
              />
            </div>
          </div>

          {editingGoal && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={(editingGoal as any).status || 'NOT_STARTED'}
                  onChange={(e) => {
                    const updateData: UpdatePerformanceGoalDto = { status: e.target.value as any };
                    performanceApi.updateGoal(editingGoal.id!, updateData).then(() => {
                      fetchGoals();
                      handleCloseModal();
                      showSuccess('Goal status updated');
                    }).catch((err) => {
                      showError(err?.response?.data?.message || 'Failed to update status');
                    });
                  }}
                >
                  <option value="NOT_STARTED">Not Started</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Current Value</label>
                <Input
                  type="number"
                  value={(editingGoal as any).currentValue || ''}
                  onChange={(e) => {
                    const updateData: UpdatePerformanceGoalDto = { currentValue: e.target.value ? Number(e.target.value) : undefined };
                    performanceApi.updateGoal(editingGoal.id!, updateData).then(() => {
                      fetchGoals();
                      showSuccess('Progress updated');
                    }).catch((err) => {
                      showError(err?.response?.data?.message || 'Failed to update progress');
                    });
                  }}
                />
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingGoal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

