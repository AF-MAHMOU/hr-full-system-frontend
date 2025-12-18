'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { SystemRole } from '@/shared/types/auth';
import { payrollrunApi } from '../api/payrollExecutionAPI';
import type { PayrollRuns, EmployeePayrollDetails, ApprovePayrollDto, RejectPayrollDto, UnfreezePayrollDto } from '../types';
import styles from '../PayrollExecution.module.css';

interface PayrollManagingPageProps {
  runId: string;
  onBack?: () => void;
}

/**
 * PayrollManagingPage - Phase 3: Payroll Manager Approval & Control
 * 
 * Requirements:
 * - REQ-PY-20: Payroll Manager review and resolve escalated irregularities
 * - REQ-PY-22: Payroll Manager approval before distribution
 * - REQ-PY-7: Lock/freeze finalized payroll
 * - REQ-PY-19: Unfreeze payroll with reason
 * - Approve/Reject payroll runs
 * - Freeze APPROVED payroll runs to LOCKED status
 * - Unfreeze LOCKED payroll runs back to APPROVED
 */
export default function PayrollManagingPage({ runId, onBack }: PayrollManagingPageProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [payrollRun, setPayrollRun] = useState<PayrollRuns | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeePayrollDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [unlockReason, setUnlockReason] = useState('');
  const [comments, setComments] = useState('');

  // Edit employee modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeePayrollDetails | null>(null);
  const [editBankAccount, setEditBankAccount] = useState('');
  const [editNetPay, setEditNetPay] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!user?.userid || !user.roles.includes(SystemRole.PAYROLL_MANAGER)) {
      setError('Unauthorized: Payroll Manager role required');
      setLoading(false);
      return;
    }
  }, [user]);

  // Fetch data
  const fetchPayrollData = async () => {
    if (!user?.userid || !user.roles.includes(SystemRole.PAYROLL_MANAGER)) return;

    try {
      setLoading(true);
      setError(null);

      const run = await payrollrunApi.getPayrollRunById(runId);
      setPayrollRun(run);

      const details = await payrollrunApi.getEmployeePayrollDetails(runId);
      setEmployeeDetails(Array.isArray(details) ? details : [details]);

    } catch (err: any) {
      console.error('Error fetching payroll data:', err);
      setError(err.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [runId, user]);

  const handleApprove = async () => {
    if (!user?.userid) {
      setError('User not authenticated');
      return;
    }

    if (!payrollRun) {
      setError('No payroll run loaded');
      return;
    }

    if (payrollRun.status !== 'under review') {
      setError('Only UNDER_REVIEW payroll runs can be approved by manager');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await payrollrunApi.approveByManager(runId, {
        approverId: user.userid,
        comments: comments.trim() || undefined,
      });

      setSuccessMessage('Payroll approved! Waiting for Finance approval.');
      await fetchPayrollData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve payroll');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!user?.userid) {
      setError('User not authenticated');
      return;
    }

    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await payrollrunApi.rejectPayroll(runId, {
        reviewerId: user.userid,
        rejectionReason: rejectionReason.trim(),
      });

      setShowRejectModal(false);
      setSuccessMessage('Payroll rejected successfully.');
      
      setTimeout(() => {
        if (onBack) {
          onBack();
        } else {
          router.push('/modules/payroll-execution');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reject payroll');
    } finally {
      setProcessing(false);
    }
  };

  const handleFreeze = async () => {
    if (!user?.userid) {
      setError('User not authenticated');
      return;
    }

    if (!payrollRun) {
      setError('No payroll run loaded');
      return;
    }

    if (payrollRun.status !== 'approved') {
      setError('Only APPROVED payroll runs can be frozen');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await payrollrunApi.freezePayroll(runId, user.userid);

      setSuccessMessage('Payroll frozen successfully. No further modifications allowed.');
      await fetchPayrollData();
    } catch (err: any) {
      setError(err.message || 'Failed to freeze payroll');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnfreeze = async () => {
    if (!user?.userid) {
      setError('User not authenticated');
      return;
    }

    if (!unlockReason.trim()) {
      setError('Unlock reason is required');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      await payrollrunApi.unfreezePayroll(runId, {
        managerId: user.userid,
        unlockReason: unlockReason.trim(),
      });

      setShowUnlockModal(false);
      setSuccessMessage('Payroll unlocked successfully. Corrections can now be made.');
      await fetchPayrollData();
    } catch (err: any) {
      setError(err.message || 'Failed to unlock payroll');
    } finally {
      setProcessing(false);
    }
  };

  const handleEditEmployee = (emp: EmployeePayrollDetails) => {
    setEditingEmployee(emp);
    setEditBankAccount('');
    setEditNetPay(emp.netPay);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingEmployee) return;

    try {
      setSaving(true);
      setError(null);

      const editDto: any = {};
      if (editBankAccount.trim() && editingEmployee.bankStatus === 'missing') {
        editDto.bankAccountNumber = editBankAccount.trim();
      }
      if (editNetPay !== '' && editNetPay !== editingEmployee.netPay) {
        editDto.netPay = Number(editNetPay);
      }

      if (Object.keys(editDto).length === 0) {
        setError('No changes to save');
        return;
      }

      await payrollrunApi.editEmployeePayrollDetail(editingEmployee._id, editDto);

      // Refresh employee details
      await fetchPayrollData();

      setSuccessMessage('Employee payroll details updated successfully');
      setShowEditModal(false);
      setEditingEmployee(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update employee details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>Loading payroll data...</div>
      </div>
    );
  }

  if (error && !payrollRun) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>{error}</div>
        <button 
          className={styles.backButton}
          onClick={() => onBack ? onBack() : router.push('/modules/payroll-execution')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!payrollRun) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>Payroll run not found</div>
        <button 
          className={styles.backButton}
          onClick={() => onBack ? onBack() : router.push('/modules/payroll-execution')}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const exceptionsCount = employeeDetails.filter(emp => emp.exceptions).length;
  const missingBankCount = employeeDetails.filter(emp => emp.bankStatus === 'missing').length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => onBack ? onBack() : router.push('/modules/payroll-execution')}
        >
          ← Back
        </button>
        <h1 className={styles.title}>Manager Approval & Control</h1>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}
      {successMessage && <div className={styles.successBox}>{successMessage}</div>}

      {/* Payroll Run Summary */}
      <div className={styles.summaryCard}>
        <h2 className={styles.sectionTitle}>Payroll Summary</h2>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Run ID:</span>
            <span className={styles.summaryValue}>{payrollRun.runId}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Period:</span>
            <span className={styles.summaryValue}>
              {new Date(payrollRun.payrollPeriod).toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Status:</span>
            <span className={`${styles.statusBadge} ${styles[payrollRun.status.toLowerCase().replace(/\s/g, '')]}`}>
              {payrollRun.status.toUpperCase()}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Payment Status:</span>
            <span className={`${styles.paymentBadge} ${styles[payrollRun.paymentStatus]}`}>
              {payrollRun.paymentStatus.toUpperCase()}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Entity:</span>
            <span className={styles.summaryValue}>{payrollRun.entity}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Employees:</span>
            <span className={styles.summaryValue}>{payrollRun.employees}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Net Pay:</span>
            <span className={styles.summaryValue}>
              {payrollRun.totalnetpay.toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'EGP' 
              })}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Exceptions:</span>
            <span className={`${styles.summaryValue} ${exceptionsCount > 0 ? styles.warningText : styles.successText}`}>
              {exceptionsCount}
            </span>
          </div>
          {payrollRun.managerApprovalDate && (
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Manager Approved:</span>
              <span className={styles.summaryValue}>
                {new Date(payrollRun.managerApprovalDate).toLocaleString('en-GB')}
              </span>
            </div>
          )}
          {payrollRun.unlockReason && (
            <div className={styles.summaryItemFull}>
              <span className={styles.summaryLabel}>Unlock Reason:</span>
              <span className={styles.summaryValue}>{payrollRun.unlockReason}</span>
            </div>
          )}
        </div>
      </div>

      {/* Warnings */}
      {(exceptionsCount > 0 || missingBankCount > 0) && (
        <div className={styles.alertBox}>
          <h3 className={styles.alertTitle}>Review Required</h3>
          {exceptionsCount > 0 && (
            <p className={styles.alertMessage}>
              {exceptionsCount} employee(s) have exceptions requiring attention.
            </p>
          )}
          {missingBankCount > 0 && (
            <p className={styles.alertMessage}>
              {missingBankCount} employee(s) have missing bank account details.
            </p>
          )}
        </div>
      )}

      {/* Employee Details Table */}
      <div className={styles.tableCard}>
        <h2 className={styles.sectionTitle}>Employee Payroll Details</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Base Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Bonus</th>
                <th>Benefit</th>
                <th>Net Pay</th>
                <th>Bank Status</th>
                <th>Exceptions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employeeDetails.length === 0 ? (
                <tr>
                  <td colSpan={10} className={styles.emptyState}>
                    No employee data available
                  </td>
                </tr>
              ) : (
                employeeDetails.map((emp) => (
                  <tr key={emp._id} className={emp.exceptions ? styles.exceptionRow : ''}>
                    <td>{emp.employeeId}</td>
                    <td>{emp.baseSalary.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</td>
                    <td>{emp.allowances.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</td>
                    <td>{emp.deductions.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</td>
                    <td>{emp.bonus ? emp.bonus.toLocaleString('en-US', { style: 'currency', currency: 'EGP' }) : '-'}</td>
                    <td>{emp.benefit ? emp.benefit.toLocaleString('en-US', { style: 'currency', currency: 'EGP' }) : '-'}</td>
                    <td className={styles.netPayCell}>
                      {emp.netPay.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}
                    </td>
                    <td>
                      <span className={`${styles.bankBadge} ${styles[emp.bankStatus]}`}>
                        {emp.bankStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className={styles.exceptionsCell}>
                      {emp.exceptions || '-'}
                    </td>
                    <td>
                      {(emp.exceptions || emp.bankStatus === 'missing' || emp.netPay < 0) && payrollRun.status === 'under review' && (
                        <button
                          onClick={() => handleEditEmployee(emp)}
                          className={styles.editButton}
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee Modal */}
      {showEditModal && editingEmployee && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Resolve Exceptions - {editingEmployee.employeeId}</h3>
            
            {editingEmployee.bankStatus === 'missing' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Bank Account Number:</label>
                <input
                  type="text"
                  value={editBankAccount}
                  onChange={(e) => setEditBankAccount(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter bank account number"
                />
              </div>
            )}

            {(editingEmployee.netPay < 0 || editingEmployee.exceptions?.includes('negative')) && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Adjusted Net Pay (Current: {editingEmployee.netPay.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}):
                </label>
                <input
                  type="number"
                  value={editNetPay}
                  onChange={(e) => setEditNetPay(e.target.value === '' ? '' : Number(e.target.value))}
                  className={styles.formInput}
                  placeholder="Enter adjusted net pay"
                  min="0"
                />
              </div>
            )}

            {editingEmployee.exceptions && (
              <div className={styles.infoBox} style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                <strong>Exceptions:</strong> {editingEmployee.exceptions}
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className={styles.saveButton}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  marginRight: '10px'
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingEmployee(null);
                }}
                className={styles.cancelButton}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#757575',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons - Under Review Status */}
      {payrollRun.status === 'under review' && (
        <div className={styles.actionBar}>
          <div className={styles.commentsSection}>
            <label htmlFor="comments" className={styles.label}>
              Manager Comments (Optional):
            </label>
            <textarea
              id="comments"
              className={styles.textarea}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Add any comments or notes about this payroll run..."
              rows={3}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button
              className={styles.approveButton}
              onClick={handleApprove}
              disabled={processing}
            >
              {processing ? 'Approving...' : 'Approve Payroll'}
            </button>
            <button
              className={styles.rejectButton}
              onClick={() => setShowRejectModal(true)}
              disabled={processing}
            >
              Reject Payroll
            </button>
          </div>
          <p className={styles.actionNote}>
            Approval will move this payroll to PENDING_FINANCE_APPROVAL status.
          </p>
        </div>
      )}

      {/* Action Buttons - Approved Status */}
      {payrollRun.status === 'approved' && (
        <div className={styles.actionBar}>
          <button
            className={styles.freezeButton}
            onClick={handleFreeze}
            disabled={processing}
          >
            {processing ? 'Freezing...' : 'Freeze Payroll'}
          </button>
          <p className={styles.actionNote}>
            Freezing will lock this payroll run and prevent any further modifications.
          </p>
        </div>
      )}

      {/* Action Buttons - Locked Status */}
      {payrollRun.status === 'locked' && (
        <div className={styles.actionBar}>
          <button
            className={styles.unlockButton}
            onClick={() => setShowUnlockModal(true)}
            disabled={processing}
          >
            Unfreeze Payroll
          </button>
          <p className={styles.actionNote}>
            Unfreezing requires providing a reason and will allow modifications again.
          </p>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Reject Payroll Run</h3>
            <p className={styles.modalDescription}>
              Please provide a reason for rejecting this payroll run. It will be sent back to the Payroll Specialist.
            </p>
            <textarea
              className={styles.textarea}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (required)..."
              rows={4}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmButton}
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
              >
                {processing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Unfreeze Payroll Run</h3>
            <p className={styles.modalDescription}>
              Please provide a reason for unfreezing this locked payroll run.
            </p>
            <textarea
              className={styles.textarea}
              value={unlockReason}
              onChange={(e) => setUnlockReason(e.target.value)}
              placeholder="Enter unlock reason (required)..."
              rows={4}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                onClick={() => {
                  setShowUnlockModal(false);
                  setUnlockReason('');
                }}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmButton}
                onClick={handleUnfreeze}
                disabled={processing || !unlockReason.trim()}
              >
                {processing ? 'Unlocking...' : 'Confirm Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Messages */}
      {payrollRun.status === 'pending finance approval' && (
        <div className={styles.infoBox}>
          <p>This payroll is awaiting Finance Staff approval. No manager actions available.</p>
        </div>
      )}

      {payrollRun.status === 'rejected' && (
        <div className={styles.errorBox}>
          <p><strong>Rejection Reason:</strong> {payrollRun.rejectionReason || 'No reason provided'}</p>
        </div>
      )}
    </div>
  );
}
