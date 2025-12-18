'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/contexts/AuthContext';
import { SystemRole } from '@/shared/types/auth';
import { payrollrunApi } from '../api/payrollExecutionAPI';
import type { PaySlip } from '../types';
import styles from '../PayrollExecution.module.css';

interface EmployeePayslipsPageProps {
  onBack?: () => void;
}

export default function EmployeePayslipsPage({ onBack }: EmployeePayslipsPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<PaySlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<PaySlip | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    if (!user?.userid) {
      router.push('/login');
      return;
    }

    fetchPayslips();
  }, [user]);

  const fetchPayslips = async () => {
    if (!user?.userid) return;

    try {
      setLoading(true);
      setError(null);

      const filterParams = {
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status && { status: filters.status })
      };

      const data = await payrollrunApi.getEmployeePayslips(user.userid, filterParams);
      setPayslips(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load payslips');
      console.error('Error fetching payslips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (payslip: PaySlip) => {
    setSelectedPayslip(payslip);
    setShowDetailModal(true);
  };

  const handleDownloadPDF = async (payslipId: string) => {
    if (!user?.userid) return;

    try {
      setDownloading(payslipId);
      const blob = await payrollrunApi.downloadPayslipPDF(user.userid, payslipId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${payslipId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Failed to download payslip PDF');
      console.error('Error downloading payslip:', err);
    } finally {
      setDownloading(null);
    }
  };

  const handleApplyFilters = () => {
    fetchPayslips();
  };

  const handleClearFilters = () => {
    setFilters({ startDate: '', endDate: '', status: '' });
    setTimeout(() => fetchPayslips(), 100);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading payslips...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => onBack ? onBack() : router.push('/modules/payroll-execution')}
        >
          Back
        </button>
        <h1 className={styles.title}>My Payslips</h1>
      </div>

      {error && <div className={styles.errorBox}>{error}</div>}

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Filter Payslips</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Start Date</label>
            <input
              type="date"
              className={styles.formInput}
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>End Date</label>
            <input
              type="date"
              className={styles.formInput}
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Payment Status</label>
            <select
              className={styles.formSelect}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={styles.primaryButton} onClick={handleApplyFilters}>
            Apply Filters
          </button>
          <button className={styles.secondaryButton} onClick={handleClearFilters}>
            Clear
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Payslip History</h2>
        
        {payslips.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No payslips found</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Your payslips will appear here once they are generated by the payroll team
            </p>
          </div>
        ) : (
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Gross Salary</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payslips.map((payslip) => (
                  <tr key={payslip._id}>
                    <td>
                      {payslip.payrollRunId && typeof payslip.payrollRunId === 'object' 
                        ? new Date((payslip.payrollRunId as any).payrollPeriodDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : 'N/A'}
                    </td>
                    <td>
                      {payslip.totalGrossSalary.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'EGP'
                      })}
                    </td>
                    <td>
                      {(payslip.totaDeductions || 0).toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'EGP'
                      })}
                    </td>
                    <td>
                      <strong>
                        {payslip.netPay.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'EGP'
                        })}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          payslip.paymentStatus === 'paid'
                            ? styles.statusApproved
                            : styles.statusPending
                        }`}
                      >
                        {payslip.paymentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className={styles.primaryButton}
                          onClick={() => handleViewDetails(payslip)}
                          style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                        >
                          View Details
                        </button>
                        <button
                          className={styles.successButton}
                          onClick={() => handleDownloadPDF(payslip._id)}
                          disabled={downloading === payslip._id}
                          style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                        >
                          {downloading === payslip._id ? 'Downloading...' : 'Download PDF'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDetailModal && selectedPayslip && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Payslip Details</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#10b981' }}>
                Earnings
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ fontWeight: 500 }}>Base Salary:</span>
                  <span>{selectedPayslip.earningsDetails.baseSalary.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</span>
                </div>

                {selectedPayslip.earningsDetails.allowances?.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 500, marginTop: '1rem', marginBottom: '0.5rem' }}>Allowances:</div>
                    {selectedPayslip.earningsDetails.allowances.map((allowance: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', paddingLeft: '1rem' }}>
                        <span>{allowance.name || 'Allowance'}</span>
                        <span>{allowance.amount?.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPayslip.earningsDetails.bonuses && selectedPayslip.earningsDetails.bonuses.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 500, marginTop: '1rem', marginBottom: '0.5rem' }}>Bonuses:</div>
                    {selectedPayslip.earningsDetails.bonuses.map((bonus: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', paddingLeft: '1rem' }}>
                        <span>Signing Bonus</span>
                        <span>{bonus.givenAmount?.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPayslip.earningsDetails.refunds && selectedPayslip.earningsDetails.refunds.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 500, marginTop: '1rem', marginBottom: '0.5rem' }}>Refunds:</div>
                    {selectedPayslip.earningsDetails.refunds.map((refund: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', paddingLeft: '1rem' }}>
                        <span>{refund.reason || 'Refund'}</span>
                        <span>{refund.amount?.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', marginTop: '1rem', borderTop: '2px solid #10b981', fontWeight: 600, color: '#10b981' }}>
                  <span>Total Gross Salary:</span>
                  <span>{selectedPayslip.totalGrossSalary.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#ef4444' }}>
                Deductions
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                {selectedPayslip.deductionsDetails.taxes?.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Taxes:</div>
                    {selectedPayslip.deductionsDetails.taxes.map((tax: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', paddingLeft: '1rem' }}>
                        <span>{tax.name || 'Tax'} ({tax.percentage}%)</span>
                        <span>{((selectedPayslip.earningsDetails.baseSalary * (tax.percentage / 100))).toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPayslip.deductionsDetails.insurances && selectedPayslip.deductionsDetails.insurances.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 500, marginTop: '1rem', marginBottom: '0.5rem' }}>Insurance:</div>
                    {selectedPayslip.deductionsDetails.insurances.map((insurance: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', paddingLeft: '1rem' }}>
                        <span>{insurance.name || 'Insurance'} (Employee: {insurance.employeeContributionPercentage}%)</span>
                        <span>{((selectedPayslip.totalGrossSalary * (insurance.employeeContributionPercentage / 100))).toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPayslip.deductionsDetails.penalties && selectedPayslip.deductionsDetails.penalties.penalties && selectedPayslip.deductionsDetails.penalties.penalties.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 500, marginTop: '1rem', marginBottom: '0.5rem' }}>Penalties:</div>
                    {selectedPayslip.deductionsDetails.penalties.penalties.map((penalty: any, idx: number) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', paddingLeft: '1rem' }}>
                        <span>{penalty.reason || 'Penalty'}</span>
                        <span>{(penalty.amount || 0).toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', marginTop: '1rem', borderTop: '2px solid #ef4444', fontWeight: 600, color: '#ef4444' }}>
                  <span>Total Deductions:</span>
                  <span>{(selectedPayslip.totaDeductions || 0).toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700 }}>
                <span>Net Pay:</span>
                <span style={{ color: '#10b981' }}>
                  {selectedPayslip.netPay.toLocaleString('en-US', { style: 'currency', currency: 'EGP' })}
                </span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.successButton}
                onClick={() => handleDownloadPDF(selectedPayslip._id)}
              >
                Download PDF
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
