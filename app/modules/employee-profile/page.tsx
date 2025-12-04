/**
 * Employee Profile Module
 * This module handles employee profile management
 */

'use client';

import { useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button, Card, ProtectedRoute } from '@/shared/components';
import ChangePasswordModal from './components/ChangePasswordModal';
import styles from './page.module.css';

function EmployeeProfileContent() {
  const { user } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  return (
    <div className={styles.container}>
      <Card padding="lg" shadow="warm" className={styles.card}>
        <div className={styles.header}>
          <h1>Employee Profile</h1>
          <p>Manage your profile and account settings</p>
        </div>

        <div className={styles.profileSection}>
          <h2>Account Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <strong>Email:</strong>
              <span>{user?.email || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>User ID:</strong>
              <span>{user?.userid || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>User Type:</strong>
              <span>{user?.userType || 'N/A'}</span>
            </div>
            {user?.employeeNumber && (
              <div className={styles.infoItem}>
                <strong>Employee Number:</strong>
                <span>{user.employeeNumber}</span>
              </div>
            )}
            {user?.candidateNumber && (
              <div className={styles.infoItem}>
                <strong>Candidate Number:</strong>
                <span>{user.candidateNumber}</span>
              </div>
            )}
            <div className={styles.infoItem}>
              <strong>Roles:</strong>
              <span>{user?.roles?.join(', ') || 'None'}</span>
            </div>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h2>Security Settings</h2>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h3>Password</h3>
                <p>Change your account password</p>
              </div>
              <Button
                variant="primary"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}

export default function EmployeeProfilePage() {
  return (
    <ProtectedRoute>
      <EmployeeProfileContent />
    </ProtectedRoute>
  );
}

