'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/shared/components';
import { Card, Button, Input, Modal } from '@/shared/components';
import { createDepartment, getDepartments } from './api/orgStructureApi';
import type { CreateDepartmentDto, Department } from './types';
import styles from './page.module.css';
import { CreateDepartmentForm } from './components/CreateDepartmentForm';
import { DepartmentList } from './components/DepartmentList';

function OrganizationStructureContent() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch existing departments on mount and when refresh is triggered
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const response = await getDepartments({ limit: 1000, isActive: true });
        setDepartments(response.data);
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, [refreshTrigger]);

  const handleDepartmentCreated = () => {
    setShowAddDepartmentModal(false);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Organization Structure</h1>
          <p>Manage departments and positions</p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowAddDepartmentModal(true)}
        >
          + Add Department
        </Button>
      </div>

      {isLoadingDepartments ? (
        <Card padding="lg">
          <div className={styles.loading}>Loading departments...</div>
        </Card>
      ) : departments.length === 0 ? (
        <Card padding="lg" className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <h2>No departments yet</h2>
            <p>Get started by creating your first department</p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowAddDepartmentModal(true)}
            >
              Create First Department
            </Button>
          </div>
        </Card>
      ) : (
        <DepartmentList
          departments={departments}
          onRefresh={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}

      {/* Add Department Modal */}
      <Modal
        isOpen={showAddDepartmentModal}
        onClose={() => setShowAddDepartmentModal(false)}
        title="Create New Department"
      >
        <CreateDepartmentForm
          onSuccess={handleDepartmentCreated}
          onCancel={() => setShowAddDepartmentModal(false)}
        />
      </Modal>
    </div>
  );
}

// Always wrap with ProtectedRoute!
export default function OrganizationStructurePage() {
  return (
    <ProtectedRoute>
      <OrganizationStructureContent />
    </ProtectedRoute>
  );
}
