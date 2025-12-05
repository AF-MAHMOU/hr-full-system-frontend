/**
 * ========================== EMAD ==========================
 * AllowanceModal Component
 * Modal for creating and editing allowances
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/shared/components';
import { allowanceApi } from '../api/payrollConfigApi';
import {
  AllowanceType,
  AllowanceFrequency,
} from '../types';
import type {
  Allowance,
  CreateAllowanceDto,
  UpdateAllowanceDto,
} from '../types';
import styles from '../page.module.css';

interface AllowanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  allowance: Allowance | null;
  readOnly?: boolean;
}

interface FormData {
  name: string;
  description: string;
  type: AllowanceType;
  value: string;
  frequency: AllowanceFrequency;
  isTaxable: boolean;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  value?: string;
  general?: string;
}

const AllowanceModal: React.FC<AllowanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  allowance,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    type: AllowanceType.FIXED,
    value: '',
    frequency: AllowanceFrequency.MONTHLY,
    isTaxable: true,
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!allowance;

  useEffect(() => {
    if (allowance) {
      setFormData({
        name: allowance.name,
        description: allowance.description || '',
        type: allowance.type,
        value: allowance.value.toString(),
        frequency: allowance.frequency,
        isTaxable: allowance.isTaxable,
        isActive: allowance.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: AllowanceType.FIXED,
        value: '',
        frequency: AllowanceFrequency.MONTHLY,
        isTaxable: true,
        isActive: true,
      });
    }
    setErrors({});
  }, [allowance, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.value || isNaN(Number(formData.value))) {
      newErrors.value = 'Valid value is required';
    } else if (Number(formData.value) < 0) {
      newErrors.value = 'Value cannot be negative';
    } else if (formData.type === 'PERCENTAGE' && Number(formData.value) > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (readOnly) return;
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      const payload: CreateAllowanceDto | UpdateAllowanceDto = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        value: Number(formData.value),
        frequency: formData.frequency,
        isTaxable: formData.isTaxable,
        isActive: formData.isActive,
      };

      if (isEditing && allowance) {
        await allowanceApi.update(allowance._id, payload as UpdateAllowanceDto);
      } else {
        await allowanceApi.create(payload as CreateAllowanceDto);
      }

      onSave();
    } catch (err: any) {
      setErrors({
        general: err.response?.data?.message || 'Failed to save allowance',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={readOnly ? 'View Allowance' : isEditing ? 'Edit Allowance' : 'Create Allowance'}
      size="md"
    >
      <div className={styles.modalContent}>
        <form className={styles.form} onSubmit={handleSubmit}>
          {errors.general && (
            <div className={styles.formError} style={{ marginBottom: '1rem' }}>
              {errors.general}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Name <span>*</span>
              </label>
              <input
                type="text"
                name="name"
                className={styles.formInput}
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Housing Allowance, Transport Allowance"
                disabled={readOnly}
              />
              {errors.name && <span className={styles.formError}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Type <span>*</span>
              </label>
              <select
                name="type"
                className={styles.formSelect}
                value={formData.type}
                onChange={handleChange}
                disabled={readOnly}
              >
                <option value="FIXED">Fixed Amount</option>
                <option value="PERCENTAGE">Percentage of Salary</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Value <span>*</span>
              </label>
              <input
                type="number"
                name="value"
                className={styles.formInput}
                value={formData.value}
                onChange={handleChange}
                placeholder={formData.type === 'PERCENTAGE' ? 'e.g., 10' : 'e.g., 1000'}
                min="0"
                max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                step={formData.type === 'PERCENTAGE' ? '0.5' : '100'}
                disabled={readOnly}
              />
              <span style={{ fontSize: '0.75rem', color: '#666' }}>
                {formData.type === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (EGP)'}
              </span>
              {errors.value && <span className={styles.formError}>{errors.value}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Frequency <span>*</span>
              </label>
              <select
                name="frequency"
                className={styles.formSelect}
                value={formData.frequency}
                onChange={handleChange}
                disabled={readOnly}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUALLY">Annually</option>
                <option value="ONE_TIME">One-Time</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formCheckbox}>
                <input
                  type="checkbox"
                  name="isTaxable"
                  checked={formData.isTaxable}
                  onChange={handleChange}
                  disabled={readOnly}
                />
                <span>Taxable Allowance</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>
                Subject to income tax deduction
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formCheckbox}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={readOnly}
                />
                <span>Active</span>
              </label>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>
                Available for payroll calculation
              </span>
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                name="description"
                className={styles.formTextarea}
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description for this allowance..."
                disabled={readOnly}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={onClose}>
              {readOnly ? 'Close' : 'Cancel'}
            </Button>
            {!readOnly && (
              <Button type="submit" variant="primary" isLoading={loading}>
                {isEditing ? 'Update' : 'Create'} Allowance
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AllowanceModal;
