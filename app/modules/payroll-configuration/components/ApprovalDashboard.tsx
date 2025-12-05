/**
 * ========================== EMAD ==========================
 * ApprovalDashboard Component
 * Displays pending approvals and approved configurations dashboard
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import { approvalApi, payGradeApi, allowanceApi, taxRuleApi } from '../api/payrollConfigApi';
import type { PendingApprovalsDashboard, ApprovedConfigurations } from '../types';
import styles from '../page.module.css';

interface ApprovalDashboardProps {
  userRole?: SystemRole;
}

const ApprovalDashboard: React.FC<ApprovalDashboardProps> = ({ userRole }) => {
  const [pendingData, setPendingData] = useState<PendingApprovalsDashboard | null>(null);
  const [approvedData, setApprovedData] = useState<ApprovedConfigurations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  // Check if user has manager permissions for approval actions
  const isManager = userRole === SystemRole.PAYROLL_MANAGER || userRole === SystemRole.HR_MANAGER;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [pending, approved] = await Promise.all([
        approvalApi.getPendingDashboard(),
        approvalApi.getAllApproved(),
      ]);

      setPendingData(pending);
      setApprovedData(approved);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleApprove = async (type: 'payGrade' | 'allowance' | 'taxRule', id: string) => {
    try {
      setActionLoading(`${type}-${id}`);
      if (type === 'payGrade') {
        await payGradeApi.approve(id);
      } else if (type === 'allowance') {
        await allowanceApi.approve(id);
      } else {
        await taxRuleApi.approve(id);
      }
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (type: 'payGrade' | 'allowance' | 'taxRule', id: string) => {
    if (!confirm('Are you sure you want to reject this item?')) return;
    try {
      setActionLoading(`${type}-${id}`);
      if (type === 'payGrade') {
        await payGradeApi.reject(id);
      } else if (type === 'allowance') {
        await allowanceApi.reject(id);
      } else {
        await taxRuleApi.reject(id);
      }
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EGP'): string => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading approval dashboard...</div>;
  }

  if (error) {
    return (
      <div className={styles.emptyState}>
        <h3>Error</h3>
        <p>{error}</p>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    );
  }

  const totalPending =
    (pendingData?.payGrades?.length || 0) +
    (pendingData?.allowances?.length || 0) +
    (pendingData?.taxRules?.length || 0);

  const totalApproved =
    (approvedData?.payGrades?.length || 0) +
    (approvedData?.allowances?.length || 0) +
    (approvedData?.taxRules?.length || 0);

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Approval Dashboard</h2>
        <div className={styles.actions}>
          <Button variant="outline" onClick={fetchDashboardData}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.dashboardGrid}>
        <div className={styles.dashboardCard} onClick={() => setActiveTab('pending')} style={{ cursor: 'pointer' }}>
          <h3>Pending Approvals</h3>
          <p className={styles.dashboardCardValue}>{totalPending}</p>
          <p className={styles.dashboardCardLabel}>Items waiting for review</p>
        </div>
        <div className={styles.dashboardCard} onClick={() => setActiveTab('approved')} style={{ cursor: 'pointer', borderLeftColor: '#059669' }}>
          <h3>Approved Configurations</h3>
          <p className={styles.dashboardCardValue} style={{ color: '#059669' }}>{totalApproved}</p>
          <p className={styles.dashboardCardLabel}>Active configurations</p>
        </div>
        <div className={styles.dashboardCard} style={{ borderLeftColor: '#3b82f6' }}>
          <h3>Pay Grades</h3>
          <p className={styles.dashboardCardValue} style={{ color: '#3b82f6' }}>
            {pendingData?.payGrades?.length || 0} / {approvedData?.payGrades?.length || 0}
          </p>
          <p className={styles.dashboardCardLabel}>Pending / Approved</p>
        </div>
        <div className={styles.dashboardCard} style={{ borderLeftColor: '#8b5cf6' }}>
          <h3>Allowances</h3>
          <p className={styles.dashboardCardValue} style={{ color: '#8b5cf6' }}>
            {pendingData?.allowances?.length || 0} / {approvedData?.allowances?.length || 0}
          </p>
          <p className={styles.dashboardCardLabel}>Pending / Approved</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsList}>
          <button
            className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approvals ({totalPending})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'approved' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved Configurations ({totalApproved})
          </button>
        </div>
      </div>

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div className={styles.tabContent}>
          {totalPending === 0 ? (
            <div className={styles.emptyState}>
              <h3>No Pending Approvals</h3>
              <p>All items have been reviewed. Great job!</p>
            </div>
          ) : (
            <>
              {/* Pending Pay Grades */}
              {pendingData?.payGrades && pendingData.payGrades.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Pay Grades ({pendingData.payGrades.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Salary Range</th>
                        <th>Created</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.payGrades.map((pg) => (
                        <tr key={pg._id}>
                          <td>
                            <strong>{pg.name}</strong>
                            {pg.description && (
                              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                {pg.description}
                              </div>
                            )}
                          </td>
                          <td>
                            {formatCurrency(pg.minSalary, pg.currency)} -{' '}
                            {formatCurrency(pg.maxSalary, pg.currency)}
                          </td>
                          <td>{formatDate(pg.createdAt)}</td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('payGrade', pg._id)}
                                  disabled={actionLoading === `payGrade-${pg._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('payGrade', pg._id)}
                                  disabled={actionLoading === `payGrade-${pg._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Pending Allowances */}
              {pendingData?.allowances && pendingData.allowances.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Allowances ({pendingData.allowances.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Frequency</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.allowances.map((al) => (
                        <tr key={al._id}>
                          <td>
                            <strong>{al.name}</strong>
                            {al.description && (
                              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                {al.description}
                              </div>
                            )}
                          </td>
                          <td>{al.type === 'FIXED' ? 'Fixed' : 'Percentage'}</td>
                          <td>
                            {al.type === 'PERCENTAGE' ? `${al.value}%` : formatCurrency(al.value)}
                          </td>
                          <td>{al.frequency}</td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('allowance', al._id)}
                                  disabled={actionLoading === `allowance-${al._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('allowance', al._id)}
                                  disabled={actionLoading === `allowance-${al._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Pending Tax Rules */}
              {pendingData?.taxRules && pendingData.taxRules.length > 0 && (
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    Tax Rules ({pendingData.taxRules.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Calculation Type</th>
                        <th>Effective From</th>
                        {isManager && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {pendingData.taxRules.map((tr) => (
                        <tr key={tr._id}>
                          <td>
                            <strong>{tr.name}</strong>
                            {tr.description && (
                              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                                {tr.description}
                              </div>
                            )}
                          </td>
                          <td>{tr.calculationType}</td>
                          <td>{formatDate(tr.effectiveFrom)}</td>
                          {isManager && (
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                  onClick={() => handleApprove('taxRule', tr._id)}
                                  disabled={actionLoading === `taxRule-${tr._id}`}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                                <button
                                  className={`${styles.iconButton} ${styles.iconButtonDanger}`}
                                  onClick={() => handleReject('taxRule', tr._id)}
                                  disabled={actionLoading === `taxRule-${tr._id}`}
                                  title="Reject"
                                >
                                  ❌
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Approved Configurations Tab */}
      {activeTab === 'approved' && (
        <div className={styles.tabContent}>
          {totalApproved === 0 ? (
            <div className={styles.emptyState}>
              <h3>No Approved Configurations</h3>
              <p>No configurations have been approved yet.</p>
            </div>
          ) : (
            <>
              {/* Approved Pay Grades */}
              {approvedData?.payGrades && approvedData.payGrades.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Pay Grades ({approvedData.payGrades.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Salary Range</th>
                        <th>Approved At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.payGrades.map((pg) => (
                        <tr key={pg._id}>
                          <td>
                            <strong>{pg.name}</strong>
                          </td>
                          <td>
                            {formatCurrency(pg.minSalary, pg.currency)} -{' '}
                            {formatCurrency(pg.maxSalary, pg.currency)}
                          </td>
                          <td>{pg.approvedAt ? formatDate(pg.approvedAt) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Approved Allowances */}
              {approvedData?.allowances && approvedData.allowances.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Allowances ({approvedData.allowances.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Taxable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.allowances.map((al) => (
                        <tr key={al._id}>
                          <td>
                            <strong>{al.name}</strong>
                          </td>
                          <td>{al.type === 'FIXED' ? 'Fixed' : 'Percentage'}</td>
                          <td>
                            {al.type === 'PERCENTAGE' ? `${al.value}%` : formatCurrency(al.value)}
                          </td>
                          <td>{al.isTaxable ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
                </div>
              )}

              {/* Approved Tax Rules */}
              {approvedData?.taxRules && approvedData.taxRules.length > 0 && (
                <Card padding="md" shadow="sm" className={styles.tableContainer}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#059669' }}>
                    ✓ Tax Rules ({approvedData.taxRules.length})
                  </h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Calculation Type</th>
                        <th>Effective Period</th>
                        <th>Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {approvedData.taxRules.map((tr) => (
                        <tr key={tr._id}>
                          <td>
                            <strong>{tr.name}</strong>
                          </td>
                          <td>{tr.calculationType}</td>
                          <td>
                            {formatDate(tr.effectiveFrom)}
                            {tr.effectiveTo ? ` - ${formatDate(tr.effectiveTo)}` : ' - Present'}
                          </td>
                          <td>{tr.isActive ? '✓ Active' : '✗ Inactive'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalDashboard;
