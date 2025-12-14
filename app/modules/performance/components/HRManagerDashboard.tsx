/**
 * HRManagerDashboard Component
 * Consolidated dashboard for HR Managers to track appraisal completion (REQ-AE-10)
 * Shows department-wise breakdown and overall statistics
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type { AppraisalCycle, CycleProgress, AppraisalAssignment } from '../types';
import { AppraisalAssignmentStatus } from '../types';
import styles from './HRManagerDashboard.module.css';

interface Department {
  _id: string;
  code: string;
  name: string;
  isActive: boolean;
}

interface DepartmentProgress {
  departmentId: string;
  departmentName: string;
  total: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  acknowledged: number;
  completionRate: number;
}

export default function HRManagerDashboard() {
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [overallProgress, setOverallProgress] = useState<CycleProgress | null>(null);
  const [departmentProgress, setDepartmentProgress] = useState<DepartmentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      // Backend limit max is 100, so we'll fetch with limit 100
      const response = await apiClient.get(
        `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments`,
        { params: { isActive: 'true', limit: '100', page: '1' } }
      );
      // Backend returns { success: true, data: [...], ... }
      const deptData = response.data?.data || [];
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (err: any) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    }
  }, []);

  // Fetch cycles
  const fetchCycles = useCallback(async () => {
    try {
      const data = await performanceApi.getCycles();
      setCycles(data);
      // Auto-select active cycle if available
      if (data.length > 0 && !selectedCycleId) {
        const activeCycle = data.find(c => c.status === 'ACTIVE') || data[0];
        if (activeCycle?._id) {
          setSelectedCycleId(activeCycle._id);
        }
      }
    } catch (err: any) {
      console.error('Error fetching cycles:', err);
      setCycles([]);
    }
  }, [selectedCycleId]);

  // Fetch overall progress for selected cycle
  const fetchOverallProgress = useCallback(async (cycleId: string) => {
    if (!cycleId) return;
    
    try {
      const data = await performanceApi.getCycleProgress(cycleId);
      setOverallProgress(data);
    } catch (err: any) {
      console.error('Error fetching overall progress:', err);
      setOverallProgress(null);
    }
  }, []);

  // Fetch department-wise progress
  const fetchDepartmentProgress = useCallback(async (cycleId: string) => {
    if (!cycleId) return;
    
    try {
      setLoading(true);
      const assignments = await performanceApi.getAssignments({ cycleId });
      
      // Group assignments by department
      const deptMap = new Map<string, DepartmentProgress>();
      
      assignments.forEach((assignment: AppraisalAssignment) => {
        const dept = (assignment as any).departmentId || assignment.departmentId;
        
        // Handle null/undefined department
        if (!dept) return;
        
        let deptId: string;
        let deptName: string;
        
        if (typeof dept === 'object' && dept !== null) {
          deptId = dept._id || dept.id || String(dept);
          deptName = dept.name || 'Unknown Department';
        } else {
          deptId = String(dept);
          deptName = 'Unknown Department';
        }
        
        if (!deptId || deptId === 'null' || deptId === 'undefined') return;
        
        if (!deptMap.has(deptId)) {
          const department = departments.find(d => d._id === deptId);
          deptMap.set(deptId, {
            departmentId: deptId,
            departmentName: department?.name || deptName,
            total: 0,
            notStarted: 0,
            inProgress: 0,
            submitted: 0,
            acknowledged: 0,
            completionRate: 0,
          });
        }
        
        const progress = deptMap.get(deptId)!;
        progress.total++;
        
        switch (assignment.status) {
          case AppraisalAssignmentStatus.NOT_STARTED:
            progress.notStarted++;
            break;
          case AppraisalAssignmentStatus.IN_PROGRESS:
            progress.inProgress++;
            break;
          case AppraisalAssignmentStatus.SUBMITTED:
            progress.submitted++;
            break;
          case AppraisalAssignmentStatus.ACKNOWLEDGED:
            progress.acknowledged++;
            break;
        }
      });
      
      // Calculate completion rates
      deptMap.forEach((progress) => {
        progress.completionRate = progress.total > 0
          ? (progress.acknowledged / progress.total) * 100
          : 0;
      });
      
      const deptProgressArray = Array.from(deptMap.values())
        .sort((a, b) => b.total - a.total); // Sort by total assignments
      
      setDepartmentProgress(deptProgressArray);
    } catch (err: any) {
      console.error('Error fetching department progress:', err);
      setDepartmentProgress([]);
    } finally {
      setLoading(false);
    }
  }, [departments]);

  useEffect(() => {
    fetchDepartments();
    fetchCycles();
  }, [fetchDepartments, fetchCycles]);

  useEffect(() => {
    if (selectedCycleId) {
      fetchOverallProgress(selectedCycleId);
      fetchDepartmentProgress(selectedCycleId);
    }
  }, [selectedCycleId, fetchOverallProgress, fetchDepartmentProgress]);

  const handleRefresh = () => {
    if (selectedCycleId) {
      fetchOverallProgress(selectedCycleId);
      fetchDepartmentProgress(selectedCycleId);
    }
    fetchCycles();
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const filteredDepartmentProgress = selectedDepartmentId
    ? departmentProgress.filter(d => d.departmentId === selectedDepartmentId)
    : departmentProgress;

  if (loading && !overallProgress) {
    return (
      <Card padding="lg" shadow="warm">
        <div className={styles.loading}>Loading dashboard...</div>
      </Card>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Consolidated Appraisal Dashboard</h2>
          <p>Track appraisal completion across departments and cycles</p>
        </div>
        <div className={styles.controls}>
          {cycles.length > 0 && (
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className={styles.select}
            >
              <option value="">Select a cycle...</option>
              {cycles.map((cycle) => (
                <option key={cycle._id} value={cycle._id}>
                  {cycle.name} ({cycle.status})
                </option>
              ))}
            </select>
          )}
          {departments.length > 0 && (
            <select
              value={selectedDepartmentId}
              onChange={(e) => setSelectedDepartmentId(e.target.value)}
              className={styles.select}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
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
            <p>Please select a cycle to view the consolidated dashboard</p>
          </div>
        </Card>
      ) : !overallProgress ? (
        <Card padding="lg" shadow="warm">
          <div className={styles.emptyState}>
            <p>No data available for this cycle</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Overall Summary Cards */}
          <div className={styles.summaryCards}>
            <Card padding="md" shadow="warm" className={styles.summaryCard}>
              <div className={styles.cardIcon} style={{ backgroundColor: '#2196f3' }}>
                📊
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardValue}>{overallProgress.total}</div>
                <div className={styles.cardLabel}>Total Assignments</div>
              </div>
            </Card>

            <Card padding="md" shadow="warm" className={styles.summaryCard}>
              <div className={styles.cardIcon} style={{ backgroundColor: '#4caf50' }}>
                ✓
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardValue}>{overallProgress.completed}</div>
                <div className={styles.cardLabel}>Completed</div>
              </div>
            </Card>

            <Card padding="md" shadow="warm" className={styles.summaryCard}>
              <div className={styles.cardIcon} style={{ backgroundColor: '#ff9800' }}>
                📈
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardValue}>{formatPercentage(overallProgress.completionRate)}</div>
                <div className={styles.cardLabel}>Overall Completion Rate</div>
              </div>
            </Card>

            <Card padding="md" shadow="warm" className={styles.summaryCard}>
              <div className={styles.cardIcon} style={{ backgroundColor: '#9c27b0' }}>
                🏢
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardValue}>{filteredDepartmentProgress.length}</div>
                <div className={styles.cardLabel}>Departments</div>
              </div>
            </Card>
          </div>

          {/* Overall Progress Bar */}
          <Card padding="lg" shadow="warm" className={styles.progressCard}>
            <h3>Overall Completion Progress</h3>
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${overallProgress.completionRate}%` }}
                />
              </div>
              <div className={styles.progressText}>
                {overallProgress.completed} of {overallProgress.total} completed ({formatPercentage(overallProgress.completionRate)})
              </div>
            </div>
          </Card>

          {/* Department Breakdown */}
          <Card padding="lg" shadow="warm" className={styles.departmentCard}>
            <h3>Department-Wise Breakdown</h3>
            {filteredDepartmentProgress.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No department data available</p>
              </div>
            ) : (
              <div className={styles.departmentTable}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Total</th>
                      <th>Not Started</th>
                      <th>In Progress</th>
                      <th>Submitted</th>
                      <th>Completed</th>
                      <th>Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartmentProgress.map((dept) => (
                      <tr key={dept.departmentId}>
                        <td className={styles.departmentName}>{dept.departmentName}</td>
                        <td>{dept.total}</td>
                        <td>{dept.notStarted}</td>
                        <td>{dept.inProgress}</td>
                        <td>{dept.submitted}</td>
                        <td className={styles.completedCell}>{dept.acknowledged}</td>
                        <td>
                          <div className={styles.rateContainer}>
                            <span className={styles.rateValue}>{formatPercentage(dept.completionRate)}</span>
                            <div className={styles.rateBar}>
                              <div
                                className={styles.rateBarFill}
                                style={{
                                  width: `${dept.completionRate}%`,
                                  backgroundColor: dept.completionRate >= 80 ? '#4caf50' : dept.completionRate >= 50 ? '#ff9800' : '#f44336',
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Status Distribution Chart */}
          <Card padding="lg" shadow="warm" className={styles.chartCard}>
            <h3>Status Distribution by Department</h3>
            <div className={styles.chartContainer}>
              {filteredDepartmentProgress.map((dept) => (
                <div key={dept.departmentId} className={styles.chartRow}>
                  <div className={styles.chartLabel}>{dept.departmentName}</div>
                  <div className={styles.chartBar}>
                    {dept.total > 0 ? (
                      <>
                        <div
                          className={styles.chartSegment}
                          style={{
                            width: `${(dept.notStarted / dept.total) * 100}%`,
                            backgroundColor: '#e0e0e0',
                          }}
                          title={`Not Started: ${dept.notStarted}`}
                        />
                        <div
                          className={styles.chartSegment}
                          style={{
                            width: `${(dept.inProgress / dept.total) * 100}%`,
                            backgroundColor: '#ff9800',
                          }}
                          title={`In Progress: ${dept.inProgress}`}
                        />
                        <div
                          className={styles.chartSegment}
                          style={{
                            width: `${(dept.submitted / dept.total) * 100}%`,
                            backgroundColor: '#2196f3',
                          }}
                          title={`Submitted: ${dept.submitted}`}
                        />
                        <div
                          className={styles.chartSegment}
                          style={{
                            width: `${(dept.acknowledged / dept.total) * 100}%`,
                            backgroundColor: '#4caf50',
                          }}
                          title={`Completed: ${dept.acknowledged}`}
                        />
                      </>
                    ) : (
                      <div className={styles.noDataBar}>No assignments</div>
                    )}
                  </div>
                  <div className={styles.chartValue}>{dept.total}</div>
                </div>
              ))}
            </div>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#4caf50' }} />
                <span>Completed</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#2196f3' }} />
                <span>Submitted</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#ff9800' }} />
                <span>In Progress</span>
              </div>
              <div className={styles.legendItem}>
                <div className={styles.legendColor} style={{ backgroundColor: '#e0e0e0' }} />
                <span>Not Started</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

