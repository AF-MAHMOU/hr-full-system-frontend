/**
 * ========================== EMAD ==========================
 * Payroll Configuration Module - Main Page
 * This module handles payroll configuration and policy setup
 * 
 * Tabs implemented by Emad:
 * - Dashboard (Approval Dashboard)
 * - Pay Grades
 * - Allowances
 * - Tax Rules
 * 
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute';
import PayGradeList from './components/PayGradeList';
import AllowanceList from './components/AllowanceList';
import TaxRuleList from './components/TaxRuleList';
import ApprovalDashboard from './components/ApprovalDashboard';
import styles from './page.module.css';

// ========================== EMAD - Tab Configuration ==========================
type TabId = 'dashboard' | 'payGrades' | 'allowances' | 'taxRules';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const EMAD_TABS: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'payGrades', label: 'Pay Grades', icon: '💰' },
  { id: 'allowances', label: 'Allowances', icon: '🎁' },
  { id: 'taxRules', label: 'Tax Rules', icon: '📋' },
];
// ========================== EMAD - End Tab Configuration ==========================

function PayrollConfigurationContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // Get first role or undefined for ApprovalDashboard
  const userRole = user?.roles?.[0];

  const renderTabContent = () => {
    switch (activeTab) {
      // ========================== EMAD - Tab Content ==========================
      case 'dashboard':
        return <ApprovalDashboard userRole={userRole} />;
      case 'payGrades':
        return <PayGradeList />;
      case 'allowances':
        return <AllowanceList />;
      case 'taxRules':
        return <TaxRuleList />;
      // ========================== EMAD - End Tab Content ==========================
      
      // ========================== JOHN - Add your tabs here ==========================
      // case 'yourTab':
      //   return <YourComponent />;
      // ========================== JOHN - End ==========================
      
      // ========================== ESLAM - Add your tabs here ==========================
      // case 'yourTab':
      //   return <YourComponent />;
      // ========================== ESLAM - End ==========================
      
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Payroll Configuration</h1>
        <p className={styles.pageSubtitle}>
          Manage pay grades, allowances, tax rules, and approval workflows
        </p>
      </div>

      {/* Main Content */}
      <Card padding="lg" shadow="md">
        {/* Tab Navigation */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            {/* ========================== EMAD - Tabs ========================== */}
            {EMAD_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
            {/* ========================== EMAD - End Tabs ========================== */}
            
            {/* ========================== JOHN - Add your tab buttons here ========================== */}
            {/* 
            <button
              className={`${styles.tab} ${activeTab === 'yourTab' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('yourTab')}
            >
              <span className={styles.tabIcon}>🔧</span>
              Your Tab
            </button>
            */}
            {/* ========================== JOHN - End ========================== */}
            
            {/* ========================== ESLAM - Add your tab buttons here ========================== */}
            {/* 
            <button
              className={`${styles.tab} ${activeTab === 'yourTab' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('yourTab')}
            >
              <span className={styles.tabIcon}>⚙️</span>
              Your Tab
            </button>
            */}
            {/* ========================== ESLAM - End ========================== */}
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>
      </Card>
    </div>
  );
}

export default function PayrollConfigurationPage() {
  return (
    <ProtectedRoute>
      <PayrollConfigurationContent />
    </ProtectedRoute>
  );
}

