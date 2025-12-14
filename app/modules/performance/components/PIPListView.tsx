/**
 * PIPListView Component
 * Displays list of Performance Improvement Plans for a manager
 * REQ-OD-05: Line Manager initiates Performance Improvement Plans
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { useNotification } from '@/shared/hooks/useNotification';
import type { PerformanceImprovementPlan } from '../types';
import PIPFormModal from './PIPFormModal';
import styles from './PIPListView.module.css';

interface PIPListViewProps {
  managerId: string;
  employeeId?: string; // Optional: filter by employee
  showAllPIPs?: boolean; // If true, show all PIPs (for HR Managers/Admins), otherwise show only manager's PIPs
}

export default function PIPListView({ managerId, employeeId, showAllPIPs = false }: PIPListViewProps) {
  const { showSuccess, showError } = useNotification();
  const [pips, setPips] = useState<PerformanceImprovementPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPIP, setSelectedPIP] = useState<PerformanceImprovementPlan | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppraisalId, setSelectedAppraisalId] = useState<string>('');

  const fetchPIPs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: PerformanceImprovementPlan[];
      if (employeeId) {
        data = await performanceApi.getPIPsByEmployee(employeeId);
      } else if (showAllPIPs) {
        // HR Managers/Admins can see all PIPs
        data = await performanceApi.getAllPIPs();
      } else {
        // Department Heads see only their own PIPs
        data = await performanceApi.getPIPsByManager(managerId);
      }
      
      setPips(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load Performance Improvement Plans');
      console.error('Error fetching PIPs:', err);
    } finally {
      setLoading(false);
    }
  }, [managerId, employeeId, showAllPIPs]);

  useEffect(() => {
    fetchPIPs();
  }, [fetchPIPs]);

  const handleCreatePIP = (appraisalRecordId: string) => {
    setSelectedAppraisalId(appraisalRecordId);
    setSelectedPIP(null);
    setIsFormOpen(true);
  };

  const handleEditPIP = (pip: PerformanceImprovementPlan) => {
    setSelectedAppraisalId(pip.appraisalRecordId);
    setSelectedPIP(pip);
    setIsFormOpen(true);
  };

  const handleDeletePIP = async (pip: PerformanceImprovementPlan) => {
    if (!confirm(`Are you sure you want to delete the PIP "${pip.title}"?`)) {
      return;
    }

    try {
      await performanceApi.deletePIP(pip.appraisalRecordId);
      showSuccess('Performance Improvement Plan deleted successfully');
      fetchPIPs();
    } catch (err: any) {
      console.error('Error deleting PIP:', err);
      showError(err.response?.data?.message || err.message || 'Failed to delete Performance Improvement Plan');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return styles.statusDraft;
      case 'ACTIVE':
        return styles.statusActive;
      case 'COMPLETED':
        return styles.statusCompleted;
      case 'CANCELLED':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && pips.length === 0) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading Performance Improvement Plans...</div>
      </Card>
    );
  }

  if (error && pips.length === 0) {
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
        <h2>Performance Improvement Plans</h2>
        <p>
          {showAllPIPs 
            ? 'View and manage all Performance Improvement Plans across the organization'
            : 'Manage Performance Improvement Plans for your team'}
        </p>
      </div>

      {pips.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No Performance Improvement Plans found.</p>
            <p className={styles.note}>
              {employeeId
                ? 'This employee does not have any Performance Improvement Plans.'
                : 'You have not created any Performance Improvement Plans yet.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className={styles.pipsGrid}>
          {pips.map((pip) => (
            <Card key={pip.appraisalRecordId} padding="md" shadow="warm" className={styles.pipCard}>
              <div className={styles.cardHeader}>
                <h3>{pip.title}</h3>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(pip.status)}`}>
                  {pip.status}
                </span>
              </div>

              <div className={styles.cardBody}>
                {pip.description && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Description:</span>
                    <span className={styles.value}>{pip.description}</span>
                  </div>
                )}
                <div className={styles.infoRow}>
                  <span className={styles.label}>Reason:</span>
                  <span className={styles.value}>{pip.reason}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Start Date:</span>
                  <span className={styles.value}>{formatDate(pip.startDate)}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Target Completion:</span>
                  <span className={styles.value}>{formatDate(pip.targetCompletionDate)}</span>
                </div>
                {pip.actualCompletionDate && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Completed:</span>
                    <span className={styles.value}>{formatDate(pip.actualCompletionDate)}</span>
                  </div>
                )}
                {pip.progressNotes && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Progress Notes:</span>
                    <span className={styles.value}>{pip.progressNotes}</span>
                  </div>
                )}
                {pip.finalOutcome && (
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Final Outcome:</span>
                    <span className={styles.value}>{pip.finalOutcome}</span>
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEditPIP(pip)}
                >
                  Edit
                </Button>
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => handleDeletePIP(pip)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isFormOpen && (
        <PIPFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedPIP(null);
            setSelectedAppraisalId('');
          }}
          onSuccess={() => {
            fetchPIPs();
          }}
          appraisalRecordId={selectedAppraisalId}
          existingPIP={selectedPIP}
        />
      )}
    </div>
  );
}

