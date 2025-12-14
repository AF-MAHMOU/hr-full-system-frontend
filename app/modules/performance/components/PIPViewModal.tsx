/**
 * PIPViewModal Component
 * Read-only view of a Performance Improvement Plan for employees
 * REQ-OD-05: Line Manager initiates Performance Improvement Plans
 */

'use client';

import { Modal, Button } from '@/shared/components';
import type { PerformanceImprovementPlan } from '../types';
import styles from './PIPViewModal.module.css';

interface PIPViewModalProps {
  pip: PerformanceImprovementPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PIPViewModal({ pip, isOpen, onClose }: PIPViewModalProps) {
  if (!isOpen || !pip) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return styles.statusDraft;
      case 'ACTIVE':
        return styles.statusActive;
      case 'COMPLETED':
        return styles.statusCompleted;
      case 'CANCELLED':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Performance Improvement Plan" size="xl">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{pip.title}</h2>
          <span className={`${styles.statusBadge} ${getStatusBadgeClass(pip.status)}`}>
            {pip.status}
          </span>
        </div>

        {pip.description && (
          <div className={styles.section}>
            <h3>Description</h3>
            <p>{pip.description}</p>
          </div>
        )}

        <div className={styles.section}>
          <h3>Reason for PIP</h3>
          <p>{pip.reason}</p>
        </div>

        {pip.improvementAreas && pip.improvementAreas.length > 0 && (
          <div className={styles.section}>
            <h3>Improvement Areas</h3>
            <ul>
              {pip.improvementAreas.map((area, index) => (
                <li key={index}>{area}</li>
              ))}
            </ul>
          </div>
        )}

        {pip.actionItems && pip.actionItems.length > 0 && (
          <div className={styles.section}>
            <h3>Action Items</h3>
            <ul>
              {pip.actionItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {pip.expectedOutcomes && (
          <div className={styles.section}>
            <h3>Expected Outcomes</h3>
            <p>{pip.expectedOutcomes}</p>
          </div>
        )}

        <div className={styles.dateSection}>
          <div className={styles.dateRow}>
            <div>
              <strong>Start Date:</strong> {formatDate(pip.startDate)}
            </div>
            <div>
              <strong>Target Completion Date:</strong> {formatDate(pip.targetCompletionDate)}
            </div>
          </div>
          {pip.actualCompletionDate && (
            <div>
              <strong>Completed Date:</strong> {formatDate(pip.actualCompletionDate)}
            </div>
          )}
        </div>

        {pip.progressNotes && (
          <div className={styles.section}>
            <h3>Progress Notes</h3>
            <p>{pip.progressNotes}</p>
          </div>
        )}

        {pip.finalOutcome && (
          <div className={styles.section}>
            <h3>Final Outcome</h3>
            <p>{pip.finalOutcome}</p>
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

