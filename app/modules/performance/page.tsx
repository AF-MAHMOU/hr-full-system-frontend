/**
 * Performance Module
 * This module handles performance appraisal management
 * REQ-PP-01: Configure Standardized Appraisal Templates and Rating Scales (System Admin)
 * Employee Performance View (for employees)
 */

'use client';

import { useState, useEffect } from 'react';
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
import styles from './page.module.css';

function PerformanceContent() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<AppraisalTemplate[]>([]);
  const [cycles, setCycles] = useState<AppraisalCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDepartmentHeadByPosition, setIsDepartmentHeadByPosition] = useState(false);
  
  // Check user roles first to determine default tab
  const isSystemAdmin = user?.roles?.includes(SystemRole.SYSTEM_ADMIN);
  const isHrAdmin = user?.roles?.includes(SystemRole.HR_ADMIN);
  const isHrManager = user?.roles?.includes(SystemRole.HR_MANAGER);
  const isHrEmployee = user?.roles?.includes(SystemRole.HR_EMPLOYEE);
  
  // Department Head can be:
  // 1. Has SystemRole.DEPARTMENT_HEAD role, OR
  // 2. Is an HR Manager (who can also act as department head for meeting scheduling), OR
  // 3. Has primaryPositionId that matches a department's headPositionId (position-based)
  const isDepartmentHead = 
    user?.roles?.includes(SystemRole.DEPARTMENT_HEAD) || 
    isHrManager ||
    isDepartmentHeadByPosition;
  // REQ-PP-01: System Admin configures templates, REQ-PP-02: HR Manager creates cycles
  const canManageTemplates = isSystemAdmin || isHrAdmin || isHrManager;
  // REQ-PP-05: HR Employee assigns appraisal forms/templates
  const canManageAssignments = isSystemAdmin || isHrAdmin || isHrManager || isHrEmployee;
  // REQ-AE-06: HR Employee monitors appraisal progress (Progress Dashboard)
  const canViewProgressDashboard = isSystemAdmin || isHrAdmin || isHrEmployee;
  // REQ-AE-10: HR Manager consolidated dashboard (Consolidated Dashboard)
  const canViewConsolidatedDashboard = isSystemAdmin || isHrAdmin || isHrManager;
  // REQ-AE-07: HR Employee can view disputes
  const canViewDisputes = isSystemAdmin || isHrAdmin || isHrManager || isHrEmployee;
  const isEmployee = user?.userType === 'employee';
  
  // Debug logging
  console.log('Performance page - User roles check:', {
    userid: user?.userid,
    roles: user?.roles,
    isHrEmployee,
    isHrManager,
    isHrAdmin,
    isSystemAdmin,
    canManageTemplates,
    canManageAssignments,
    canViewProgressDashboard,
    canViewConsolidatedDashboard,
    canViewDisputes,
    isEmployee,
  });
  
  // Set default tab based on role
  const getDefaultTab = () => {
    if (isHrEmployee && !canManageTemplates) {
      return 'dashboard'; // HR Employee defaults to Progress Dashboard (REQ-AE-06)
    }
    if (isHrManager && !isHrAdmin && !isSystemAdmin) {
      return 'consolidated'; // HR Manager defaults to Consolidated Dashboard (REQ-AE-10)
    }
    return 'templates';
  };
  
  const [activeTab, setActiveTab] = useState<'templates' | 'cycles' | 'assignments' | 'dashboard' | 'consolidated' | 'disputes' | 'my-performance' | 'team-reviews' | 'improvement-plans' | 'history' | 'visibility-rules' | 'meetings'>(getDefaultTab());
  const [hasTeamReviews, setHasTeamReviews] = useState(false);
  
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
      });
      
      // Line Manager (DEPARTMENT_HEAD) should always see Team Reviews tab
      if (isDepartmentHead || isHrManager || isHrAdmin || isSystemAdmin) {
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
    
    if (canManageTemplates) {
      fetchTemplates();
      fetchCycles();
    } else if (canViewProgressDashboard || canViewConsolidatedDashboard || canViewDisputes || canManageAssignments) {
      // HR Employee/Manager can view dashboards, disputes, or assignments, fetch cycles
      fetchCycles();
    } else {
      setLoading(false);
    }
    
    checkTeamReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageTemplates, canViewProgressDashboard, canViewConsolidatedDashboard, canViewDisputes, canManageAssignments, user?.userid, isDepartmentHead, isHrManager, isHrAdmin, isHrEmployee, isSystemAdmin]);

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
  // REQ-PP-05: HR Employee can assign templates
  // REQ-AE-06: HR Employee monitors progress (Progress Dashboard)
  // REQ-AE-10: HR Manager sees consolidated dashboard
  if (canManageTemplates || canManageAssignments || canViewProgressDashboard || canViewConsolidatedDashboard || canViewDisputes) {
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
          {/* REQ-PP-01: System Admin configures templates, REQ-PP-02: HR Manager creates cycles */}
          {canManageTemplates && (
            <>
              <button
                className={`${styles.tab} ${activeTab === 'templates' ? styles.active : ''}`}
                onClick={() => setActiveTab('templates')}
              >
                Template Configuration
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'cycles' ? styles.active : ''}`}
                onClick={() => setActiveTab('cycles')}
              >
                Cycles
              </button>
            </>
          )}
          {/* REQ-PP-05: HR Employee assigns appraisal forms/templates */}
          {canManageAssignments && (
            <button
              className={`${styles.tab} ${activeTab === 'assignments' ? styles.active : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              Assignments
            </button>
          )}
          {/* REQ-AE-06: HR Employee monitors appraisal progress (Progress Dashboard) */}
          {canViewProgressDashboard && (
            <button
              className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Progress Dashboard
            </button>
          )}
          {/* REQ-AE-10: HR Manager consolidated dashboard */}
          {canViewConsolidatedDashboard && (
            <button
              className={`${styles.tab} ${activeTab === 'consolidated' ? styles.active : ''}`}
              onClick={() => setActiveTab('consolidated')}
            >
              Consolidated Dashboard
            </button>
          )}
          {/* REQ-AE-07: HR Employee can view disputes */}
          {canViewDisputes && (
            <button
              className={`${styles.tab} ${activeTab === 'disputes' ? styles.active : ''}`}
              onClick={() => setActiveTab('disputes')}
            >
              Disputes
            </button>
          )}
          {/* REQ-PP-13, REQ-AE-03: Line Manager views assigned forms and completes ratings */}
          {hasTeamReviews && (
            <button
              className={`${styles.tab} ${activeTab === 'team-reviews' ? styles.active : ''}`}
              onClick={() => setActiveTab('team-reviews')}
            >
              Team Reviews
            </button>
          )}
          {/* REQ-OD-05: Line Manager initiates Performance Improvement Plans */}
          {/* HR Managers, HR Admins, System Admins, and Department Heads can view PIPs */}
          {(isDepartmentHead || isHrManager || isHrAdmin || isSystemAdmin) && (
            <button
              className={`${styles.tab} ${activeTab === 'improvement-plans' ? styles.active : ''}`}
              onClick={() => setActiveTab('improvement-plans')}
            >
              Improvement Plans
            </button>
          )}
          {/* REQ-OD-14: Line Manager schedules 1-on-1 meetings */}
          {isDepartmentHead && (
            <button
              className={`${styles.tab} ${activeTab === 'meetings' ? styles.active : ''}`}
              onClick={() => setActiveTab('meetings')}
            >
              1-on-1 Meetings
            </button>
          )}
          {/* REQ-OD-16: System Admin configures visibility rules */}
          {isSystemAdmin && (
            <button
              className={`${styles.tab} ${activeTab === 'visibility-rules' ? styles.active : ''}`}
              onClick={() => setActiveTab('visibility-rules')}
            >
              Visibility Rules
            </button>
          )}
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
          {/* HR Employees can view their own 1-on-1 meetings */}
          {isHrEmployee && (
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

        {activeTab === 'cycles' && canManageTemplates && (
          <CycleList cycles={cycles} onRefresh={fetchCycles} />
        )}

        {/* REQ-PP-05: HR Employee assigns appraisal forms/templates */}
        {activeTab === 'assignments' && canManageAssignments && (
          <AssignmentList />
        )}

        {/* REQ-AE-06: HR Employee monitors appraisal progress */}
        {activeTab === 'dashboard' && canViewProgressDashboard && (
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

        {/* REQ-OD-05: Line Manager initiates Performance Improvement Plans */}
        {/* HR Managers, HR Admins, System Admins, and Department Heads can view PIPs */}
        {activeTab === 'improvement-plans' && (isDepartmentHead || isHrManager || isHrAdmin || isSystemAdmin) && (
          <>
            {user?.userid && (
              <PIPListView 
                managerId={user.userid} 
                showAllPIPs={isHrManager || isHrAdmin || isSystemAdmin}
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

        {/* REQ-OD-14: Line Manager schedules 1-on-1 meetings */}
        {activeTab === 'meetings' && isDepartmentHead && (
          <OneOnOneMeetingsView />
        )}

        {/* HR Employees can view their own 1-on-1 meetings */}
        {activeTab === 'meetings' && isHrEmployee && !isDepartmentHead && (
          <>
            {user?.userid && (
              <EmployeeMeetingsView employeeId={user.userid} />
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
