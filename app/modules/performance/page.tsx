/**
 * Performance Module
 * This module handles performance appraisal management
 * REQ-PP-01: Configure Standardized Appraisal Templates and Rating Scales (System Admin)
 * Employee Performance View (for employees)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { SystemRole } from '@/shared/types/auth';
import { Card, ProtectedRoute } from '@/shared/components';
import { performanceApi } from './api/performanceApi';
import type { AppraisalTemplate, AppraisalCycle } from './types';
import { checkIsDepartmentHead } from '../organization-structure/api/orgStructureApi';
import TemplateList from './components/TemplateList';
import AssignmentList from './components/AssignmentList';
import CycleList from './components/CycleList';
import EmployeeAssignmentsView from './components/EmployeeAssignmentsView';
import PerformanceHistoryView from './components/PerformanceHistoryView';
import ManagerReviewsView from './components/ManagerReviewsView';
import CycleProgressDashboard from './components/CycleProgressDashboard';
import DisputeList from './components/DisputeList';
import HRManagerDashboard from './components/HRManagerDashboard';
import PIPListView from './components/PIPListView';
import VisibilityRulesView from './components/VisibilityRulesView';
import OneOnOneMeetingsView from './components/OneOnOneMeetingsView';
import EmployeeMeetingsView from './components/EmployeeMeetingsView';
import GoalsView from './components/GoalsView';
import EmployeeGoalsView from './components/EmployeeGoalsView';
import styles from './page.module.css';

function PerformanceContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDepartmentHeadByPosition, setIsDepartmentHeadByPosition] = useState(false);
  const [hasTeamReviews, setHasTeamReviews] = useState(false);
  
  // Check user roles first to determine default tab
  const isSystemAdmin = user?.roles?.includes(SystemRole.SYSTEM_ADMIN);
  const isHrAdmin = user?.roles?.includes(SystemRole.HR_ADMIN);
  const isHrManager = user?.roles?.includes(SystemRole.HR_MANAGER);
  const isHrEmployee = user?.roles?.includes(SystemRole.HR_EMPLOYEE);
  const isDepartmentEmployee = user?.roles?.includes(SystemRole.DEPARTMENT_EMPLOYEE);
  
  // Department Head can be:
  // 1. Has SystemRole.DEPARTMENT_HEAD role, OR
  // 2. Has primaryPositionId that matches a department's headPositionId (position-based)
  const isDepartmentHead = 
    user?.roles?.includes(SystemRole.DEPARTMENT_HEAD) || 
    isDepartmentHeadByPosition;
  
  // REQ-PP-01: HR Manager configures templates (HR_MANAGER ONLY)
  const canManageTemplates = isHrManager;
  // REQ-PP-02: HR Manager creates cycles (HR_MANAGER ONLY)
  const canManageCycles = isHrManager;
  // REQ-PP-05: HR Employee assigns appraisal forms/templates (HR_EMPLOYEE ONLY)
  const canManageAssignments = isHrEmployee;
  // REQ-AE-10: HR Manager tracks appraisal completion via consolidated dashboard (HR_MANAGER ONLY)
  const canViewConsolidatedDashboard = isHrManager;
  // REQ-AE-06: HR Employee monitors appraisal progress
  // REQ-AE-10: HR Manager gets cycle progress
  // Both HR Employee and HR Manager can view cycle progress
  const canViewCycleProgress = isHrEmployee || isHrManager;
  // Disputes: Anyone can view, but only DEPARTMENT_EMPLOYEE and HR_EMPLOYEE can create, HR_MANAGER can resolve
  // REQ-AE-07: Employee or HR Employee creates disputes
  // REQ-OD-07: HR Manager resolves disputes (NOT creates)
  const canViewDisputes = true; // Anyone can view disputes
  // HR Manager should NOT create disputes even if they have DEPARTMENT_EMPLOYEE role
  const canCreateDispute = (isDepartmentEmployee || isHrEmployee) && !isHrManager;
  const canResolveDispute = isHrManager;
  // REQ-OD-16: System Admin configures visibility rules (SYSTEM_ADMIN ONLY)
  const canManageVisibilityRules = isSystemAdmin;
  const isEmployee = user?.userType === 'employee';
  
  // Set default tab based on role
  const getDefaultTab = (): 'templates' | 'cycles' | 'assignments' | 'dashboard' | 'consolidated' | 'disputes' | 'my-performance' | 'team-reviews' | 'improvement-plans' | 'history' | 'visibility-rules' | 'meetings' | 'goals' => {
    if (isSystemAdmin) {
      return 'visibility-rules'; // SYSTEM_ADMIN defaults to Visibility Rules (REQ-OD-16)
    }
    if (isHrEmployee) {
      return 'assignments'; // HR Employee defaults to Assignments (REQ-PP-05)
    }
    if (isHrManager) {
      return 'consolidated'; // HR Manager defaults to Consolidated Dashboard (REQ-AE-10)
    }
    if (isDepartmentHead) {
      return 'team-reviews'; // Department Head defaults to Team Reviews
    }
    if (isEmployee) {
      return 'my-performance'; // Employee defaults to My Performance
    }
    return 'templates';
  };
  
  const [activeTab, setActiveTab] = useState<'templates' | 'cycles' | 'assignments' | 'dashboard' | 'consolidated' | 'disputes' | 'my-performance' | 'team-reviews' | 'improvement-plans' | 'history' | 'visibility-rules' | 'meetings' | 'goals'>(getDefaultTab());
  
  // HR_ADMIN should not have access to performance module - redirect to home
  useEffect(() => {
    if (isHrAdmin && !isSystemAdmin && !isHrManager && !isHrEmployee) {
      router.push('/');
    }
  }, [isHrAdmin, isSystemAdmin, isHrManager, isHrEmployee, router]);
  
  // Set default tab when hasTeamReviews changes
  useEffect(() => {
    if (hasTeamReviews && isEmployee && !canManageTemplates && activeTab === 'templates') {
      setActiveTab('team-reviews');
    }
  }, [hasTeamReviews, isEmployee, canManageTemplates, activeTab]);

  const fetchTemplates = async () => {
    if (!canManageTemplates) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await performanceApi.getTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycles = async () => {
    if (!canManageTemplates) return;
    
    try {
      setError(null);
      const data = await performanceApi.getCycles();
      setCycles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cycles');
      console.error('Error fetching cycles:', err);
    }
  };

  // Check if user is a department head based on position
  useEffect(() => {
    const checkPositionBasedDepartmentHead = async () => {
      if (!user?.userid) return;
      
      try {
        const result = await checkIsDepartmentHead(user.userid);
        setIsDepartmentHeadByPosition(result.isDepartmentHead);
      } catch (err) {
        console.error('Error checking department head status:', err);
        setIsDepartmentHeadByPosition(false);
      }
    };
    
    checkPositionBasedDepartmentHead();
  }, [user?.userid]);

  // Check if user has team reviews (is a Line Manager/DEPARTMENT_HEAD or has assignments)
  useEffect(() => {
    const checkTeamReviews = async () => {
      console.log('Checking team reviews...', {
        userid: user?.userid,
        isDepartmentHead,
        isHrManager,
        isHrAdmin,
        isSystemAdmin,
        isHrEmployee,
      });
      
      // SYSTEM_ADMIN doesn't need team reviews check - they only see Visibility Rules
      if (isSystemAdmin) {
        console.log('System Admin - skipping team reviews check');
        setHasTeamReviews(false);
        return;
      }
      
      // HR Employee doesn't need team reviews - they manage assignments, not reviews
      if (isHrEmployee) {
        console.log('HR Employee - skipping team reviews check');
        setHasTeamReviews(false);
        return;
      }
      
      // Line Manager (DEPARTMENT_HEAD) should always see Team Reviews tab
      if (isDepartmentHead) {
        console.log('User has authorized role, setting hasTeamReviews to true');
        setHasTeamReviews(true);
        return;
      }
      
      // For other employees, check if they have any assignments as manager
      if (user?.userid) {
        try {
          console.log('Fetching manager assignments for user:', user.userid);
          const assignments = await performanceApi.getManagerAssignments(user.userid);
          console.log('Manager assignments response:', assignments);
          const hasAssignments = assignments && assignments.length > 0;
          console.log('Setting hasTeamReviews to:', hasAssignments);
          setHasTeamReviews(hasAssignments);
        } catch (err: any) {
          console.error('Error checking manager assignments:', err);
          console.error('Error details:', err.response?.data || err.message);
          // Silently fail - user might not be a manager
          setHasTeamReviews(false);
        }
      } else {
        console.log('No userid, setting hasTeamReviews to false');
        setHasTeamReviews(false);
      }
    };
    
    // SYSTEM_ADMIN doesn't need templates/cycles - they only see Visibility Rules
    if (isSystemAdmin) {
      setLoading(false);
    } else if (canManageTemplates || canManageCycles) {
      fetchTemplates();
      fetchCycles();
    } else if (canManageAssignments || canViewConsolidatedDashboard || canViewCycleProgress) {
      // HR Employee/Manager can view dashboards or assignments, fetch cycles
      fetchCycles();
    } else {
      setLoading(false);
    }
    
    checkTeamReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageTemplates, canManageCycles, canManageAssignments, canViewConsolidatedDashboard, canViewCycleProgress, user?.userid, isDepartmentHead, isHrManager, isHrEmployee]);

  // SYSTEM_ADMIN should only see Visibility Rules (and optionally My Performance/History)
  if (isSystemAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Performance Management</h1>
            <p>Configure visibility rules for performance feedback entries</p>
          </div>
        </div>

        <div className={styles.tabs}>
          {/* REQ-OD-16: System Admin configures visibility rules (SYSTEM_ADMIN ONLY) */}
          <button
            className={`${styles.tab} ${activeTab === 'visibility-rules' ? styles.active : ''}`}
            onClick={() => setActiveTab('visibility-rules')}
          >
            Visibility Rules
          </button>
          {/* SYSTEM_ADMIN can also view their own performance as an employee */}
          <button
            className={`${styles.tab} ${activeTab === 'my-performance' ? styles.active : ''}`}
            onClick={() => setActiveTab('my-performance')}
          >
            My Performance
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* REQ-OD-16: System Admin configures visibility rules */}
        {activeTab === 'visibility-rules' && (
          <VisibilityRulesView />
        )}

        {activeTab === 'my-performance' && (
          <>
            {user?.userid ? (
              <EmployeeAssignmentsView employeeId={user.userid} />
            ) : (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  Unable to load employee ID. Please refresh the page or contact support.
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {user?.userid ? (
              <PerformanceHistoryView employeeId={user.userid} />
            ) : (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  Unable to load employee ID. Please refresh the page or contact support.
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    );
  }

  // Early return if HR_ADMIN (without other HR roles) tries to access
  if (isHrAdmin && !isSystemAdmin && !isHrManager && !isHrEmployee) {
    return null; // Will redirect via useEffect
  }

  // For employees without admin access (but not HR employees), show tabs if they have team reviews
  // HR employees should see the dashboard view, not the regular employee view
  if (isEmployee && !canManageTemplates && !isHrEmployee) {
    console.log('Rendering employee view, hasTeamReviews:', hasTeamReviews);
    console.log('User roles:', user?.roles, 'isHrEmployee:', isHrEmployee);
    
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Performance Management</h1>
            <p>{hasTeamReviews ? 'Review your team and view your performance' : 'View your performance appraisals and feedback'}</p>
          </div>
        </div>

        {hasTeamReviews && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'team-reviews' ? styles.active : ''}`}
              onClick={() => {
                console.log('Switching to team-reviews tab');
                setActiveTab('team-reviews');
              }}
            >
              Team Reviews
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'my-performance' ? styles.active : ''}`}
              onClick={() => {
                console.log('Switching to my-performance tab');
                setActiveTab('my-performance');
              }}
            >
              My Performance
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
              onClick={() => {
                console.log('Switching to history tab');
                setActiveTab('history');
              }}
            >
              History
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'meetings' ? styles.active : ''}`}
              onClick={() => {
                console.log('Switching to meetings tab');
                setActiveTab('meetings');
              }}
            >
              1-on-1 Meetings
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'goals' ? styles.active : ''}`}
              onClick={() => {
                console.log('Switching to goals tab');
                setActiveTab('goals');
              }}
            >
              Goals
            </button>
          </div>
        )}

        {activeTab === 'team-reviews' && hasTeamReviews && (
          <>
            {user?.userid && (
              <ManagerReviewsView managerId={user.userid} />
            )}
          </>
        )}

        {activeTab === 'my-performance' && (
          <>
            {user?.userid ? (
              <EmployeeAssignmentsView employeeId={user.userid} />
            ) : (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  Unable to load employee ID. Please refresh the page or contact support.
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {user?.userid ? (
              <PerformanceHistoryView employeeId={user.userid} />
            ) : (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  Unable to load employee ID. Please refresh the page or contact support.
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === 'meetings' && (
          <>
            {user?.userid ? (
              <EmployeeMeetingsView employeeId={user.userid} />
            ) : (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  Unable to load employee ID. Please refresh the page or contact support.
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === 'goals' && isDepartmentHead && (
          <>
            {user?.userid ? (
              <GoalsView managerId={user.userid} />
            ) : (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  Unable to load manager ID. Please refresh the page or contact support.
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === 'goals' && !isDepartmentHead && isDepartmentEmployee && (
          <>
            {user?.userid ? (
              <EmployeeGoalsView employeeId={user.userid} />
            ) : (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  Unable to load employee ID. Please refresh the page or contact support.
                </div>
              </Card>
            )}
          </>
        )}

        {!hasTeamReviews && (
          <>
            {user?.userid ? (
              <EmployeeAssignmentsView employeeId={user.userid} />
            ) : (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  Unable to load employee ID. Please refresh the page or contact support.
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    );
  }

  // For admins/managers/HR employees, show tabs
  // REQ-PP-01: HR Manager configures templates
  // REQ-PP-02: HR Manager creates cycles
  // REQ-PP-05: HR Employee assigns templates
  // REQ-AE-10: HR Manager sees consolidated dashboard
  if (canManageTemplates || canManageCycles || canManageAssignments || canViewConsolidatedDashboard || canViewCycleProgress || canViewDisputes || canManageVisibilityRules) {
    console.log('Rendering HR/Admin view:', { isHrEmployee, isHrManager, canManageTemplates, canManageAssignments, userRoles: user?.roles });
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1>Performance Management</h1>
            <p>Manage appraisal templates and view your performance</p>
          </div>
        </div>

        <div className={styles.tabs}>
          {/* REQ-PP-01: HR Manager configures templates (HR_MANAGER ONLY) */}
          {canManageTemplates && (
            <button
              className={`${styles.tab} ${activeTab === 'templates' ? styles.active : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              Template Configuration
            </button>
          )}
          {/* REQ-PP-02: HR Manager creates cycles (HR_MANAGER ONLY) */}
          {canManageCycles && (
            <button
              className={`${styles.tab} ${activeTab === 'cycles' ? styles.active : ''}`}
              onClick={() => setActiveTab('cycles')}
            >
              Cycles
            </button>
          )}
          {/* REQ-PP-05: HR Employee assigns appraisal forms/templates (HR_EMPLOYEE ONLY) */}
          {canManageAssignments && (
            <button
              className={`${styles.tab} ${activeTab === 'assignments' ? styles.active : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              Assignments
            </button>
          )}
          {/* REQ-AE-10: HR Manager consolidated dashboard (HR_MANAGER ONLY) */}
          {canViewConsolidatedDashboard && (
            <button
              className={`${styles.tab} ${activeTab === 'consolidated' ? styles.active : ''}`}
              onClick={() => setActiveTab('consolidated')}
            >
              Consolidated Dashboard
            </button>
          )}
          {/* REQ-AE-10: HR Manager cycle progress (HR_MANAGER ONLY) */}
          {canViewCycleProgress && (
            <button
              className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Cycle Progress
            </button>
          )}
          {/* Disputes: Anyone can view */}
          {canViewDisputes && (
            <button
              className={`${styles.tab} ${activeTab === 'disputes' ? styles.active : ''}`}
              onClick={() => setActiveTab('disputes')}
            >
              Disputes
            </button>
          )}
          {/* REQ-PP-13, REQ-AE-03: Line Manager views assigned forms and completes ratings (DEPARTMENT_HEAD ONLY) */}
          {hasTeamReviews && (
            <button
              className={`${styles.tab} ${activeTab === 'team-reviews' ? styles.active : ''}`}
              onClick={() => setActiveTab('team-reviews')}
            >
              Team Reviews
            </button>
          )}
          {/* REQ-OD-05: Line Manager initiates Performance Improvement Plans (DEPARTMENT_HEAD create/manage, HR_MANAGER view all) */}
          {(isDepartmentHead || isHrManager) && (
            <button
              className={`${styles.tab} ${activeTab === 'improvement-plans' ? styles.active : ''}`}
              onClick={() => setActiveTab('improvement-plans')}
            >
              Improvement Plans
            </button>
          )}
          {/* REQ-OD-14: Line Manager schedules 1-on-1 meetings (DEPARTMENT_HEAD ONLY) */}
          {isDepartmentHead && (
            <button
              className={`${styles.tab} ${activeTab === 'meetings' ? styles.active : ''}`}
              onClick={() => setActiveTab('meetings')}
            >
              1-on-1 Meetings
            </button>
          )}
          {/* REQ-PP-12: Line Manager sets and reviews employee objectives (DEPARTMENT_HEAD create/manage) */}
          {/* REQ-PP-12: Employee views goals set by line manager (DEPARTMENT_EMPLOYEE view) */}
          {(isDepartmentHead || isDepartmentEmployee) && (
            <button
              className={`${styles.tab} ${activeTab === 'goals' ? styles.active : ''}`}
              onClick={() => setActiveTab('goals')}
            >
              Goals
            </button>
          )}
          {/* REQ-OD-16: System Admin configures visibility rules (SYSTEM_ADMIN ONLY) */}
          {canManageVisibilityRules && (
            <button
              className={`${styles.tab} ${activeTab === 'visibility-rules' ? styles.active : ''}`}
              onClick={() => setActiveTab('visibility-rules')}
            >
              Visibility Rules
            </button>
          )}
          {/* All employees can view their own performance */}
          <button
            className={`${styles.tab} ${activeTab === 'my-performance' ? styles.active : ''}`}
            onClick={() => setActiveTab('my-performance')}
          >
            My Performance
          </button>
          {/* All employees can view their history */}
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          {/* DEPARTMENT_EMPLOYEE (not head) can view their own 1-on-1 meetings */}
          {isDepartmentEmployee && !isDepartmentHead && (
            <button
              className={`${styles.tab} ${activeTab === 'meetings' ? styles.active : ''}`}
              onClick={() => setActiveTab('meetings')}
            >
              1-on-1 Meetings
            </button>
          )}
        </div>

        {activeTab === 'templates' && canManageTemplates && (
          <>
            {loading ? (
              <Card padding="lg" shadow="warm">
                <div className={styles.loading}>Loading templates...</div>
              </Card>
            ) : error && templates.length === 0 ? (
              <Card padding="lg" shadow="warm">
                <div className={styles.errorMessage} role="alert">
                  {error}
                </div>
              </Card>
            ) : (
              <TemplateList templates={templates} onRefresh={fetchTemplates} />
            )}
          </>
        )}

        {activeTab === 'cycles' && canManageCycles && (
          <CycleList cycles={cycles} onRefresh={fetchCycles} />
        )}

        {/* REQ-PP-05: HR Employee assigns appraisal forms/templates */}
        {activeTab === 'assignments' && canManageAssignments && (
          <AssignmentList />
        )}

        {/* REQ-AE-10: HR Manager cycle progress */}
        {activeTab === 'dashboard' && canViewCycleProgress && (
          <CycleProgressDashboard cycles={cycles} onRefresh={fetchCycles} />
        )}

        {/* REQ-AE-10: HR Manager consolidated dashboard */}
        {activeTab === 'consolidated' && canViewConsolidatedDashboard && (
          <HRManagerDashboard />
        )}

        {/* REQ-AE-07: HR Employee can view disputes */}
        {activeTab === 'disputes' && canViewDisputes && (
          <DisputeList />
        )}

        {/* REQ-PP-13, REQ-AE-03: Line Manager views assigned forms and completes ratings */}
        {activeTab === 'team-reviews' && hasTeamReviews && (
          <>
            {user?.userid && (
              <ManagerReviewsView managerId={user.userid} />
            )}
          </>
        )}

        {/* REQ-OD-05: Line Manager initiates Performance Improvement Plans (DEPARTMENT_HEAD create/manage, HR_MANAGER view all) */}
        {activeTab === 'improvement-plans' && (isDepartmentHead || isHrManager) && (
          <>
            {user?.userid && (
              <PIPListView 
                managerId={user.userid} 
                showAllPIPs={isHrManager}
              />
            )}
          </>
        )}

        {activeTab === 'my-performance' && (
          <>
            {user?.userid && (
              <EmployeeAssignmentsView employeeId={user.userid} />
            )}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {user?.userid && (
              <PerformanceHistoryView employeeId={user.userid} />
            )}
          </>
        )}

        {/* REQ-OD-16: System Admin configures visibility rules */}
        {activeTab === 'visibility-rules' && isSystemAdmin && (
          <VisibilityRulesView />
        )}

        {/* REQ-OD-14: Line Manager schedules 1-on-1 meetings (DEPARTMENT_HEAD create/manage) */}
        {activeTab === 'meetings' && isDepartmentHead && (
          <OneOnOneMeetingsView />
        )}

        {/* DEPARTMENT_EMPLOYEE (not head) can view their own 1-on-1 meetings */}
        {activeTab === 'meetings' && isDepartmentEmployee && !isDepartmentHead && (
          <>
            {user?.userid && (
              <EmployeeMeetingsView employeeId={user.userid} />
            )}
          </>
        )}

        {/* REQ-PP-12: Line Manager sets and reviews employee objectives (DEPARTMENT_HEAD ONLY) */}
        {activeTab === 'goals' && isDepartmentHead && (
          <>
            {user?.userid && (
              <GoalsView managerId={user.userid} />
            )}
          </>
        )}

        {/* REQ-PP-12: Employee views goals set by line manager (DEPARTMENT_EMPLOYEE) */}
        {activeTab === 'goals' && !isDepartmentHead && isDepartmentEmployee && (
          <>
            {user?.userid && (
              <EmployeeGoalsView employeeId={user.userid} />
            )}
          </>
        )}
      </div>
    );
  }

  // For other users (candidates, etc.)
  return (
    <div className={styles.container}>
      <Card padding="lg" shadow="warm">
        <div className={styles.placeholder}>
          <h2>Performance Management</h2>
          <p>Performance management features are not available for your user type.</p>
        </div>
      </Card>
    </div>
  );
}

export default function PerformancePage() {
  return (
    <ProtectedRoute>
      <PerformanceContent />
    </ProtectedRoute>
  );
}
