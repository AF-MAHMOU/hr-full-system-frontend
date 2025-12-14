/**
 * OutcomeReportGenerator Component
 * REQ-OD-06: HR Employee generates outcome reports
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Modal } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { useNotification } from '@/shared/hooks';
import type { AppraisalCycle } from '../types';
import styles from './OutcomeReportGenerator.module.css';

interface OutcomeReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OutcomeReportGenerator({
  isOpen,
  onClose,
}: OutcomeReportGeneratorProps) {
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [includeHighPerformers, setIncludeHighPerformers] = useState(true);
  const [includePIPs, setIncludePIPs] = useState(true);
  const [includeDisputes, setIncludeDisputes] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchCycles();
    }
  }, [isOpen]);

  const fetchCycles = async () => {
    try {
      const data = await performanceApi.getCycles();
      setCycles(data);
    } catch (err: any) {
      console.error('Error fetching cycles:', err);
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const params = {
        cycleId: selectedCycleId || undefined,
        departmentId: selectedDepartmentId || undefined,
        format,
        includeHighPerformers,
        includePIPs,
        includeDisputes,
      };

      const blob = await performanceApi.generateOutcomeReport(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Determine filename
      const extension = format === 'csv' ? 'csv' : 'json';
      const filename = `outcome-report-${Date.now()}.${extension}`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(`Outcome report generated successfully as ${format.toUpperCase()}`);
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate outcome report';
      showError(errorMessage, { title: 'Report Generation Failed' });
      console.error('Error generating outcome report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generate Outcome Report" size="lg">
      <div className={styles.container}>
        <div className={styles.section}>
          <h3>Report Options</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="cycle">Appraisal Cycle (Optional)</label>
            <select
              id="cycle"
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className={styles.select}
            >
              <option value="">All Cycles</option>
              {cycles.map((cycle) => (
                <option key={cycle._id} value={cycle._id}>
                  {cycle.name} ({cycle.status})
                </option>
              ))}
            </select>
            <p className={styles.helpText}>
              Leave empty to include all cycles
            </p>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="format">Report Format</label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value as 'csv' | 'json')}
              className={styles.select}
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Include Sections</label>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includeHighPerformers}
                  onChange={(e) => setIncludeHighPerformers(e.target.checked)}
                />
                <span>High Performers</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includePIPs}
                  onChange={(e) => setIncludePIPs(e.target.checked)}
                />
                <span>Performance Improvement Plans (PIPs)</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={includeDisputes}
                  onChange={(e) => setIncludeDisputes(e.target.checked)}
                />
                <span>Disputes</span>
              </label>
            </div>
          </div>

          <div className={styles.infoBox}>
            <strong>Report Contents:</strong>
            <ul>
              <li>Performance outcomes (final ratings, scores, acknowledgments)</li>
              {includeHighPerformers && <li>High performers list</li>}
              {includePIPs && <li>Performance Improvement Plans</li>}
              {includeDisputes && <li>Disputes and resolutions</li>}
              <li>Summary statistics</li>
            </ul>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

