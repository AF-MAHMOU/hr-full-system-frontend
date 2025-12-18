/**
 * Payroll Execution Module - Main Dashboard
 * Lists all payroll runs and provides navigation to review/manage/approve pages
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Card, Button } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import { payrollrunApi } from './api/payrollExecutionAPI';
import type { PayrollRuns } from './types';
import PayrollReviewPage from './components/PayrollReviewPage';
import PayrollManagingPage from './components/PayrollManagingPage';
import PayrollFinanceApprovalPage from './components/PayrollFinanceApprovalPage';

export default function PayrollExecutionPage() {
  const { user } = useAuth();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRuns[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'review' | 'manage' | 'finance'>('list');

  useEffect(() => {
    fetchPayrollRuns();
  }, []);

  const fetchPayrollRuns = async () => {
    try {
      setLoading(true);
      const runs = await payrollrunApi.getPayrollRuns();
      setPayrollRuns(runs);
    } catch (err) {
      console.error('Failed to fetch payroll runs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRun = (runId: string, view: 'review' | 'manage' | 'finance') => {
    setSelectedRunId(runId);
    setActiveView(view);
  };

  const handleBackToList = () => {
    setSelectedRunId(null);
    setActiveView('list');
    fetchPayrollRuns();
  };

  // Render specific page if a run is selected
  if (selectedRunId && activeView === 'review') {
    return <PayrollReviewPage runId={selectedRunId} onBack={handleBackToList} />;
  }

  if (selectedRunId && activeView === 'manage') {
    return <PayrollManagingPage runId={selectedRunId} onBack={handleBackToList} />;
  }

  if (selectedRunId && activeView === 'finance') {
    return <PayrollFinanceApprovalPage runId={selectedRunId} onBack={handleBackToList} />;
  }

  // List view
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Payroll Execution
        </h1>
        <p style={{ color: '#718096' }}>
          Manage payroll runs, approvals, and payments
        </p>
      </div>

      {loading ? (
        <Card>
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading payroll runs...</p>
        </Card>
      ) : payrollRuns.length === 0 ? (
        <Card>
          <p style={{ textAlign: 'center', padding: '2rem' }}>No payroll runs found.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {payrollRuns.map((run) => (
            <Card key={run._id} hover>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {run.runId}
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#718096' }}>
                    <span>Period: {new Date(run.payrollPeriod).toLocaleDateString()}</span>
                    <span>Employees: {run.employees}</span>
                    <span>Exceptions: {run.exceptions}</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '0.375rem', 
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: run.status === 'draft' ? '#e2e8f0' : 
                                      run.status === 'approved' ? '#c6f6d5' : '#bee3f8',
                      color: run.status === 'draft' ? '#4a5568' : 
                             run.status === 'approved' ? '#22543d' : '#2c5282'
                    }}>
                      {run.status.toUpperCase()}
                    </span>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '0.375rem', 
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      backgroundColor: run.paymentStatus === 'paid' ? '#c6f6d5' : '#fef5e7',
                      color: run.paymentStatus === 'paid' ? '#22543d' : '#975a16'
                    }}>
                      {run.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {/* Specialist can review DRAFT */}
                  {run.status === 'draft' && user?.roles?.includes(SystemRole.PAYROLL_SPECIALIST) && (
                    <Button 
                      variant="primary" 
                      onClick={() => handleViewRun(run._id, 'review')}
                    >
                      Review
                    </Button>
                  )}

                  {/* Manager can manage UNDER_REVIEW, APPROVED, LOCKED */}
                  {(run.status === 'under review' || run.status === 'pending finance approval' || 
                    run.status === 'approved' || run.status === 'locked') && 
                   user?.roles?.includes(SystemRole.PAYROLL_MANAGER) && (
                    <Button 
                      variant="accent" 
                      onClick={() => handleViewRun(run._id, 'manage')}
                    >
                      Manage
                    </Button>
                  )}

                  {/* Finance can approve PENDING_FINANCE_APPROVAL */}
                  {run.status === 'pending finance approval' && 
                   user?.roles?.includes(SystemRole.FINANCE_STAFF) && (
                    <Button 
                      variant="success" 
                      onClick={() => handleViewRun(run._id, 'finance')}
                    >
                      Finance Approval
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}