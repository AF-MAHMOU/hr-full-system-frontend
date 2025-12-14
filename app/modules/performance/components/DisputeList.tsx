/**
 * DisputeList Component
 * Displays all disputes for HR employees to monitor (REQ-AE-07)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { AppraisalDispute } from '../types';
import { AppraisalDisputeStatus } from '../types';
import ResolveDisputeModal from './ResolveDisputeModal';
import CreateDisputeModal from './CreateDisputeModal';
import CreateDisputeForEmployeeModal from './CreateDisputeForEmployeeModal';
import ExportButton from './ExportButton';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import styles from './DisputeList.module.css';

export default function DisputeList() {
  const { user } = useAuth();
  const isHrEmployee = user?.roles?.includes(SystemRole.HR_EMPLOYEE);
  const isHrManager = user?.roles?.includes(SystemRole.HR_MANAGER);
  const isHrAdmin = user?.roles?.includes(SystemRole.HR_ADMIN);
  const isSystemAdmin = user?.roles?.includes(SystemRole.SYSTEM_ADMIN);
  // Only HR Manager, HR Admin, and System Admin can resolve disputes
  const canResolveDisputes = isHrManager || isHrAdmin || isSystemAdmin;
  
  const [disputes, setDisputes] = useState<AppraisalDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppraisalDisputeStatus | ''>('');
  const [selectedDispute, setSelectedDispute] = useState<AppraisalDispute | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isCreateDisputeModalOpen, setIsCreateDisputeModalOpen] = useState(false);

  const fetchDisputes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // HR Employees see only their own disputes, HR Managers/Admins see all disputes
      let data: AppraisalDispute[];
      if (isHrEmployee && user?.userid) {
        data = await performanceApi.getEmployeeDisputes(user.userid);
        // Apply status filter client-side for HR Employees
        if (statusFilter) {
          data = data.filter(d => d.status === statusFilter);
        }
      } else {
        data = await performanceApi.getDisputes(statusFilter || undefined);
      }
      
      setDisputes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load disputes');
      console.error('Error fetching disputes:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, isHrEmployee, user?.userid]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status: AppraisalDisputeStatus) => {
    switch (status) {
      case AppraisalDisputeStatus.OPEN:
        return styles.statusOpen;
      case AppraisalDisputeStatus.UNDER_REVIEW:
        return styles.statusUnderReview;
      case AppraisalDisputeStatus.ADJUSTED:
        return styles.statusAdjusted;
      case AppraisalDisputeStatus.REJECTED:
        return styles.statusRejected;
      default:
        return styles.statusDefault;
    }
  };

  const formatStatus = (status: AppraisalDisputeStatus) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleResolveClick = (dispute: AppraisalDispute) => {
    console.log('Resolve clicked for dispute:', dispute);
    console.log('Dispute _id:', dispute._id, 'Type:', typeof dispute._id);
    console.log('Dispute object keys:', Object.keys(dispute));
    setSelectedDispute(dispute);
    setIsResolveModalOpen(true);
  };

  const handleResolveSuccess = () => {
    setIsResolveModalOpen(false);
    setSelectedDispute(null);
    fetchDisputes();
  };

  if (loading && disputes.length === 0) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading disputes...</div>
      </Card>
    );
  }

  if (error && disputes.length === 0) {
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
        <div>
          <h2>Appraisal Disputes</h2>
          <p>
            {isHrEmployee 
              ? 'View disputes you have raised about appraisal ratings'
              : 'Review and resolve employee concerns about appraisal ratings'}
          </p>
        </div>
        <div className={styles.controls}>
          {isHrEmployee && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateDisputeModalOpen(true)}
            >
              + Create Dispute
            </Button>
          )}
          <ExportButton
            status={statusFilter || undefined}
            variant="outline"
            size="sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AppraisalDisputeStatus | '')}
            className={styles.select}
          >
            <option value="">All Statuses</option>
            <option value={AppraisalDisputeStatus.OPEN}>Open</option>
            <option value={AppraisalDisputeStatus.UNDER_REVIEW}>Under Review</option>
            <option value={AppraisalDisputeStatus.ADJUSTED}>Adjusted</option>
            <option value={AppraisalDisputeStatus.REJECTED}>Rejected</option>
          </select>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDisputes}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {disputes.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No disputes found.</p>
            {statusFilter && (
              <p className={styles.note}>
                Try selecting &quot;All Statuses&quot; to see all disputes.
              </p>
            )}
          </div>
        </Card>
      ) : (
        <div className={styles.disputesGrid}>
          {disputes.map((dispute) => {
            const employee = (dispute as any).raisedBy || dispute.raisedByEmployeeId;
            const cycle = (dispute as any).cycle || dispute.cycleId;
            const appraisal = (dispute as any).appraisal || dispute.appraisalId;

            return (
              <Card key={dispute._id} padding="md" shadow="warm" className={styles.disputeCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3>
                      {employee && typeof employee === 'object'
                        ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Employee'
                        : 'Employee'}
                    </h3>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(dispute.status)}`}>
                      {formatStatus(dispute.status)}
                    </span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Cycle:</span>
                    <span className={styles.value}>
                      {cycle && typeof cycle === 'object'
                        ? cycle.name
                        : 'N/A'}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Submitted:</span>
                    <span className={styles.value}>{formatDate(dispute.submittedAt)}</span>
                  </div>
                  {dispute.resolvedAt && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Resolved:</span>
                      <span className={styles.value}>{formatDate(dispute.resolvedAt)}</span>
                    </div>
                  )}
                  <div className={styles.reasonBox}>
                    <span className={styles.label}>Reason:</span>
                    <p className={styles.reasonText}>{dispute.reason}</p>
                  </div>
                  {dispute.details && (
                    <div className={styles.detailsBox}>
                      <span className={styles.label}>Details:</span>
                      <p className={styles.detailsText}>{dispute.details}</p>
                    </div>
                  )}
                  {dispute.resolutionSummary && (
                    <div className={styles.resolutionBox}>
                      <span className={styles.label}>Resolution:</span>
                      <p className={styles.resolutionText}>{dispute.resolutionSummary}</p>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  {/* Only HR Manager/Admin can resolve disputes */}
                  {canResolveDisputes && (dispute.status === AppraisalDisputeStatus.OPEN ||
                    dispute.status === AppraisalDisputeStatus.UNDER_REVIEW) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleResolveClick(dispute)}
                    >
                      Resolve
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // View details - could open a modal or navigate
                      console.log('View dispute details:', dispute);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {isResolveModalOpen && selectedDispute && (
        <ResolveDisputeModal
          dispute={selectedDispute}
          isOpen={isResolveModalOpen}
          onClose={() => {
            setIsResolveModalOpen(false);
            setSelectedDispute(null);
          }}
          onSuccess={handleResolveSuccess}
        />
      )}
      
      {isHrEmployee && (
        <CreateDisputeForEmployeeModal
          isOpen={isCreateDisputeModalOpen}
          onClose={() => setIsCreateDisputeModalOpen(false)}
          onSuccess={() => {
            fetchDisputes();
            setIsCreateDisputeModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

