/**
 * HR Dashboard Page
 * Overview of HR metrics and pending tasks
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Card, ProtectedRoute } from '@/shared/components';
import { SystemRole } from '@/shared/types/auth';
import { hrApi } from './api/hrApi';
import { getDepartmentById } from '../organization-structure/api/orgStructureApi';
import { getMyProfile } from '../employee-profile/api/profileApi';
import styles from './page.module.css';

function HRDashboardContent() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [activeEmployees, setActiveEmployees] = useState(0);
  const [onProbation, setOnProbation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [employeeDepartment, setEmployeeDepartment] = useState<{ name: string; employeeCount: number } | null>(null);
  const [loadingDepartment, setLoadingDepartment] = useState(true);

  // Check if user has HR role
  const userRoles = user?.roles || [];
  const hasHrRole = 
    userRoles.includes(SystemRole.HR_ADMIN) ||
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_EMPLOYEE) ||
    userRoles.includes(SystemRole.SYSTEM_ADMIN);
  
  const isHrEmployee = userRoles.includes(SystemRole.HR_EMPLOYEE) && 
    !userRoles.includes(SystemRole.HR_MANAGER) && 
    !userRoles.includes(SystemRole.HR_ADMIN) && 
    !userRoles.includes(SystemRole.SYSTEM_ADMIN);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.roles) return;

      try {
        setLoading(true);
        
        // Initialize loadingDepartment based on user type
        if (isHrEmployee) {
          setLoadingDepartment(true);
        } else {
          setLoadingDepartment(false); // Not needed for managers/admins
        }

        // For HR Employees, fetch their department info
        // Use /me endpoint since HR Employees don't have permission to use /employee-profile/:id
        if (isHrEmployee && user?.userid) {
          try {
            const employee = await getMyProfile();
            if (employee?.primaryDepartmentId) {
              // Get department details
              const deptResponse = await getDepartmentById(employee.primaryDepartmentId);
              const department = deptResponse.data;
              
              // Count employees in this department
              const deptEmployees = await hrApi.searchEmployees({ 
                department: employee.primaryDepartmentId 
              });
              
              setEmployeeDepartment({
                name: department.name,
                employeeCount: deptEmployees.length
              });
            } else {
              // No department assigned
              setEmployeeDepartment(null);
            }
          } catch (error) {
            console.error('Error fetching department data:', error);
            setEmployeeDepartment(null);
          } finally {
            setLoadingDepartment(false);
          }
        }

        // Fetch pending change requests (only for managers/admins)
        if (!isHrEmployee) {
          const requests = await hrApi.getPendingChangeRequests();
          setPendingRequests(requests.length);
        }

        // Fetch active employees (only for managers/admins)
        if (!isHrEmployee) {
          const employees = await hrApi.searchEmployees({ status: 'ACTIVE' });
          setActiveEmployees(employees.length);

          // Fetch employees on probation
          const probationEmployees = await hrApi.searchEmployees({ status: 'PROBATION' });
          setOnProbation(probationEmployees.length);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Ensure loading states are reset on error
        setLoadingDepartment(false);
      } finally {
        setLoading(false);
      }
    };

    if (hasHrRole) {
      fetchDashboardData();
    } else {
      // If no HR role, reset loading states
      setLoading(false);
      setLoadingDepartment(false);
    }
  }, [user, hasHrRole, isHrEmployee]);

  const isAdmin = 
    userRoles.includes(SystemRole.HR_ADMIN) || 
    userRoles.includes(SystemRole.SYSTEM_ADMIN);
  const isManager = 
    userRoles.includes(SystemRole.HR_MANAGER) ||
    userRoles.includes(SystemRole.HR_EMPLOYEE) ||
    isAdmin;

  if (!hasHrRole) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          Access denied. HR role required.
        </div>
      </div>
    );
  }

  if (loading || loadingDepartment) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>HR Dashboard</h1>
        <p>Welcome, {user?.email}</p>
      </div>

      {isHrEmployee ? (
        // HR Employee view - show only their department
        <div className={styles.widgets}>
          {employeeDepartment ? (
            <Card padding="lg" shadow="warm" className={styles.widget}>
              <div className={styles.widgetContent}>
                <h3>My Department</h3>
                <div className={styles.widgetValue}>{employeeDepartment.name}</div>
                <div className={styles.widgetSubValue}>
                  {employeeDepartment.employeeCount} {employeeDepartment.employeeCount === 1 ? 'Employee' : 'Employees'}
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="lg" shadow="warm" className={styles.widget}>
              <div className={styles.widgetContent}>
                <h3>My Department</h3>
                <div className={styles.widgetValue}>No Department Assigned</div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        // HR Manager/Admin view - show full dashboard
        <div className={styles.widgets}>
          <Card padding="lg" shadow="warm" className={styles.widget}>
            <div className={styles.widgetContent}>
              <h3>Pending Change Requests</h3>
              <div className={styles.widgetValue}>{pendingRequests}</div>
              <a href="/modules/hr/change-requests" className={styles.widgetLink}>
                View Requests →
              </a>
            </div>
          </Card>

          <Card padding="lg" shadow="warm" className={styles.widget}>
            <div className={styles.widgetContent}>
              <h3>Active Employees</h3>
              <div className={styles.widgetValue}>{activeEmployees}</div>
              <a href="/modules/hr/employees" className={styles.widgetLink}>
                View All →
              </a>
            </div>
          </Card>

          <Card padding="lg" shadow="warm" className={styles.widget}>
            <div className={styles.widgetContent}>
              <h3>On Probation</h3>
              <div className={styles.widgetValue}>{onProbation}</div>
              <a href="/modules/hr/employees?status=PROBATION" className={styles.widgetLink}>
                View Details →
              </a>
            </div>
          </Card>
        </div>
      )}

      {isAdmin && (
        <Card padding="lg" shadow="warm" className={styles.adminSection}>
          <h2>Admin Actions</h2>
          <div className={styles.adminActions}>
            <a href="/modules/hr/roles" className={styles.adminLink}>
              Role Management
            </a>
            <a href="/modules/hr/settings" className={styles.adminLink}>
              System Settings
            </a>
          </div>
        </Card>
      )}

      <div className={styles.quickLinks}>
        <Card padding="lg" shadow="warm">
          <h2>Quick Links</h2>
          <div className={styles.linksGrid}>
            <a href="/modules/hr/employees" className={styles.link}>
              All Employees
            </a>
            <a href="/modules/hr/employees/search" className={styles.link}>
              Search Employees
            </a>
            <a href="/modules/hr/change-requests" className={styles.link}>
              Change Requests
            </a>
            {isManager && (
              <a href="/modules/recruitment" className={styles.link}>
                Recruitment
              </a>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function HRDashboardPage() {
  return (
    <ProtectedRoute>
      <HRDashboardContent />
    </ProtectedRoute>
  );
}

