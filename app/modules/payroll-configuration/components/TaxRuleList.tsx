/**
 * ========================== EMAD ==========================
 * TaxRuleList Component
 * Displays list of tax rules with filtering and actions
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components';
import { taxRuleApi } from '../api/payrollConfigApi';
import type { TaxRule, FilterTaxRuleDto, ApprovalStatus, TaxCalculationType } from '../types';
import TaxRuleModal from './TaxRuleModal';
import styles from '../page.module.css';

interface TaxRuleListProps {
  userRole?: string;
}

const TaxRuleList: React.FC<TaxRuleListProps> = ({ userRole }) => {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTaxRuleDto>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaxRule, setSelectedTaxRule] = useState<TaxRule | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isManager = userRole === 'payroll_manager' || userRole === 'hr_manager';
  const isSpecialist = userRole === 'payroll_specialist' || userRole === 'legal_policy_admin';

  const fetchTaxRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taxRuleApi.getAll(filter);
      setTaxRules(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tax rules');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTaxRules();
  }, [fetchTaxRules]);

  const handleCreate = () => {
    setSelectedTaxRule(null);
    setIsModalOpen(true);
  };

  const handleEdit = (taxRule: TaxRule) => {
    setSelectedTaxRule(taxRule);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tax rule?')) return;
    try {
      setActionLoading(id);
      await taxRuleApi.delete(id);
      await fetchTaxRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete tax rule');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      setActionLoading(id);
      await taxRuleApi.submit(id);
      await fetchTaxRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit tax rule');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await taxRuleApi.approve(id);
      await fetchTaxRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve tax rule');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this tax rule?')) return;
    try {
      setActionLoading(id);
      await taxRuleApi.reject(id);
      await fetchTaxRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject tax rule');
    } finally {
      setActionLoading(null);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTaxRule(null);
  };

  const handleModalSave = async () => {
    await fetchTaxRules();
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

  const formatCalculationType = (type: TaxCalculationType): string => {
    const labels: Record<TaxCalculationType, string> = {
      FLAT: 'Flat Rate',
      PROGRESSIVE: 'Progressive',
      TIERED: 'Tiered Brackets',
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading tax rules...</div>;
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <h3>Error</h3>
        <p>{error}</p>
        <Button onClick={fetchTaxRules}>Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Tax Rules</h2>
        <div className={styles.actions}>
          {isSpecialist && (
            <Button variant="primary" onClick={handleCreate}>
              + Create Tax Rule
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
          value={filter.calculationType || ''}
          onChange={(e) =>
            setFilter({
              ...filter,
              calculationType: (e.target.value as TaxCalculationType) || undefined,
            })
          }
        >
          <option value="">All Calculation Types</option>
          <option value="FLAT">Flat Rate</option>
          <option value="PROGRESSIVE">Progressive</option>
          <option value="TIERED">Tiered Brackets</option>
        </select>
      </div>

      {/* Data Table */}
      {taxRules.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No Tax Rules Found</h3>
          <p>
            {isSpecialist
              ? 'Create your first tax rule to get started.'
              : 'No tax rules available at the moment.'}
          </p>
          {isSpecialist && (
            <Button variant="primary" onClick={handleCreate}>
              + Create Tax Rule
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Calculation Type</th>
                <th>Rate / Brackets</th>
                <th>Effective Period</th>
                <th>Active</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxRules.map((taxRule) => (
                <tr key={taxRule._id}>
                  <td>
                    <strong>{taxRule.name}</strong>
                    {taxRule.description && (
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                        {taxRule.description}
                      </div>
                    )}
                  </td>
                  <td>{formatCalculationType(taxRule.calculationType)}</td>
                  <td>
                    {taxRule.calculationType === 'FLAT' && taxRule.rate !== undefined ? (
                      <span className={styles.currency}>{taxRule.rate}%</span>
                    ) : taxRule.brackets && taxRule.brackets.length > 0 ? (
                      <span>{taxRule.brackets.length} bracket(s)</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    {formatDate(taxRule.effectiveFrom)}
                    {taxRule.effectiveTo ? ` - ${formatDate(taxRule.effectiveTo)}` : ' - Present'}
                  </td>
                  <td>{taxRule.isActive ? '✓ Active' : '✗ Inactive'}</td>
                  <td>
                    <span className={getStatusClass(taxRule.status)}>{taxRule.status}</span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      {/* Edit/Delete only for DRAFT */}
                      {taxRule.status === 'DRAFT' && isSpecialist && (
                        <>
                          <button
                            className={styles.iconButton}
                            onClick={() => handleEdit(taxRule)}
                            disabled={actionLoading === taxRule._id}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleDelete(taxRule._id)}
                            disabled={actionLoading === taxRule._id}
                            title="Delete"
                          >
                            🗑️
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleSubmit(taxRule._id)}
                            disabled={actionLoading === taxRule._id}
                            title="Submit for Approval"
                          >
                            📤
                          </button>
                        </>
                      )}

                      {/* Approve/Reject for PENDING */}
                      {taxRule.status === 'PENDING_APPROVAL' && isManager && (
                        <>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                            onClick={() => handleApprove(taxRule._id)}
                            disabled={actionLoading === taxRule._id}
                            title="Approve"
                          >
                            ✅
                          </button>
                          <button
                            className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                            onClick={() => handleReject(taxRule._id)}
                            disabled={actionLoading === taxRule._id}
                            title="Reject"
                          >
                            ❌
                          </button>
                        </>
                      )}

                      {/* View only for APPROVED */}
                      {taxRule.status === 'APPROVED' && (
                        <button
                          className={styles.iconButton}
                          onClick={() => handleEdit(taxRule)}
                          title="View Details"
                        >
                          👁️
                        </button>
                      )}

                      {/* REJECTED - can edit again */}
                      {taxRule.status === 'REJECTED' && isSpecialist && (
                        <button
                          className={styles.iconButton}
                          onClick={() => handleEdit(taxRule)}
                          disabled={actionLoading === taxRule._id}
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
      <TaxRuleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        taxRule={selectedTaxRule}
        readOnly={selectedTaxRule?.status === 'APPROVED'}
      />
    </div>
  );
};

export default TaxRuleList;
