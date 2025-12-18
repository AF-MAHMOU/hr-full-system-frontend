'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { SystemRole } from '@/shared/types/auth';
import { payrollrunApi } from '../api/payrollExecutionAPI';
import type { PayrollRuns, EmployeePayrollDetails } from '../types';
import styles from '../PayrollExecution.module.css';

interface PayrollReviewPageProps {
  runId: string;
  onBack?: () => void;
}

/**
 * PayrollReviewPage - Phase 2: Payroll Specialist Review
 * 
 * Requirements:
 * - REQ-PY-6: Review system-generated payroll results in preview dashboard
 * - REQ-PY-12: Submit payroll for manager review
 * - Display employee details, exceptions, and totals
 * - Submit DRAFT payroll to UNDER_REVIEW status
 */
export default function PayrollReviewPage({ runId, onBack }: PayrollReviewPageProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [payrollRun, setPayrollRun] = useState<PayrollRuns | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<EmployeePayrollDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Period review states
  const [periodApproved, setPeriodApproved] = useState(false);
  const [showEditPeriod, setShowEditPeriod] = useState(false);
  const [editedPeriod, setEditedPeriod] = useState('');
  const [editingPeriod, setEditingPeriod] = useState(false);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeePayrollDetails | null>(null);
  const [editBankAccount, setEditBankAccount] = useState('');
  const [editNetPay, setEditNetPay] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!user?.userid || !user.roles.includes(SystemRole.PAYROLL_SPECIALIST)) {
      setError('Unauthorized: Payroll Specialist role required');
      setLoading(false);
      return;
    }
  }, [user]);

  // Fetch payroll run and employee details
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.userid || !user.roles.includes(SystemRole.PAYROLL_SPECIALIST)) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch payroll run
        const run = await payrollrunApi.getPayrollRunById(runId);
        setPayrollRun(run);

        // Fetch employee details
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

  const handleApprovePeriod = () => {
    setPeriodApproved(true);
    setSuccessMessage('Payroll period approved. You can now generate the draft.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleRejectPeriod = () => {
    setShowEditPeriod(true);
    setEditedPeriod(payrollRun?.payrollPeriod || '');
  };

  const handleSavePeriod = async () => {
    if (!editedPeriod.trim()) {
      setError('Payroll period is required');
      return;
    }

    try {
      setEditingPeriod(true);
      setError(null);

      await payrollrunApi.editPayrollPeriod(runId, { payrollPeriod: editedPeriod });
      
      // Refresh data
      const run = await payrollrunApi.getPayrollRunById(runId);
      setPayrollRun(run);
      
      setShowEditPeriod(false);
      setPeriodApproved(false);
      setSuccessMessage('Payroll period updated successfully. Please review and approve.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update payroll period');
    } finally {
      setEditingPeriod(false);
    }
  };

  const handleGenerateDraft = async () => {
    if (!user?.userid) {
      setError('User not authenticated');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      const result = await payrollrunApi.generatePayrollDraft(runId);
      
      // Update state with generated data
      setPayrollRun(result);
      setEmployeeDetails(Array.isArray(result.employeeDetails) ? result.employeeDetails : [result.employeeDetails]);
      setSuccessMessage(`Draft generated successfully! Processed ${result.employeeDetails?.length || 0} employees.`);
      
      // Clear success message after delay
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error generating draft:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate payroll draft');
    } finally {
      setGenerating(false);
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
      const details = await payrollrunApi.getEmployeePayrollDetails(runId);
      setEmployeeDetails(Array.isArray(details) ? details : [details]);

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

  const handleSubmitForReview = async () => {
    if (!user?.userid) {
      setError('User not authenticated');
      return;
    }

    if (!payrollRun) {
      setError('No payroll run loaded');
      return;
    }

    if (payrollRun.status !== 'draft') {
      setError('Only DRAFT payroll runs can be submitted for review');
      return;
    }

    if (employeeDetails.length === 0) {
      setError('Please generate payroll draft first before submitting');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await payrollrunApi.submitForReview(runId, user.userid);

      setSuccessMessage('Payroll submitted for manager review successfully!');
      
      // Redirect after success
      setTimeout(() => {
        if (onBack) {
          onBack();
        } else {
          router.push('/modules/payroll-execution');
        }
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting payroll:', err);
      setError(err.message || 'Failed to submit payroll for review');
    } finally {
      setSubmitting(false);
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
        <h1 className={styles.title}>Review Payroll Run</h1>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}
      {successMessage && <div className={styles.successBox}>{successMessage}</div>}

      {/* Period Review Section - Phase 1 */}
      {payrollRun.status === 'draft' && !periodApproved && !showEditPeriod && (
        <div className={styles.periodReviewCard}>
          <h2 className={styles.sectionTitle}>Step 1: Review Payroll Period</h2>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>Current Period:</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>
                {new Date(payrollRun.payrollPeriod).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              Please verify this payroll period matches the current cycle before proceeding.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleApprovePeriod}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Approve Period
              </button>
              <button
                onClick={handleRejectPeriod}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reject & Edit Period
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Period Modal */}
      {showEditPeriod && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Edit Payroll Period</h3>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>New Payroll Period:</label>
              <input
                type="date"
                value={editedPeriod ? new Date(editedPeriod).toISOString().split('T')[0] : ''}
                onChange={(e) => setEditedPeriod(e.target.value)}
                className={styles.formInput}
              />
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={handleSavePeriod}
                disabled={editingPeriod}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: editingPeriod ? 'not-allowed' : 'pointer',
                  marginRight: '0.75rem'
                }}
              >
                {editingPeriod ? 'Saving...' : 'Save & Re-review'}
              </button>
              <button
                onClick={() => setShowEditPeriod(false)}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#757575',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Missing Bank Details:</span>
            <span className={`${styles.summaryValue} ${missingBankCount > 0 ? styles.errorText : styles.successText}`}>
              {missingBankCount}
            </span>
          </div>
        </div>
      </div>

      {/* Exceptions Alert */}
      {(exceptionsCount > 0 || missingBankCount > 0) && (
        <div className={styles.alertBox}>
          <h3 className={styles.alertTitle}>Action Required</h3>
          {exceptionsCount > 0 && (
            <p className={styles.alertMessage}>
              {exceptionsCount} employee(s) have exceptions that need review.
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
              </tr>
            </thead>
            <tbody>
              {employeeDetails.length === 0 ? (
                <tr>10
                  <td colSpan={9} className={styles.emptyState}>
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <p style={{ marginBottom: '20px', fontSize: '16px', color: '#666' }}>
                        No employee payroll data generated yet
                      </p>
                      {payrollRun?.status === 'draft' && (
                        <>
                          <button
                            onClick={handleGenerateDraft}
                            disabled={generating || !periodApproved}
                            style={{
                              padding: '12px 32px',
                              fontSize: '15px',
                              fontWeight: 600,
                              backgroundColor: generating ? '#ccc' : '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: generating ? 'not-allowed' : 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            {generating ? 'Generating Draft...' : (!periodApproved ? 'Approve Period First' : 'Generate Payroll Draft (Phase 1.1)')}
                          </button>
                          <p style={{ marginTop: '12px', fontSize: '13px', color: '#999' }}>
                            {!periodApproved ? 'Please approve the payroll period before generating draft' : 'Calculate salaries, allowances, deductions, taxes, and identify exceptions'}
                          </p>
                        </>
                      )}
                    </div>
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
                      {(emp.exceptions || emp.bankStatus === 'missing' || emp.netPay < 0) && payrollRun?.status === 'draft' && (
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
                          Fix
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

      {/* Action Buttons */}
      {payrollRun?.status === 'draft' && (
        <div className={styles.actionBar}>
          <button
            className={styles.submitButton}
            onClick={handleSubmitForReview}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit for Manager Review'}
          </button>
          <p className={styles.actionNote}>
            Once submitted, this payroll run will move to UNDER_REVIEW status and require manager approval.
          </p>
        </div>
      )}

      {payrollRun?.status !== 'draft' && (
        <div className={styles.infoBox}>
          <p>This payroll run is in <strong>{payrollRun?.status.toUpperCase()}</strong> status and cannot be modified.</p>
        </div>
      )}
    </div>
  );
}
