/**
 * CycleList Component
 * Displays a list of appraisal cycles with create/edit functionality
 */

'use client';

import { useState } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { AppraisalCycle } from '../types';
import CycleFormModal from './CycleFormModal';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import { useNotification } from '@/shared/hooks';
import styles from './CycleList.module.css';

interface CycleListProps {
  cycles: AppraisalCycle[];
  onRefresh: () => void;
}

export default function CycleList({ cycles, onRefresh }: CycleListProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification('performance');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<AppraisalCycle | undefined>();
  const [activatingCycleId, setActivatingCycleId] = useState<string | null>(null);
  const [publishingCycleId, setPublishingCycleId] = useState<string | null>(null);
  const [deletingCycleId, setDeletingCycleId] = useState<string | null>(null);

  // REQ-PP-02: HR Manager defines and schedules appraisal cycles (HR_MANAGER ONLY)
  const canActivateCycle = user?.roles?.includes(SystemRole.HR_MANAGER);
  const canPublishCycle = user?.roles?.includes(SystemRole.HR_MANAGER);
  const canDeleteCycle = user?.roles?.includes(SystemRole.HR_MANAGER);
  
  // Debug: Log permissions
  console.log('CycleList - Permissions:', {
    canDeleteCycle,
    userRoles: user?.roles,
    isHrManager: user?.roles?.includes(SystemRole.HR_MANAGER)
  });

  const handleCreateNew = () => {
    setSelectedCycle(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (cycle: AppraisalCycle) => {
    setSelectedCycle(cycle);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCycle(undefined);
  };

  const handleSuccess = () => {
    onRefresh();
    handleModalClose();
  };

  const handleActivate = async (cycle: AppraisalCycle) => {
    if (!cycle._id) {
      showError('Cycle ID is missing');
      return;
    }

    if (cycle.status !== 'PLANNED') {
      showError(`Cannot activate cycle. Current status: ${cycle.status}. Only PLANNED cycles can be activated.`);
      return;
    }

    try {
      setActivatingCycleId(cycle._id);
      await performanceApi.activateCycle(cycle._id);
      showSuccess(`Cycle "${cycle.name}" has been activated successfully. Appraisals have been auto-assigned to eligible employees.`);
      onRefresh();
    } catch (error: any) {
      showError(error.response?.data?.message || error.message || 'Failed to activate cycle');
    } finally {
      setActivatingCycleId(null);
    }
  };

  const handlePublish = async (cycle: AppraisalCycle) => {
    if (!cycle._id) {
      showError('Cycle ID is missing');
      return;
    }

    if (cycle.status !== 'ACTIVE') {
      showError(`Cannot publish cycle. Current status: ${cycle.status}. Only ACTIVE cycles can be published.`);
      return;
    }

    // Confirm before publishing
    const confirmed = window.confirm(
      `Are you sure you want to publish "${cycle.name}"?\n\n` +
      `This will publish all evaluations and assignments in this cycle to employees. ` +
      `Employees will be able to view and acknowledge their appraisal results.\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setPublishingCycleId(cycle._id);
      await performanceApi.publishCycle(cycle._id);
      showSuccess(`Cycle "${cycle.name}" has been published successfully. All evaluations and assignments are now visible to employees.`);
      onRefresh();
    } catch (error: any) {
      showError(error.response?.data?.message || error.message || 'Failed to publish cycle');
    } finally {
      setPublishingCycleId(null);
    }
  };

  const handleDelete = async (cycle: AppraisalCycle) => {
    if (!cycle._id) {
      showError('Cycle ID is missing');
      return;
    }

    if (cycle.status !== 'PLANNED') {
      showError(`Cannot delete cycle. Only PLANNED cycles can be deleted. Current status: ${cycle.status}.`);
      return;
    }

    // Confirm before deleting
    const confirmed = window.confirm(
      `Are you sure you want to delete "${cycle.name}"?\n\n` +
      `This action cannot be undone. The cycle will be permanently removed from the system.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCycleId(cycle._id);
      await performanceApi.deleteCycle(cycle._id);
      showSuccess(`Cycle "${cycle.name}" has been deleted successfully.`);
      onRefresh();
    } catch (error: any) {
      showError(error.response?.data?.message || error.message || 'Failed to delete cycle');
    } finally {
      setDeletingCycleId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'PLANNED':
        return styles.statusPlanned;
      case 'ACTIVE':
        return styles.statusActive;
      case 'CLOSED':
        return styles.statusClosed;
      case 'ARCHIVED':
        return styles.statusArchived;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <>
      <Card padding="lg" shadow="warm">
        <div className={styles.header}>
          <div>
            <h2>Appraisal Cycles</h2>
            <p>Manage performance appraisal cycles and their timelines</p>
          </div>
          <Button variant="primary" onClick={handleCreateNew}>
            + Create Cycle
          </Button>
        </div>

        {cycles.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No cycles found. Create your first appraisal cycle to get started.</p>
          </div>
        ) : (
          <div className={styles.cyclesGrid}>
            {cycles.map((cycle) => (
              <div key={cycle._id} className={styles.cycleCard}>
                <div className={styles.cycleHeader}>
                  <h3>{cycle.name}</h3>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(cycle.status)}`}>
                    {cycle.status || 'PLANNED'}
                  </span>
                </div>
                <div className={styles.cycleDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Type:</span>
                    <span>{cycle.cycleType?.replace('_', ' ') || 'N/A'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>Start Date:</span>
                    <span>{formatDate(cycle.startDate)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.label}>End Date:</span>
                    <span>{formatDate(cycle.endDate)}</span>
                  </div>
                  {cycle.managerDueDate && (
                    <div className={styles.detailRow}>
                      <span className={styles.label}>Manager Deadline:</span>
                      <span>{formatDate(cycle.managerDueDate)}</span>
                    </div>
                  )}
                  {cycle.description && (
                    <div className={styles.description}>
                      <span className={styles.label}>Description:</span>
                      <p>{cycle.description}</p>
                    </div>
                  )}
                </div>
                <div className={styles.cycleActions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(cycle)}
                  >
                    Edit
                  </Button>
                  {canActivateCycle && cycle.status === 'PLANNED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleActivate(cycle)}
                      disabled={activatingCycleId === cycle._id}
                    >
                      {activatingCycleId === cycle._id ? 'Activating...' : 'Activate'}
                    </Button>
                  )}
                  {canPublishCycle && cycle.status === 'ACTIVE' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handlePublish(cycle)}
                      disabled={publishingCycleId === cycle._id}
                    >
                      {publishingCycleId === cycle._id ? 'Publishing...' : 'Publish'}
                    </Button>
                  )}
                  {canDeleteCycle && (
                    <Button
                      variant="error"
                      size="sm"
                      onClick={() => handleDelete(cycle)}
                      disabled={deletingCycleId === cycle._id || cycle.status !== 'PLANNED'}
                      title={cycle.status !== 'PLANNED' ? `Cannot delete cycle. Only PLANNED cycles can be deleted. Current status: ${cycle.status}` : 'Delete cycle'}
                      style={{ opacity: cycle.status !== 'PLANNED' ? 0.6 : 1 }}
                    >
                      {deletingCycleId === cycle._id ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <CycleFormModal
        cycle={selectedCycle}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleSuccess}
      />
    </>
  );
}

