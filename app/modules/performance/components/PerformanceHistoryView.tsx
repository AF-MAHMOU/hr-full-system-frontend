/**
 * PerformanceHistoryView Component
 * REQ-OD-08: Employee / Line Manager access past appraisal history and multi-cycle trend views
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { useNotification } from '@/shared/hooks';
import type { AppraisalRecord } from '../types';
import FinalRatingView from './FinalRatingView';
import styles from './PerformanceHistoryView.module.css';

interface PerformanceHistoryViewProps {
  employeeId: string;
  employeeName?: string; // Optional: for display purposes
}

export default function PerformanceHistoryView({
  employeeId,
  employeeName,
}: PerformanceHistoryViewProps) {
  const { showError } = useNotification();
  const [history, setHistory] = useState<AppraisalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppraisal, setSelectedAppraisal] = useState<AppraisalRecord | null>(null);
  const [isRatingViewOpen, setIsRatingViewOpen] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceApi.getEmployeePerformanceHistory(employeeId);
      setHistory(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load performance history';
      setError(errorMessage);
      showError(errorMessage, { title: 'Error Loading History' });
      console.error('Error fetching performance history:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId, showError]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadgeClass = (status?: string) => {
    if (!status) return styles.statusDefault;
    switch (status) {
      case 'HR_PUBLISHED':
        return styles.statusPublished;
      case 'MANAGER_SUBMITTED':
        return styles.statusSubmitted;
      case 'DRAFT':
        return styles.statusDraft;
      case 'ARCHIVED':
        return styles.statusArchived;
      default:
        return styles.statusDefault;
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleViewDetails = (appraisal: AppraisalRecord) => {
    setSelectedAppraisal(appraisal);
    setIsRatingViewOpen(true);
  };

  // Calculate trend data
  const calculateTrends = () => {
    if (history.length < 2) return null;

    const sortedHistory = [...history].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateA - dateB; // Oldest first for trend calculation
    });

    const scores = sortedHistory
      .map(a => a.totalScore)
      .filter(score => score !== undefined && score !== null) as number[];

    if (scores.length < 2) return null;

    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const trend = lastScore > firstScore ? 'improving' : lastScore < firstScore ? 'declining' : 'stable';
    const change = lastScore - firstScore;

    return {
      firstScore,
      lastScore,
      averageScore: averageScore.toFixed(2),
      trend,
      change: parseFloat(change.toFixed(2)),
      totalCycles: scores.length,
    };
  };

  const trends = calculateTrends();

  if (loading) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading performance history...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Performance History</h2>
          {employeeName && (
            <p>Past appraisal history for {employeeName}</p>
          )}
          {!employeeName && (
            <p>View your past appraisal history and performance trends</p>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No performance history found.</p>
            <p className={styles.note}>
              Performance history will appear here once appraisals are completed and published.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Trend Summary */}
          {trends && (
            <Card padding="md" shadow="warm" className={styles.trendCard}>
              <h3 className={styles.trendTitle}>Performance Trends</h3>
              <div className={styles.trendGrid}>
                <div className={styles.trendItem}>
                  <span className={styles.trendLabel}>Total Cycles</span>
                  <span className={styles.trendValue}>{trends.totalCycles}</span>
                </div>
                <div className={styles.trendItem}>
                  <span className={styles.trendLabel}>Average Score</span>
                  <span className={styles.trendValue}>{trends.averageScore}</span>
                </div>
                <div className={styles.trendItem}>
                  <span className={styles.trendLabel}>First Score</span>
                  <span className={styles.trendValue}>{trends.firstScore}</span>
                </div>
                <div className={styles.trendItem}>
                  <span className={styles.trendLabel}>Latest Score</span>
                  <span className={styles.trendValue}>{trends.lastScore}</span>
                </div>
                <div className={styles.trendItem}>
                  <span className={styles.trendLabel}>Change</span>
                  <span className={`${styles.trendValue} ${styles[`trend${trends.trend.charAt(0).toUpperCase() + trends.trend.slice(1)}`]}`}>
                    {trends.change > 0 ? '+' : ''}{trends.change}
                  </span>
                </div>
                <div className={styles.trendItem}>
                  <span className={styles.trendLabel}>Trend</span>
                  <span className={`${styles.trendBadge} ${styles[`trend${trends.trend.charAt(0).toUpperCase() + trends.trend.slice(1)}`]}`}>
                    {trends.trend}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* History List */}
          <div className={styles.historyList}>
            {history.map((appraisal) => {
              const cycle = (appraisal as any).cycleId || {};
              const template = (appraisal as any).templateId || {};
              const manager = (appraisal as any).managerProfileId || {};
              const employee = (appraisal as any).employeeProfileId || {};

              return (
                <Card key={appraisal._id?.toString()} padding="md" shadow="warm" className={styles.historyCard}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3>
                        {cycle.name || 'Appraisal'} - {template.name || 'Template'}
                      </h3>
                      <p className={styles.cardSubtitle}>
                        {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                      </p>
                    </div>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(appraisal.status)}`}>
                      {formatStatus(appraisal.status)}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.infoGrid}>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Total Score:</span>
                        <span className={styles.infoValue}>{appraisal.totalScore || 'N/A'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Overall Rating:</span>
                        <span className={styles.infoValue}>{appraisal.overallRatingLabel || 'N/A'}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Manager:</span>
                        <span className={styles.infoValue}>
                          {manager.firstName && manager.lastName
                            ? `${manager.firstName} ${manager.lastName}`
                            : 'N/A'}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Published:</span>
                        <span className={styles.infoValue}>
                          {appraisal.hrPublishedAt ? formatDate(appraisal.hrPublishedAt) : 'N/A'}
                        </span>
                      </div>
                      <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Acknowledged:</span>
                        <span className={styles.infoValue}>
                          {appraisal.employeeAcknowledgedAt ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {appraisal.employeeAcknowledgedAt && (
                        <div className={styles.infoItem}>
                          <span className={styles.infoLabel}>Acknowledged Date:</span>
                          <span className={styles.infoValue}>
                            {formatDate(appraisal.employeeAcknowledgedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewDetails(appraisal)}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {isRatingViewOpen && selectedAppraisal && (
        <FinalRatingView
          assignment={null}
          evaluationId={selectedAppraisal._id}
          isOpen={isRatingViewOpen}
          onClose={() => {
            setIsRatingViewOpen(false);
            setSelectedAppraisal(null);
          }}
        />
      )}
    </div>
  );
}

