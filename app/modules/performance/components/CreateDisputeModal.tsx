/**
 * CreateDisputeModal Component
 * Allows employees to flag concerns about their appraisal ratings (REQ-AE-07)
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { useAuth } from '@/shared/hooks/useAuth';
import type { AppraisalAssignment, CreateAppraisalDisputeDto } from '../types';
import styles from './CreateDisputeModal.module.css';

interface CreateDisputeModalProps {
  assignment?: AppraisalAssignment;
  evaluationId?: string;
  employeeId?: string; // For HR employees creating disputes on behalf of employees
  employeeName?: string; // Display name for HR context
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDisputeModal({
  assignment,
  evaluationId,
  employeeId,
  employeeName,
  isOpen,
  onClose,
  onSuccess,
}: CreateDisputeModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [proposedRating, setProposedRating] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setDisputeReason('');
      setAdditionalComments('');
      setProposedRating('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!disputeReason.trim()) {
      setError('Please provide a reason for disputing this appraisal');
      return;
    }

    // Determine which employee ID to use
    // If employeeId is provided (HR creating on behalf), use it
    // Otherwise, use the logged-in user's ID (employee creating for themselves)
    const targetEmployeeId = employeeId || user?.userid;
    
    if (!targetEmployeeId) {
      setError('Employee ID not found. Please refresh and try again.');
      return;
    }

    // Get evaluation ID from assignment or prop
    let evalId = evaluationId;
    if (!evalId && assignment && (assignment as any).latestAppraisalId) {
      evalId = (assignment as any).latestAppraisalId;
    }

    if (!evalId) {
      setError('Evaluation ID not found. Please ensure the appraisal has been completed.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const disputeData: CreateAppraisalDisputeDto = {
        evaluationId: evalId,
        disputeReason: disputeReason.trim(),
        additionalComments: additionalComments.trim() || undefined,
        proposedRating: proposedRating ? Number(proposedRating) : undefined,
      };

      await performanceApi.createDispute(targetEmployeeId, disputeData);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      // Extract detailed error message
      let errorMessage = 'Failed to create dispute';
      if (err.response?.data) {
        if (Array.isArray(err.response.data.message)) {
          errorMessage = err.response.data.message.join(', ');
        } else if (typeof err.response.data.message === 'string') {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('Error creating dispute:', err);
      console.error('Error response data:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Flag Concern About Appraisal"
      size="xl"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.infoBox}>
          <p>
            <strong>Note:</strong> {employeeName 
              ? `You are flagging a concern about ${employeeName}'s appraisal rating.`
              : 'You can flag concerns about your appraisal rating.'
            } 
            HR will review the dispute and respond accordingly.
          </p>
        </div>

        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="disputeReason" className={styles.label}>
            Reason for Dispute <span className={styles.required}>*</span>
          </label>
          <textarea
            id="disputeReason"
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            className={styles.textarea}
            rows={4}
            placeholder="Please explain why you are disputing this appraisal rating..."
            required
          />
          <div className={styles.helpText}>
            Provide a clear explanation of your concerns about the appraisal rating.
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="proposedRating" className={styles.label}>
            Proposed Rating (Optional)
          </label>
          <Input
            id="proposedRating"
            type="number"
            value={proposedRating}
            onChange={(e) => setProposedRating(e.target.value ? parseFloat(e.target.value) : '')}
            placeholder="Enter your proposed rating"
            min="0"
            step="0.1"
          />
          <div className={styles.helpText}>
            If you believe a different rating is more appropriate, you can suggest it here.
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="additionalComments" className={styles.label}>
            Additional Comments (Optional)
          </label>
          <textarea
            id="additionalComments"
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            className={styles.textarea}
            rows={3}
            placeholder="Any additional information or context..."
          />
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
            disabled={loading || !disputeReason.trim()}
          >
            {loading ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

