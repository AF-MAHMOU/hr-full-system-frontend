/**
 * ResolveDisputeModal Component
 * Allows HR managers to resolve appraisal disputes (REQ-OD-07)
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { useAuth } from '@/shared/hooks/useAuth';
import type { AppraisalDispute, ResolveAppraisalDisputeDto } from '../types';
import { AppraisalDisputeStatus } from '../types';
import styles from './ResolveDisputeModal.module.css';

interface ResolveDisputeModalProps {
  dispute: AppraisalDispute;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ResolveDisputeModal({
  dispute,
  isOpen,
  onClose,
  onSuccess,
}: ResolveDisputeModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'RESOLVED' | 'REJECTED'>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [adjustedRating, setAdjustedRating] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setResolutionStatus('RESOLVED');
      setResolutionNotes('');
      setReviewComments('');
      setAdjustedRating('');
      setError(null);
    }
  }, [isOpen, dispute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resolutionNotes.trim()) {
      setError('Please provide resolution notes');
      return;
    }

    if (!user?.userid) {
      setError('User ID not found. Please refresh and try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Ensure we have a valid dispute ID
      const disputeId = dispute._id || (dispute as any).id;
      if (!disputeId) {
        setError('Dispute ID is missing. Please refresh and try again.');
        setLoading(false);
        return;
      }

      const resolveData: ResolveAppraisalDisputeDto = {
        status: resolutionStatus,
        resolutionNotes: resolutionNotes.trim(),
        reviewComments: reviewComments.trim() || undefined,
        adjustedRating: adjustedRating ? Number(adjustedRating) : undefined,
      };

      console.log('Resolving dispute with ID:', disputeId, 'Type:', typeof disputeId);
      await performanceApi.resolveDispute(String(disputeId), user.userid, resolveData);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to resolve dispute');
      console.error('Error resolving dispute:', err);
    } finally {
      setLoading(false);
    }
  };

  const employee = (dispute as any).raisedBy || dispute.raisedByEmployeeId;
  const employeeName = employee && typeof employee === 'object'
    ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Employee'
    : 'Employee';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Dispute"
      size="xl"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.disputeInfo}>
          <h4>Dispute Information</h4>
          <div className={styles.infoRow}>
            <span className={styles.label}>Employee:</span>
            <span className={styles.value}>{employeeName}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Status:</span>
            <span className={styles.value}>{dispute.status}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Submitted:</span>
            <span className={styles.value}>
              {dispute.submittedAt
                ? new Date(dispute.submittedAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
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
        </div>

        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="resolutionStatus" className={styles.label}>
            Resolution Status <span className={styles.required}>*</span>
          </label>
          <select
            id="resolutionStatus"
            value={resolutionStatus}
            onChange={(e) => setResolutionStatus(e.target.value as 'RESOLVED' | 'REJECTED')}
            className={styles.select}
            required
          >
            <option value="RESOLVED">Resolved (Rating Changed)</option>
            <option value="REJECTED">Rejected (Rating Unchanged)</option>
          </select>
          <div className={styles.helpText}>
            Select whether the dispute results in an adjusted rating or is rejected.
          </div>
        </div>

        {resolutionStatus === 'RESOLVED' && (
          <div className={styles.formGroup}>
            <label htmlFor="adjustedRating" className={styles.label}>
              Adjusted Rating (Optional)
            </label>
            <Input
              id="adjustedRating"
              type="number"
              value={adjustedRating}
              onChange={(e) => setAdjustedRating(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="Enter adjusted rating"
              min="0"
              step="0.1"
            />
            <div className={styles.helpText}>
              If you are adjusting the rating, enter the new rating value here.
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="resolutionNotes" className={styles.label}>
            Resolution Notes <span className={styles.required}>*</span>
          </label>
          <textarea
            id="resolutionNotes"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            className={styles.textarea}
            rows={4}
            placeholder="Explain your resolution decision..."
            required
          />
          <div className={styles.helpText}>
            Provide a clear explanation of how the dispute was resolved.
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="reviewComments" className={styles.label}>
            Review Comments (Optional)
          </label>
          <textarea
            id="reviewComments"
            value={reviewComments}
            onChange={(e) => setReviewComments(e.target.value)}
            className={styles.textarea}
            rows={3}
            placeholder="Additional review comments..."
          />
          <div className={styles.helpText}>
            Any additional comments about the review process.
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !resolutionNotes.trim()}
          >
            {loading ? 'Resolving...' : 'Resolve Dispute'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

