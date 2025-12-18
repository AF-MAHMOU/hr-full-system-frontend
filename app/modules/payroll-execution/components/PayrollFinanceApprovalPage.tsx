'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { SystemRole } from '@/shared/types/auth';
import { payrollrunApi } from '../api/payrollExecutionAPI';
import type { PayrollRuns, EmployeePayrollDetails, ApprovePayrollDto, RejectPayrollDto } from '../types';
import styles from '../PayrollExecution.module.css';

interface PayrollFinanceApprovalPageProps {
  runId: string;
  onBack?: () => void;
}

/**
 * PayrollFinanceApprovalPage - Phase 3: Finance Staff Final Approval
 * 
 * Requirements:
 * - REQ-PY-15: Finance staff gives final approval
 * - Changes payment status to PAID
 * - Triggers payslip generation
 * - Can reject payroll back to specialist
 */
export default function PayrollFinanceApprovalPage({ runId, onBack }: PayrollFinanceApprovalPageProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [payrollRun, setPayrollRun] = useState<PayrollRuns | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeePayrollDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Authentication check
  useEffect(() => {
    if (!user?.userid || !user.roles.includes(SystemRole.FINANCE_STAFF)) {
      setError('Unauthorized: Finance Staff role required');
      setLoading(false);
      return;
    }
  }, [user]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.userid || !user.roles.includes(SystemRole.FINANCE_STAFF)) return;

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

    fetchData();
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

    if (payrollRun.status !== 'pending finance approval') {
      setError('Only PENDING_FINANCE_APPROVAL payroll runs can be approved by finance');
      return;
    }

    try {
      setApproving(true);
      setError(null);

      await payrollrunApi.approveByFinance(runId, {
        approverId: user.userid,
      });

      setSuccessMessage('Payment Approved! Payroll can now be locked.');
      
      setTimeout(() => {
        if (onBack) {
          onBack();
        } else {
          router.push('/modules/payroll-execution');
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to approve payroll');
    } finally {
      setApproving(false);
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
      setRejecting(true);
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
      setRejecting(false);
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
  const totalEmployees = employeeDetails.length;
  const totalGrossPay = employeeDetails.reduce((sum, emp) => sum + emp.baseSalary + emp.allowances, 0);
  const totalDeductions = employeeDetails.reduce((sum, emp) => sum + emp.deductions, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => onBack ? onBack() : router.push('/modules/payroll-execution')}
        >
          ← Back
        </button>
        <h1 className={styles.title}>Finance Final Approval</h1>
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
            <span className={styles.summaryValue}>{totalEmployees}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Gross Pay:</span>
            <span className={styles.summaryValue}>
              {totalGrossPay.toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'EGP' 
              })}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Deductions:</span>
            <span className={styles.summaryValue}>
              {totalDeductions.toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'EGP' 
              })}
            </span>
          </div>
          <div className={styles.summaryItemHighlight}>
            <span className={styles.summaryLabel}>Total Net Pay:</span>
            <span className={styles.summaryValueLarge}>
              {payrollRun.totalnetpay.toLocaleString('en-US', { 
                style: 'currency', 
                currency: 'EGP' 
              })}
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
        </div>
      </div>

      {/* Critical Warnings */}
      {(exceptionsCount > 0 || missingBankCount > 0) && (
        <div className={styles.warningBox}>
          <h3 className={styles.warningTitle}>⚠️ Critical Issues Detected</h3>
          {exceptionsCount > 0 && (
            <p className={styles.warningMessage}>
              <strong>{exceptionsCount}</strong> employee(s) have payroll exceptions.
            </p>
          )}
          {missingBankCount > 0 && (
            <p className={styles.warningMessage}>
              <strong>{missingBankCount}</strong> employee(s) have missing bank account details.
            </p>
          )}
          <p className={styles.warningNote}>
            Consider rejecting this payroll if these issues should be resolved first.
          </p>
        </div>
      )}

      {/* Financial Summary Card */}
      <div className={styles.financialCard}>
        <h2 className={styles.sectionTitle}>Financial Breakdown</h2>
        <div className={styles.financialGrid}>
          <div className={styles.financialRow}>
            <span className={styles.financialLabel}>Total Base Salaries:</span>
            <span className={styles.financialValue}>
              {employeeDetails.reduce((sum, emp) => sum + emp.baseSalary, 0).toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}
            </span>
          </div>
          <div className={styles.financialRow}>
            <span className={styles.financialLabel}>Total Allowances:</span>
            <span className={styles.financialValue}>
              {employeeDetails.reduce((sum, emp) => sum + emp.allowances, 0).toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}
            </span>
          </div>
          <div className={styles.financialRow}>
            <span className={styles.financialLabel}>Total Bonuses:</span>
            <span className={styles.financialValue}>
              {employeeDetails.reduce((sum, emp) => sum + (emp.bonus || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}
            </span>
          </div>
          <div className={styles.financialRow}>
            <span className={styles.financialLabel}>Total Benefits:</span>
            <span className={styles.financialValue}>
              {employeeDetails.reduce((sum, emp) => sum + (emp.benefit || 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}
            </span>
          </div>
          <div className={styles.financialDivider}></div>
          <div className={styles.financialRow}>
            <span className={styles.financialLabel}>Total Deductions:</span>
            <span className={`${styles.financialValue} ${styles.deduction}`}>
              -{totalDeductions.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}
            </span>
          </div>
          <div className={styles.financialDivider}></div>
          <div className={styles.financialRowTotal}>
            <span className={styles.financialLabelTotal}>Net Payable Amount:</span>
            <span className={styles.financialValueTotal}>
              {payrollRun.totalnetpay.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}
            </span>
          </div>
        </div>
      </div>

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
              </tr>
            </thead>
            <tbody>
              {employeeDetails.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyState}>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      {payrollRun.status === 'pending finance approval' && (
        <div className={styles.actionBar}>
          <div className={styles.approvalNote}>
            <p className={styles.approvalText}>
              <strong>Final Approval:</strong> Once approved, payment status will change to PAID and payslips will be automatically generated. 
              This action cannot be undone.
            </p>
          </div>
          <div className={styles.buttonGroup}>
            <button
              className={styles.approveButton}
              onClick={handleApprove}
              disabled={approving || rejecting}
            >
              {approving ? 'Approving...' : '✓ Approve Payment'}
            </button>
            <button
              className={styles.rejectButton}
              onClick={() => setShowRejectModal(true)}
              disabled={approving || rejecting}
            >
              ✗ Reject Payroll
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Reject Payroll Run</h3>
            <p className={styles.modalDescription}>
              Please provide a detailed reason for rejecting this payroll. It will be sent back to the Payroll Specialist for corrections.
            </p>
            <textarea
              className={styles.textarea}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (required)..."
              rows={5}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelButton}
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                disabled={rejecting}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmButton}
                onClick={handleReject}
                disabled={rejecting || !rejectionReason.trim()}
              >
                {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {payrollRun.status !== 'pending finance approval' && (
        <div className={styles.infoBox}>
          {payrollRun.status === 'approved' && (
            <p>✓ This payroll has been approved and payment status is PAID. Payslips have been generated.</p>
          )}
          {payrollRun.status === 'locked' && (
            <p>🔒 This payroll has been frozen by the Payroll Manager.</p>
          )}
          {payrollRun.status === 'rejected' && (
            <p>✗ This payroll was rejected. Reason: {payrollRun.rejectionReason || 'No reason provided'}</p>
          )}
          {payrollRun.status === 'under review' && (
            <p>⏳ This payroll is still under manager review. Finance approval is not yet available.</p>
          )}
        </div>
      )}
    </div>
  );
}
