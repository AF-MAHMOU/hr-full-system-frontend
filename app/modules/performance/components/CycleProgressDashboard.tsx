/**
 * CycleProgressDashboard Component
 * Displays appraisal progress for HR employees (REQ-AE-06)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { AppraisalCycle, CycleProgress } from '../types';
import styles from './CycleProgressDashboard.module.css';

interface CycleProgressDashboardProps {
  cycles?: AppraisalCycle[];
  onRefresh?: () => void;
}

export default function CycleProgressDashboard({ cycles, onRefresh }: CycleProgressDashboardProps) {
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [progress, setProgress] = useState<CycleProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cyclesList, setCyclesList] = useState<AppraisalCycle[]>([]);

  // Fetch cycles if not provided
  const fetchCycles = useCallback(async () => {
    try {
      const data = await performanceApi.getCycles();
      setCyclesList(data);
      // Auto-select first active cycle if available
      if (data.length > 0 && !selectedCycleId) {
        const activeCycle = data.find(c => c.status === 'ACTIVE') || data[0];
        if (activeCycle?._id) {
          setSelectedCycleId(activeCycle._id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching cycles:', err);
    }
  }, [selectedCycleId]);

  // Fetch progress for selected cycle
  const fetchProgress = useCallback(async (cycleId: string) => {
    if (!cycleId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await performanceApi.getCycleProgress(cycleId);
      setProgress(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load progress data');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cycles || cycles.length === 0) {
      fetchCycles();
    } else {
      setCyclesList(cycles);
      if (cycles.length > 0 && !selectedCycleId) {
        const activeCycle = cycles.find(c => c.status === 'ACTIVE') || cycles[0];
        if (activeCycle?._id) {
          setSelectedCycleId(activeCycle._id);
        }
      }
    }
  }, [cycles, fetchCycles, selectedCycleId]);

  useEffect(() => {
    if (selectedCycleId) {
      fetchProgress(selectedCycleId);
    }
  }, [selectedCycleId, fetchProgress]);

  const handleRefresh = () => {
    if (selectedCycleId) {
      fetchProgress(selectedCycleId);
    }
    if (onRefresh) {
      onRefresh();
    }
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'notStarted':
        return '#e0e0e0';
      case 'inProgress':
        return '#ff9800';
      case 'submitted':
        return '#2196f3';
      case 'acknowledged':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'notStarted':
        return 'Not Started';
      case 'inProgress':
        return 'In Progress';
      case 'submitted':
        return 'Submitted';
      case 'acknowledged':
        return 'Acknowledged';
      default:
        return status;
    }
  };

  if (loading && !progress) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading progress data...</div>
      </Card>
    );
  }

  if (error && !progress) {
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
          <h2>Appraisal Progress Dashboard</h2>
          <p>Monitor appraisal completion status across cycles</p>
        </div>
        <div className={styles.controls}>
          {cyclesList.length > 0 && (
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className={styles.select}
            >
              <option value="">Select a cycle...</option>
              {cyclesList.map((cycle) => (
                <option key={cycle._id} value={cycle._id}>
                  {cycle.name} ({cycle.status})
                </option>
              ))}
            </select>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || !selectedCycleId}
          >
            Refresh
          </Button>
        </div>
      </div>

      {!selectedCycleId ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>Please select a cycle to view progress</p>
          </div>
        </Card>
      ) : !progress ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No progress data available for this cycle</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className={styles.summaryCards}>
            <Card padding="md" shadow="warm" className={styles.summaryCard}>
              <div className={styles.cardIcon} style={{ backgroundColor: '#2196f3' }}>
                📊
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardValue}>{progress.total}</div>
                <div className={styles.cardLabel}>Total Assignments</div>
              </div>
            </Card>

            <Card padding="md" shadow="warm" className={styles.summaryCard}>
              <div className={styles.cardIcon} style={{ backgroundColor: '#4caf50' }}>
                ✓
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardValue}>{progress.completed}</div>
                <div className={styles.cardLabel}>Completed</div>
              </div>
            </Card>

            <Card padding="md" shadow="warm" className={styles.summaryCard}>
              <div className={styles.cardIcon} style={{ backgroundColor: '#ff9800' }}>
                📈
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardValue}>{formatPercentage(progress.completionRate)}</div>
                <div className={styles.cardLabel}>Completion Rate</div>
              </div>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card padding="lg" shadow="warm" className={styles.progressCard}>
            <h3>Overall Completion</h3>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progress.completionRate}%` }}
                />
              </div>
              <div className={styles.progressText}>
                {progress.completed} of {progress.total} completed ({formatPercentage(progress.completionRate)})
              </div>
            </div>
          </Card>

          {/* Status Breakdown */}
          <Card padding="lg" shadow="warm" className={styles.statusCard}>
            <h3>Status Breakdown</h3>
            <div className={styles.statusGrid}>
              {[
                { key: 'notStarted', value: progress.notStarted },
                { key: 'inProgress', value: progress.inProgress },
                { key: 'submitted', value: progress.submitted },
                { key: 'acknowledged', value: progress.acknowledged },
              ].map(({ key, value }) => (
                <div key={key} className={styles.statusItem}>
                  <div className={styles.statusHeader}>
                    <div
                      className={styles.statusIndicator}
                      style={{ backgroundColor: getStatusColor(key) }}
                    />
                    <span className={styles.statusLabel}>{getStatusLabel(key)}</span>
                  </div>
                  <div className={styles.statusValue}>{value}</div>
                  <div className={styles.statusPercentage}>
                    {progress.total > 0
                      ? formatPercentage((value / progress.total) * 100)
                      : '0%'}
                  </div>
                  <div className={styles.statusBar}>
                    <div
                      className={styles.statusBarFill}
                      style={{
                        width: progress.total > 0 ? `${(value / progress.total) * 100}%` : '0%',
                        backgroundColor: getStatusColor(key),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Visual Chart */}
          <Card padding="lg" shadow="warm" className={styles.chartCard}>
            <h3>Progress Visualization</h3>
            <div className={styles.chartContainer}>
              {progress.total > 0 ? (
                <div className={styles.chart}>
                  {[
                    { key: 'acknowledged', value: progress.acknowledged, color: '#4caf50' },
                    { key: 'submitted', value: progress.submitted, color: '#2196f3' },
                    { key: 'inProgress', value: progress.inProgress, color: '#ff9800' },
                    { key: 'notStarted', value: progress.notStarted, color: '#e0e0e0' },
                  ].map(({ key, value, color }) => {
                    const percentage = (value / progress.total) * 100;
                    return (
                      <div
                        key={key}
                        className={styles.chartSegment}
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                        title={`${getStatusLabel(key)}: ${value} (${formatPercentage(percentage)})`}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className={styles.noData}>No assignments in this cycle</div>
              )}
            </div>
            <div className={styles.chartLegend}>
              {[
                { key: 'acknowledged', color: '#4caf50', label: 'Acknowledged' },
                { key: 'submitted', color: '#2196f3', label: 'Submitted' },
                { key: 'inProgress', color: '#ff9800', label: 'In Progress' },
                { key: 'notStarted', color: '#e0e0e0', label: 'Not Started' },
              ].map(({ key, color, label }) => (
                <div key={key} className={styles.legendItem}>
                  <div
                    className={styles.legendColor}
                    style={{ backgroundColor: color }}
                  />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

