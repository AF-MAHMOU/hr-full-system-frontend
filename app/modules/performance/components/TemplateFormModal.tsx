/**
 * Template Form Modal Component
 * Create or edit appraisal templates
 * Updated to match backend schema structure
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import type { AppraisalTemplate, CreateAppraisalTemplateDto, RatingScaleDefinition, EvaluationCriterion } from '../types';
import { AppraisalTemplateType, AppraisalRatingScaleType } from '../types';
import { performanceApi } from '../api/performanceApi';
import styles from './TemplateFormModal.module.css';

interface TemplateFormModalProps {
  template: AppraisalTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingTemplates?: AppraisalTemplate[]; // For duplicate name checking
}

export default function TemplateFormModal({
  template,
  isOpen,
  onClose,
  onSuccess,
  existingTemplates = [],
}: TemplateFormModalProps) {
  const isEdit = !!template;

  // Helper function to get default rating scale based on type
  const getDefaultRatingScale = (type: AppraisalRatingScaleType) => {
    switch (type) {
      case AppraisalRatingScaleType.THREE_POINT:
        return { min: 1, max: 3, step: 1 };
      case AppraisalRatingScaleType.FIVE_POINT:
        return { min: 1, max: 5, step: 1 };
      case AppraisalRatingScaleType.TEN_POINT:
        return { min: 1, max: 10, step: 1 };
      default:
        return { min: 1, max: 5, step: 1 };
    }
  };

  const [formData, setFormData] = useState<CreateAppraisalTemplateDto>({
    name: '',
    description: '',
    templateType: AppraisalTemplateType.ANNUAL,
    ratingScale: {
      type: AppraisalRatingScaleType.FIVE_POINT,
      ...getDefaultRatingScale(AppraisalRatingScaleType.FIVE_POINT),
      labels: [],
    },
    criteria: [],
    instructions: '',
    isActive: true,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        templateType: template.templateType,
        ratingScale: {
          type: template.ratingScale.type,
          min: template.ratingScale.min,
          max: template.ratingScale.max,
          step: template.ratingScale.step || 1,
          labels: template.ratingScale.labels || [],
        },
        criteria: template.criteria || [],
        instructions: template.instructions || '',
        applicableDepartmentIds: template.applicableDepartmentIds,
        applicablePositionIds: template.applicablePositionIds,
        isActive: template.isActive,
      });
    } else {
      // Reset to default for new template
      setFormData({
        name: '',
        description: '',
        templateType: AppraisalTemplateType.ANNUAL,
        ratingScale: {
          type: AppraisalRatingScaleType.FIVE_POINT,
          ...getDefaultRatingScale(AppraisalRatingScaleType.FIVE_POINT),
          labels: [],
        },
        criteria: [],
        instructions: '',
        isActive: true,
      });
    }
  }, [template, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[TemplateForm] Form submitted, starting validation...');
    setError(null);

    // Validation
    if (!formData.name.trim()) {
      console.warn('[TemplateForm] Validation failed: Template name is required');
      setError('Template name is required');
      return;
    }
    console.log('[TemplateForm] Template name validation passed:', formData.name.trim());

    // Check for duplicate template name (client-side validation)
    const trimmedName = formData.name.trim();
    const duplicateTemplate = existingTemplates.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase() && (!isEdit || t._id !== template?._id)
    );
    if (duplicateTemplate) {
      setError(`Template with name "${trimmedName}" already exists. Please choose a different name.`);
      console.warn('[TemplateForm] Duplicate name detected:', {
        newName: trimmedName,
        existingTemplate: duplicateTemplate,
        isEdit,
        currentTemplateId: template?._id,
      });
      return;
    }

    console.log('[TemplateForm] Starting template submission:', {
      isEdit,
      templateId: template?._id,
      templateName: trimmedName,
      formData: {
        ...formData,
        name: trimmedName,
      },
    });

    if (!formData.ratingScale) {
      console.warn('[TemplateForm] Validation failed: Rating scale is required');
      setError('Rating scale is required');
      return;
    }
    console.log('[TemplateForm] Rating scale validation passed');

    // Validate criteria weights if provided
    if (formData.criteria && formData.criteria.length > 0) {
      console.log('[TemplateForm] Validating criteria:', formData.criteria.length, 'criteria');
      // Validate that all criteria have required fields
      for (const criterion of formData.criteria) {
        if (!criterion.key?.trim()) {
          console.warn('[TemplateForm] Validation failed: Criterion missing key');
          setError('All criteria must have a key');
          return;
        }
        if (!criterion.title?.trim()) {
          console.warn('[TemplateForm] Validation failed: Criterion missing title');
          setError('All criteria must have a title');
          return;
        }
      }

      // Validate weights if any criteria have weights
      const criteriaWithWeights = formData.criteria.filter(
        (c) => c.weight !== undefined && c.weight !== null && c.weight > 0,
      );
      if (criteriaWithWeights.length > 0) {
        const totalWeight = criteriaWithWeights.reduce(
          (sum, criterion) => sum + (criterion.weight || 0),
          0,
        );
        if (Math.abs(totalWeight - 100) > 0.01) {
          console.warn('[TemplateForm] Validation failed: Criteria weights sum to', totalWeight);
          setError(`Criteria weights must sum to 100%. Current sum: ${totalWeight}%`);
          return;
        }
      }
      console.log('[TemplateForm] Criteria validation passed');
    } else {
      console.log('[TemplateForm] No criteria to validate');
    }

    try {
      console.log('[TemplateForm] All validations passed, setting loading state and preparing data...');
      setIsLoading(true);
      
      // Clean up the data - remove empty strings for optional fields
      console.log('[TemplateForm] Cleaning form data...');
      const cleanedData: CreateAppraisalTemplateDto = {
        name: formData.name.trim(),
        templateType: formData.templateType,
        ratingScale: {
          type: formData.ratingScale.type,
          min: formData.ratingScale.min,
          max: formData.ratingScale.max,
          step: formData.ratingScale.step,
          labels: formData.ratingScale.labels,
        },
        description: formData.description?.trim() || undefined,
        instructions: formData.instructions?.trim() || undefined,
        criteria: (formData.criteria || []).map(c => ({
          key: c.key.trim(),
          title: c.title.trim(),
          details: c.details?.trim() || undefined,
          weight: c.weight,
          maxScore: c.maxScore,
          required: c.required,
        })),
        applicableDepartmentIds: formData.applicableDepartmentIds,
        applicablePositionIds: formData.applicablePositionIds,
        isActive: formData.isActive,
      };

      // Log the data being sent for debugging
      console.log('[TemplateForm] Sending template data to API:', {
        method: isEdit ? 'PUT' : 'POST',
        endpoint: isEdit ? `templates/${template._id}` : 'templates',
        data: cleanedData,
        timestamp: new Date().toISOString(),
      });

      let response;
      if (isEdit && template?._id) {
        console.log('[TemplateForm] Updating template:', template._id);
        response = await performanceApi.updateTemplate(template._id, cleanedData);
        console.log('[TemplateForm] Template updated successfully:', response);
      } else {
        console.log('[TemplateForm] Creating new template - calling API now...');
        console.log('[TemplateForm] API call data:', JSON.stringify(cleanedData, null, 2));
        try {
          response = await performanceApi.createTemplate(cleanedData);
          console.log('[TemplateForm] Template created successfully:', response);
        } catch (apiError: any) {
          console.error('[TemplateForm] API call failed:', apiError);
          throw apiError; // Re-throw to be caught by outer catch
        }
      }
      
      console.log('[TemplateForm] Calling onSuccess and onClose...');
      onSuccess();
      onClose();
      console.log('[TemplateForm] Form submission complete');
    } catch (err: any) {
      // Enhanced error handling with detailed logging
      console.error('[TemplateForm] Template save error:', {
        error: err,
        response: err.response,
        responseData: err.response?.data,
        responseStatus: err.response?.status,
        responseStatusText: err.response?.statusText,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      });

      // Extract error message from response
      let errorMessage = 'Failed to save template';
      
      // Check for duplicate key errors (MongoDB E11000)
      if (err.response?.data) {
        const responseData = err.response.data;
        
        // Check for MongoDB duplicate key error
        if (responseData.message?.includes('E11000') || responseData.message?.includes('duplicate key')) {
          if (responseData.message?.includes('templateCode')) {
            errorMessage = 'A template with this code already exists. Please contact support to resolve this issue.';
            console.error('[TemplateForm] Duplicate templateCode error detected - this may be a database index issue');
          } else if (responseData.message?.includes('name')) {
            errorMessage = `Template with name "${formData.name.trim()}" already exists. Please choose a different name.`;
          } else {
            errorMessage = 'A template with this information already exists. Please check for duplicates.';
          }
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.message) {
          if (Array.isArray(responseData.message)) {
            errorMessage = responseData.message.join(', ');
          } else {
            errorMessage = responseData.message;
          }
        } else if (responseData.error) {
          errorMessage = responseData.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('[TemplateForm] Final error message to display:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingScaleChange = (field: keyof RatingScaleDefinition, value: any) => {
    // If scale type changes, auto-update min/max/step to defaults
    if (field === 'type') {
      const defaults = getDefaultRatingScale(value as AppraisalRatingScaleType);
      setFormData({
        ...formData,
        ratingScale: {
          type: value,
          min: defaults.min,
          max: defaults.max,
          step: defaults.step,
          labels: [], // Reset labels when type changes
        },
      });
    } else {
      setFormData({
        ...formData,
        ratingScale: {
          ...formData.ratingScale,
          [field]: value,
        },
      });
    }
  };

  const addCriterion = () => {
    const newCriterion: EvaluationCriterion = {
      key: `criterion-${Date.now()}`,
      title: '',
      weight: 0,
      required: true,
    };
    setFormData({
      ...formData,
      criteria: [...(formData.criteria || []), newCriterion],
    });
  };

  const removeCriterion = (index: number) => {
    setFormData({
      ...formData,
      criteria: (formData.criteria || []).filter((_, i) => i !== index),
    });
  };

  const updateCriterion = (index: number, updates: Partial<EvaluationCriterion>) => {
    setFormData({
      ...formData,
      criteria: (formData.criteria || []).map((c, i) =>
        i === index ? { ...c, ...updates } : c
      ),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Appraisal Template' : 'Create Appraisal Template'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorMessage} role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className={styles.formGrid}>
          <Input
            id="name"
            name="name"
            type="text"
            label="Template Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
            disabled={isLoading}
            placeholder="e.g., Annual Performance Review 2024"
          />

          <div className={styles.selectWrapper}>
            <label htmlFor="templateType" className={styles.label}>
              Template Type <span className={styles.required}>*</span>
            </label>
            <select
              id="templateType"
              name="templateType"
              value={formData.templateType}
              onChange={(e) => setFormData({ ...formData, templateType: e.target.value as AppraisalTemplateType })}
              required
              disabled={isLoading}
              className={styles.select}
            >
              {Object.values(AppraisalTemplateType).map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.textareaWrapper}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isLoading}
            rows={3}
            className={styles.textarea}
            placeholder="Template description..."
          />
        </div>

        {/* Rating Scale Section */}
        <div className={styles.section}>
          <h3>Rating Scale Configuration</h3>
          <div className={styles.formGrid}>
            <div className={styles.selectWrapper}>
              <label htmlFor="scaleType" className={styles.label}>
                Scale Type <span className={styles.required}>*</span>
              </label>
              <select
                id="scaleType"
                name="scaleType"
                value={formData.ratingScale.type}
                onChange={(e) => handleRatingScaleChange('type', e.target.value as AppraisalRatingScaleType)}
                required
                disabled={isLoading}
                className={styles.select}
              >
                {Object.values(AppraisalRatingScaleType).map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="min"
              name="min"
              type="number"
              label="Minimum Value"
              value={formData.ratingScale.min}
              onChange={(e) => handleRatingScaleChange('min', Number(e.target.value))}
              required
              disabled={isLoading}
              min={0}
            />

            <Input
              id="max"
              name="max"
              type="number"
              label="Maximum Value"
              value={formData.ratingScale.max}
              onChange={(e) => handleRatingScaleChange('max', Number(e.target.value))}
              required
              disabled={isLoading}
              min={formData.ratingScale.min}
            />

            <div className={styles.inputWrapper}>
              <label htmlFor="step" className={styles.label}>
                Step
              </label>
              <div className={styles.stepInputContainer}>
                <input
                  id="step"
                  name="step"
                  type="number"
                  className={styles.stepInput}
                  value={formData.ratingScale.step ? Number(formData.ratingScale.step.toFixed(1)) : 1}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    // Round to 1 decimal place to avoid floating-point precision issues
                    const roundedValue = Math.round(value * 10) / 10;
                    handleRatingScaleChange('step', roundedValue || 1);
                  }}
                  disabled={isLoading}
                  min={0.1}
                  step={0.1}
                />
                <div className={styles.stepButtons}>
                  <button
                    type="button"
                    className={styles.stepButton}
                    onClick={() => {
                      const currentStep = formData.ratingScale.step || 1;
                      // Round to 1 decimal place to avoid floating-point precision issues
                      const newStep = Math.round((currentStep + 0.1) * 10) / 10;
                      handleRatingScaleChange('step', newStep);
                    }}
                    disabled={isLoading}
                    aria-label="Increase step"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className={styles.stepButton}
                    onClick={() => {
                      const currentStep = formData.ratingScale.step || 1;
                      // Round to 1 decimal place to avoid floating-point precision issues
                      const newStep = Math.max(0.1, Math.round((currentStep - 0.1) * 10) / 10);
                      handleRatingScaleChange('step', newStep);
                    }}
                    disabled={isLoading}
                    aria-label="Decrease step"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Criteria Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Evaluation Criteria</h3>
            <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
              + Add Criterion
            </Button>
          </div>

          {(formData.criteria || []).map((criterion, index) => (
            <div key={criterion.key || index} className={styles.criterionCard}>
              <div className={styles.criterionRow}>
                <Input
                  id={`criterion-key-${index}`}
                  name={`criterion-key-${index}`}
                  type="text"
                  label="Key"
                  value={criterion.key}
                  onChange={(e) => updateCriterion(index, { key: e.target.value })}
                  required
                  disabled={isLoading}
                  placeholder="e.g., code-quality"
                />
                <Input
                  id={`criterion-title-${index}`}
                  name={`criterion-title-${index}`}
                  type="text"
                  label="Title"
                  value={criterion.title}
                  onChange={(e) => updateCriterion(index, { title: e.target.value })}
                  required
                  disabled={isLoading}
                  placeholder="e.g., Code Quality"
                />
                <Input
                  id={`criterion-weight-${index}`}
                  name={`criterion-weight-${index}`}
                  type="number"
                  label="Weight (%)"
                  value={criterion.weight || 0}
                  onChange={(e) => updateCriterion(index, { weight: Number(e.target.value) })}
                  disabled={isLoading}
                  min={0}
                  max={100}
                />
                <div className={styles.checkboxGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={criterion.required !== false}
                      onChange={(e) => updateCriterion(index, { required: e.target.checked })}
                      disabled={isLoading}
                    />
                    Required
                  </label>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeCriterion(index)}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              </div>
              <div className={styles.textareaWrapper}>
                <label htmlFor={`criterion-details-${index}`} className={styles.label}>
                  Details
                </label>
                <textarea
                  id={`criterion-details-${index}`}
                  name={`criterion-details-${index}`}
                  value={criterion.details || ''}
                  onChange={(e) => updateCriterion(index, { details: e.target.value })}
                  disabled={isLoading}
                  rows={2}
                  className={styles.textarea}
                  placeholder="Criterion details..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.textareaWrapper}>
          <label htmlFor="instructions" className={styles.label}>
            Instructions
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            disabled={isLoading}
            rows={3}
            className={styles.textarea}
            placeholder="Instructions for using this template..."
          />
        </div>

        <div className={styles.checkboxGroup}>
          <label>
            <input
              type="checkbox"
              checked={formData.isActive !== false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={isLoading}
            />
            Active
          </label>
        </div>

        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            onClick={(e) => {
              console.log('[TemplateForm] Submit button clicked');
              // Let the form handle submission, but log it
            }}
          >
            {isEdit ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
