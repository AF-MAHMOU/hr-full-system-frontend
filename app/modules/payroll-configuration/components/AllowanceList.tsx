/**
 * ========================== EMAD ==========================
 * AllowanceList Component
 * Displays list of allowances with filtering and actions
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components';
import { allowanceApi } from '../api/payrollConfigApi';
import type {
  Allowance,
  FilterAllowanceDto,
  ApprovalStatus,
  AllowanceType,
  AllowanceFrequency,
} from '../types';
import AllowanceModal from './AllowanceModal';
import styles from '../page.module.css';

interface AllowanceListProps {
  userRole?: string;
}

const AllowanceList: React.FC<AllowanceListProps> = ({ userRole }) => {
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterAllowanceDto>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState<Allowance | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isManager = userRole === 'payroll_manager' || userRole === 'hr_manager';
  const isSpecialist = userRole === 'payroll_specialist';

  const fetchAllowances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await allowanceApi.getAll(filter);
      setAllowances(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch allowances');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAllowances();
  }, [fetchAllowances]);

  const handleCreate = () => {
    setSelectedAllowance(null);
    setIsModalOpen(true);
  };

  const handleEdit = (allowance: Allowance) => {
    setSelectedAllowance(allowance);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this allowance?')) return;
    try {
      setActionLoading(id);
      await allowanceApi.delete(id);
      await fetchAllowances();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete allowance');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      setActionLoading(id);
      await allowanceApi.submit(id);
      await fetchAllowances();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit allowance');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await allowanceApi.approve(id);
      await fetchAllowances();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve allowance');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this allowance?')) return;
    try {
      setActionLoading(id);
      await allowanceApi.reject(id);
      await fetchAllowances();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject allowance');
    } finally {
      setActionLoading(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAllowance(null);
  };

  const handleModalSave = async () => {
    await fetchAllowances();
    handleModalClose();
  };

  const getStatusClass = (status: ApprovalStatus): string => {
    const statusClasses: Record<ApprovalStatus, string> = {
      DRAFT: styles.statusDraft,
      PENDING_APPROVAL: styles.statusPending,
      APPROVED: styles.statusApproved,
      REJECTED: styles.statusRejected,
    };
    return `${styles.statusBadge} ${statusClasses[status] || ''}`;
  };

  const formatValue = (allowance: Allowance): string => {
    if (allowance.type === 'PERCENTAGE') {
      return `${allowance.value}%`;
    }
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(allowance.value);
  };

  const formatFrequency = (frequency: AllowanceFrequency): string => {
    const labels: Record<AllowanceFrequency, string> = {
      MONTHLY: 'Monthly',
      QUARTERLY: 'Quarterly',
      ANNUALLY: 'Annually',
      ONE_TIME: 'One-Time',
    };
    return labels[frequency] || frequency;
  };

  if (loading) {
    return <div className={styles.loading}>Loading allowances...</div>;
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <h3>Error</h3>
        <p>{error}</p>
        <Button onClick={fetchAllowances}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Allowances</h2>
        <div className={styles.actions}>
          {isSpecialist && (
            <Button variant="primary" onClick={handleCreate}>
              + Create Allowance
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by name..."
          className={styles.filterInput}
          value={filter.name || ''}
          onChange={(e) => setFilter({ ...filter, name: e.target.value || undefined })}
        />
        <select
          className={styles.filterSelect}
          value={filter.status || ''}
          onChange={(e) =>
            setFilter({ ...filter, status: (e.target.value as ApprovalStatus) || undefined })
          }
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          className={styles.filterSelect}
          value={filter.type || ''}
          onChange={(e) =>
            setFilter({ ...filter, type: (e.target.value as AllowanceType) || undefined })
          }
        >
          <option value="">All Types</option>
          <option value="FIXED">Fixed Amount</option>
          <option value="PERCENTAGE">Percentage</option>
        </select>
      </div>

      {/* Data Table */}
      {allowances.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Allowances Found</h3>
          <p>
            {isSpecialist
              ? 'Create your first allowance to get started.'
              : 'No allowances available at the moment.'}
          </p>
          {isSpecialist && (
            <Button variant="primary" onClick={handleCreate}>
              + Create Allowance
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
                <th>Frequency</th>
                <th>Taxable</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allowances.map((allowance) => (
                <tr key={allowance._id}>
                  <td>
                    <strong>{allowance.name}</strong>
                    {allowance.description && (
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                        {allowance.description}
                      </div>
                    )}
                  </td>
                  <td>{allowance.type === 'FIXED' ? 'Fixed' : 'Percentage'}</td>
                  <td className={styles.currency}>{formatValue(allowance)}</td>
                  <td>{formatFrequency(allowance.frequency)}</td>
                  <td>{allowance.isTaxable ? '✓ Yes' : '✗ No'}</td>
                  <td>
                    <span className={getStatusClass(allowance.status)}>{allowance.status}</span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      {/* Edit/Delete only for DRAFT */}
                      {allowance.status === 'DRAFT' && isSpecialist && (
                        <>
                          <button
                            className={styles.iconButton}
                            onClick={() => handleEdit(allowance)}
                            disabled={actionLoading === allowance._id}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleDelete(allowance._id)}
                            disabled={actionLoading === allowance._id}
                            title="Delete"
                          >
                            🗑️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleSubmit(allowance._id)}
                            disabled={actionLoading === allowance._id}
                            title="Submit for Approval"
                          >
                            📤
                          </button>
                        </>
                      )}

                      {/* Approve/Reject for PENDING */}
                      {allowance.status === 'PENDING_APPROVAL' && isManager && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleApprove(allowance._id)}
                            disabled={actionLoading === allowance._id}
                            title="Approve"
                          >
                            ✅
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleReject(allowance._id)}
                            disabled={actionLoading === allowance._id}
                            title="Reject"
                          >
                            ❌
                          </button>
                        </>
                      )}

                      {/* View only for APPROVED */}
                      {allowance.status === 'APPROVED' && (
                        <button
                          className={styles.iconButton}
                          onClick={() => handleEdit(allowance)}
                          title="View Details"
                        >
                          👁️
                        </button>
                      )}

                      {/* REJECTED - can edit again */}
                      {allowance.status === 'REJECTED' && isSpecialist && (
                        <button
                          className={styles.iconButton}
                          onClick={() => handleEdit(allowance)}
                          disabled={actionLoading === allowance._id}
                          title="Edit & Resubmit"
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AllowanceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        allowance={selectedAllowance}
        readOnly={selectedAllowance?.status === 'APPROVED'}
      />
    </div>
  );
};

export default AllowanceList;
