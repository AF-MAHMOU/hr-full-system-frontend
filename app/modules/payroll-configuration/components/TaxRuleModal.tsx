/**
 * ========================== EMAD ==========================
 * TaxRuleModal Component
 * Modal for creating and editing tax rules with bracket support
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/shared/components';
import { taxRuleApi } from '../api/payrollConfigApi';
import {
  TaxCalculationType,
} from '../types';
import type {
  TaxRule,
  CreateTaxRuleDto,
  UpdateTaxRuleDto,
  TaxBracket,
} from '../types';
import styles from '../page.module.css';

interface TaxRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  taxRule: TaxRule | null;
  readOnly?: boolean;
}

interface FormData {
  name: string;
  description: string;
  calculationType: TaxCalculationType;
  rate: string;
  brackets: TaxBracket[];
  effectiveFrom: string;
  effectiveTo: string;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  rate?: string;
  brackets?: string;
  effectiveFrom?: string;
  general?: string;
}

const EMPTY_BRACKET: TaxBracket = { minAmount: 0, maxAmount: 0, rate: 0, fixedAmount: 0 };

const TaxRuleModal: React.FC<TaxRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taxRule,
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    calculationType: TaxCalculationType.FLAT,
    rate: '',
    brackets: [],
    effectiveFrom: '',
    effectiveTo: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!taxRule;

  useEffect(() => {
    if (taxRule) {
      setFormData({
        name: taxRule.name,
        description: taxRule.description || '',
        calculationType: taxRule.calculationType,
        rate: taxRule.rate?.toString() || '',
        brackets: taxRule.brackets || [],
        effectiveFrom: taxRule.effectiveFrom
          ? new Date(taxRule.effectiveFrom).toISOString().split('T')[0]
          : '',
        effectiveTo: taxRule.effectiveTo
          ? new Date(taxRule.effectiveTo).toISOString().split('T')[0]
          : '',
        isActive: taxRule.isActive,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        calculationType: TaxCalculationType.FLAT,
        rate: '',
        brackets: [],
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
        isActive: true,
      });
    }
    setErrors({});
  }, [taxRule, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = 'Effective from date is required';
    }

    if (formData.calculationType === 'FLAT') {
      if (!formData.rate || isNaN(Number(formData.rate))) {
        newErrors.rate = 'Valid tax rate is required for flat calculation';
      } else if (Number(formData.rate) < 0 || Number(formData.rate) > 100) {
        newErrors.rate = 'Tax rate must be between 0 and 100';
      }
    } else {
      // Progressive or Tiered
      if (formData.brackets.length === 0) {
        newErrors.brackets = 'At least one tax bracket is required';
      } else {
        // Validate brackets
        for (let i = 0; i < formData.brackets.length; i++) {
          const bracket = formData.brackets[i];
          if (bracket.minAmount < 0 || bracket.maxAmount < 0 || bracket.rate < 0) {
            newErrors.brackets = 'All bracket values must be non-negative';
            break;
          }
          if (bracket.maxAmount <= bracket.minAmount && bracket.maxAmount !== 0) {
            newErrors.brackets = 'Max amount must be greater than min amount (or 0 for unlimited)';
            break;
          }
          if (bracket.rate > 100) {
            newErrors.brackets = 'Bracket rate cannot exceed 100%';
            break;
          }
        }
      }
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

      const payload: CreateTaxRuleDto | UpdateTaxRuleDto = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        calculationType: formData.calculationType,
        rate: formData.calculationType === 'FLAT' ? Number(formData.rate) : undefined,
        brackets: formData.calculationType !== 'FLAT' ? formData.brackets : undefined,
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || undefined,
        isActive: formData.isActive,
      };

      if (isEditing && taxRule) {
        await taxRuleApi.update(taxRule._id, payload as UpdateTaxRuleDto);
      } else {
        await taxRuleApi.create(payload as CreateTaxRuleDto);
      }

      onSave();
    } catch (err: any) {
      setErrors({
        general: err.response?.data?.message || 'Failed to save tax rule',
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

  const handleCalculationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as TaxCalculationType;
    setFormData((prev) => ({
      ...prev,
      calculationType: newType,
      rate: newType === 'FLAT' ? prev.rate : '',
      brackets: newType !== 'FLAT' && prev.brackets.length === 0 ? [{ ...EMPTY_BRACKET }] : prev.brackets,
    }));
    setErrors({});
  };

  const addBracket = () => {
    const lastBracket = formData.brackets[formData.brackets.length - 1];
    const newMinAmount = lastBracket ? lastBracket.maxAmount : 0;
    setFormData((prev) => ({
      ...prev,
      brackets: [...prev.brackets, { ...EMPTY_BRACKET, minAmount: newMinAmount }],
    }));
  };

  const removeBracket = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      brackets: prev.brackets.filter((_, i) => i !== index),
    }));
  };

  const updateBracket = (index: number, field: keyof TaxBracket, value: number) => {
    setFormData((prev) => ({
      ...prev,
      brackets: prev.brackets.map((bracket, i) =>
        i === index ? { ...bracket, [field]: value } : bracket
      ),
    }));
    if (errors.brackets) {
      setErrors((prev) => ({ ...prev, brackets: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={readOnly ? 'View Tax Rule' : isEditing ? 'Edit Tax Rule' : 'Create Tax Rule'}
      size="lg"
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
                placeholder="e.g., Standard Income Tax 2024"
                disabled={readOnly}
              />
              {errors.name && <span className={styles.formError}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Calculation Type <span>*</span>
              </label>
              <select
                name="calculationType"
                className={styles.formSelect}
                value={formData.calculationType}
                onChange={handleCalculationTypeChange}
                disabled={readOnly}
              >
                <option value="FLAT">Flat Rate</option>
                <option value="PROGRESSIVE">Progressive</option>
                <option value="TIERED">Tiered Brackets</option>
              </select>
            </div>

            {formData.calculationType === 'FLAT' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Tax Rate (%) <span>*</span>
                </label>
                <input
                  type="number"
                  name="rate"
                  className={styles.formInput}
                  value={formData.rate}
                  onChange={handleChange}
                  placeholder="e.g., 15"
                  min="0"
                  max="100"
                  step="0.5"
                  disabled={readOnly}
                />
                {errors.rate && <span className={styles.formError}>{errors.rate}</span>}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Effective From <span>*</span>
              </label>
              <input
                type="date"
                name="effectiveFrom"
                className={styles.formInput}
                value={formData.effectiveFrom}
                onChange={handleChange}
                disabled={readOnly}
              />
              {errors.effectiveFrom && (
                <span className={styles.formError}>{errors.effectiveFrom}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Effective To</label>
              <input
                type="date"
                name="effectiveTo"
                className={styles.formInput}
                value={formData.effectiveTo}
                onChange={handleChange}
                disabled={readOnly}
              />
              <span style={{ fontSize: '0.75rem', color: '#666' }}>
                Leave empty for no end date
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
                Used in payroll calculations
              </span>
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.formLabel}>Description</label>
              <textarea
                name="description"
                className={styles.formTextarea}
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description for this tax rule..."
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Tax Brackets Section */}
          {formData.calculationType !== 'FLAT' && (
            <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
              <label className={styles.formLabel}>
                Tax Brackets <span>*</span>
              </label>
              {errors.brackets && <span className={styles.formError}>{errors.brackets}</span>}

              {formData.brackets.length > 0 && (
                <table className={styles.bracketsTable}>
                  <thead>
                    <tr>
                      <th>Min Amount (EGP)</th>
                      <th>Max Amount (EGP)</th>
                      <th>Rate (%)</th>
                      <th>Fixed Amount (EGP)</th>
                      {!readOnly && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {formData.brackets.map((bracket, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={bracket.minAmount}
                            onChange={(e) =>
                              updateBracket(index, 'minAmount', Number(e.target.value))
                            }
                            min="0"
                            step="100"
                            disabled={readOnly}
                            style={{ width: '100%' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={bracket.maxAmount}
                            onChange={(e) =>
                              updateBracket(index, 'maxAmount', Number(e.target.value))
                            }
                            min="0"
                            step="100"
                            disabled={readOnly}
                            style={{ width: '100%' }}
                            placeholder="0 for unlimited"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={bracket.rate}
                            onChange={(e) => updateBracket(index, 'rate', Number(e.target.value))}
                            min="0"
                            max="100"
                            step="0.5"
                            disabled={readOnly}
                            style={{ width: '100%' }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className={styles.formInput}
                            value={bracket.fixedAmount || 0}
                            onChange={(e) =>
                              updateBracket(index, 'fixedAmount', Number(e.target.value))
                            }
                            min="0"
                            step="100"
                            disabled={readOnly}
                            style={{ width: '100%' }}
                          />
                        </td>
                        {!readOnly && (
                          <td>
                            <button
                              type="button"
                              className={styles.removeBracketButton}
                              onClick={() => removeBracket(index)}
                            >
                              Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {!readOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBracket}
                  className={styles.addBracketButton}
                >
                  + Add Bracket
                </Button>
              )}
            </div>
          )}

          <div className={styles.formActions}>
            <Button type="button" variant="outline" onClick={onClose}>
              {readOnly ? 'Close' : 'Cancel'}
            </Button>
            {!readOnly && (
              <Button type="submit" variant="primary" isLoading={loading}>
                {isEditing ? 'Update' : 'Create'} Tax Rule
              </Button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TaxRuleModal;
