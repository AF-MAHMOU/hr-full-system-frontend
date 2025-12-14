/**
 * AcknowledgmentModal Component
 * Allows employees to acknowledge their appraisal results (REQ-PP-07)
 */

'use client';

import { useState } from 'react';
import { Modal, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { useNotification } from '@/shared/hooks';
import type { AppraisalAssignment } from '../types';
import styles from './AcknowledgmentModal.module.css';

interface AcknowledgmentModalProps {
  assignment: AppraisalAssignment;
  evaluationId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AcknowledgmentModal({
  assignment,
  evaluationId,
  isOpen,
  onClose,
  onSuccess,
}: AcknowledgmentModalProps) {
  const { showSuccess, showError } = useNotification('performance');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get evaluation ID from assignment or prop
    let evalId = evaluationId;
    if (!evalId && (assignment as any).latestAppraisalId) {
      evalId = (assignment as any).latestAppraisalId;
    }

    if (!evalId) {
      setError('Evaluation ID not found. Please ensure the appraisal has been published.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await performanceApi.acknowledgeEvaluation(evalId, comment.trim() || undefined);
      
      showSuccess('Appraisal acknowledged successfully');
      onSuccess();
      onClose();
      setComment('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to acknowledge appraisal';
      setError(errorMessage);
      showError(errorMessage, { title: 'Acknowledgment Failed' });
      console.error('Error acknowledging evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setComment('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Acknowledge Appraisal"
      size="md"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.infoBox}>
          <p>
            <strong>Note:</strong> By acknowledging this appraisal, you confirm that you have reviewed 
            and understood your performance evaluation results.
          </p>
        </div>

        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="comment" className={styles.label}>
            Optional Comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className={styles.textarea}
            rows={4}
            placeholder="You can add any comments or feedback about this appraisal (optional)..."
          />
          <div className={styles.helpText}>
            Add any comments or feedback about your appraisal evaluation.
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Acknowledging...' : 'Acknowledge Appraisal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

