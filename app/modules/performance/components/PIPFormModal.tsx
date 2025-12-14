/**
 * PIPFormModal Component
 * Form for creating/editing Performance Improvement Plans
 * REQ-OD-05: Line Manager initiates Performance Improvement Plans
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Card } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { useNotification } from '@/shared/hooks/useNotification';
import type {
  PerformanceImprovementPlan,
  CreatePerformanceImprovementPlanDto,
  UpdatePerformanceImprovementPlanDto,
} from '../types';
import styles from './PIPFormModal.module.css';

interface PIPFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appraisalRecordId: string;
  existingPIP?: PerformanceImprovementPlan | null;
}

export default function PIPFormModal({
  isOpen,
  onClose,
  onSuccess,
  appraisalRecordId,
  existingPIP,
}: PIPFormModalProps) {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reason: '',
    improvementAreas: [''],
    actionItems: [''],
    expectedOutcomes: '',
    startDate: '',
    targetCompletionDate: '',
    status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
    progressNotes: '',
    finalOutcome: '',
  });

  useEffect(() => {
    if (existingPIP) {
      setFormData({
        title: existingPIP.title || '',
        description: existingPIP.description || '',
        reason: existingPIP.reason || '',
        improvementAreas: existingPIP.improvementAreas || [''],
        actionItems: existingPIP.actionItems || [''],
        expectedOutcomes: existingPIP.expectedOutcomes || '',
        startDate: existingPIP.startDate ? new Date(existingPIP.startDate).toISOString().split('T')[0] : '',
        targetCompletionDate: existingPIP.targetCompletionDate ? new Date(existingPIP.targetCompletionDate).toISOString().split('T')[0] : '',
        status: existingPIP.status || 'DRAFT',
        progressNotes: existingPIP.progressNotes || '',
        finalOutcome: existingPIP.finalOutcome || '',
      });
    } else {
      // Reset form for new PIP
      setFormData({
        title: '',
        description: '',
        reason: '',
        improvementAreas: [''],
        actionItems: [''],
        expectedOutcomes: '',
        startDate: '',
        targetCompletionDate: '',
        status: 'DRAFT',
        progressNotes: '',
        finalOutcome: '',
      });
    }
  }, [existingPIP, isOpen]);

  const handleAddItem = (field: 'improvementAreas' | 'actionItems') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const handleRemoveItem = (field: 'improvementAreas' | 'actionItems', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (
    field: 'improvementAreas' | 'actionItems',
    index: number,
    value: string
  ) => {
    const newItems = [...formData[field]];
    newItems[index] = value;
    setFormData({
      ...formData,
      [field]: newItems,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      showError('Title is required');
      return;
    }
    if (!formData.reason.trim()) {
      showError('Reason is required');
      return;
    }
    if (formData.improvementAreas.filter(a => a.trim()).length === 0) {
      showError('At least one improvement area is required');
      return;
    }
    if (formData.actionItems.filter(a => a.trim()).length === 0) {
      showError('At least one action item is required');
      return;
    }
    if (!formData.startDate || !formData.targetCompletionDate) {
      showError('Start date and target completion date are required');
      return;
    }
    if (new Date(formData.targetCompletionDate) <= new Date(formData.startDate)) {
      showError('Target completion date must be after start date');
      return;
    }

    try {
      setLoading(true);
      
      if (existingPIP) {
        // Update existing PIP
        const updateDto: UpdatePerformanceImprovementPlanDto = {
          title: formData.title,
          description: formData.description || undefined,
          reason: formData.reason,
          improvementAreas: formData.improvementAreas.filter(a => a.trim()),
          actionItems: formData.actionItems.filter(a => a.trim()),
          expectedOutcomes: formData.expectedOutcomes || undefined,
          startDate: formData.startDate,
          targetCompletionDate: formData.targetCompletionDate,
          status: formData.status,
          progressNotes: formData.progressNotes || undefined,
          finalOutcome: formData.finalOutcome || undefined,
        };
        
        await performanceApi.updatePIP(appraisalRecordId, updateDto);
        showSuccess('Performance Improvement Plan updated successfully');
      } else {
        // Create new PIP
        const createDto: CreatePerformanceImprovementPlanDto = {
          appraisalRecordId,
          title: formData.title,
          description: formData.description || undefined,
          reason: formData.reason,
          improvementAreas: formData.improvementAreas.filter(a => a.trim()),
          actionItems: formData.actionItems.filter(a => a.trim()),
          expectedOutcomes: formData.expectedOutcomes || undefined,
          startDate: formData.startDate,
          targetCompletionDate: formData.targetCompletionDate,
        };
        
        await performanceApi.createPerformanceImprovementPlan(createDto);
        showSuccess('Performance Improvement Plan created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving PIP:', err);
      showError(err.response?.data?.message || err.message || 'Failed to save Performance Improvement Plan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingPIP ? 'Edit Performance Improvement Plan' : 'Create Performance Improvement Plan'} size="xl">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="e.g., Q1 2025 Performance Improvement Plan"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="Additional context about this PIP..."
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="reason">Reason for PIP *</label>
          <textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
            rows={4}
            placeholder="Explain why this Performance Improvement Plan is being initiated..."
          />
        </div>

        <div className={styles.field}>
          <label>Improvement Areas *</label>
          {formData.improvementAreas.map((area, index) => (
            <div key={index} className={styles.arrayItem}>
              <input
                type="text"
                value={area}
                onChange={(e) => handleItemChange('improvementAreas', index, e.target.value)}
                placeholder={`Improvement area ${index + 1}`}
              />
              {formData.improvementAreas.length > 1 && (
                <Button
                  type="button"
                  variant="error"
                  size="sm"
                  onClick={() => handleRemoveItem('improvementAreas', index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleAddItem('improvementAreas')}
          >
            + Add Improvement Area
          </Button>
        </div>

        <div className={styles.field}>
          <label>Action Items *</label>
          {formData.actionItems.map((item, index) => (
            <div key={index} className={styles.arrayItem}>
              <input
                type="text"
                value={item}
                onChange={(e) => handleItemChange('actionItems', index, e.target.value)}
                placeholder={`Action item ${index + 1}`}
              />
              {formData.actionItems.length > 1 && (
                <Button
                  type="button"
                  variant="error"
                  size="sm"
                  onClick={() => handleRemoveItem('actionItems', index)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleAddItem('actionItems')}
          >
            + Add Action Item
          </Button>
        </div>

        <div className={styles.field}>
          <label htmlFor="expectedOutcomes">Expected Outcomes</label>
          <textarea
            id="expectedOutcomes"
            value={formData.expectedOutcomes}
            onChange={(e) => setFormData({ ...formData, expectedOutcomes: e.target.value })}
            rows={3}
            placeholder="What success looks like..."
          />
        </div>

        <div className={styles.dateRow}>
          <div className={styles.field}>
            <label htmlFor="startDate">Start Date *</label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="targetCompletionDate">Target Completion Date *</label>
            <input
              id="targetCompletionDate"
              type="date"
              value={formData.targetCompletionDate}
              onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
              required
            />
          </div>
        </div>

        {existingPIP && (
          <>
            <div className={styles.field}>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="progressNotes">Progress Notes</label>
              <textarea
                id="progressNotes"
                value={formData.progressNotes}
                onChange={(e) => setFormData({ ...formData, progressNotes: e.target.value })}
                rows={4}
                placeholder="Update on progress made..."
              />
            </div>

            {formData.status === 'COMPLETED' && (
              <div className={styles.field}>
                <label htmlFor="finalOutcome">Final Outcome</label>
                <textarea
                  id="finalOutcome"
                  value={formData.finalOutcome}
                  onChange={(e) => setFormData({ ...formData, finalOutcome: e.target.value })}
                  rows={3}
                  placeholder="Summary of final results..."
                />
              </div>
            )}
          </>
        )}

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : existingPIP ? 'Update PIP' : 'Create PIP'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

