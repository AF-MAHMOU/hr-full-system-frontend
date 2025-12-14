/**
 * ExportButton Component
 * Button to export appraisal summaries (REQ-AE-11)
 */

'use client';

import { useState } from 'react';
import { Button } from '@/shared/components';
import { performanceApi, type ExportAppraisalSummaryParams } from '../api/performanceApi';
import { useNotification } from '@/shared/hooks';
import styles from './ExportButton.module.css';

interface ExportButtonProps {
  cycleId?: string;
  departmentId?: string;
  employeeId?: string;
  status?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ExportButton({
  cycleId,
  departmentId,
  employeeId,
  status,
  variant = 'outline',
  size = 'md',
  className = '',
}: ExportButtonProps) {
  const { showSuccess, showError } = useNotification('performance');
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'csv' | 'pdf' = 'csv') => {
    try {
      setLoading(true);

      const params: ExportAppraisalSummaryParams = {
        cycleId,
        departmentId,
        employeeId,
        format,
        status,
      };

      const blob = await performanceApi.exportAppraisalSummaries(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Determine filename from content-disposition header or use default
      const filename = format === 'csv' 
        ? `appraisal-summary-${Date.now()}.csv`
        : `appraisal-summary-${Date.now()}.json`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(`Appraisal summary exported successfully as ${format.toUpperCase()}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to export appraisal summary';
      showError(errorMessage, { title: 'Export Failed' });
      console.error('Error exporting appraisal summary:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.exportButtonContainer} ${className}`}>
      <Button
        variant={variant}
        size={size}
        onClick={() => handleExport('csv')}
        disabled={loading}
        className={styles.exportButton}
      >
        {loading ? 'Exporting...' : '📥 Export'}
      </Button>
    </div>
  );
}

