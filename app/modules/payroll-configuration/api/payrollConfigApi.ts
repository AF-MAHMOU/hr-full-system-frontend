/**
 * Payroll Configuration API Service
 *
 * ========================== EMAD ==========================
 * API calls for: Pay Grades, Allowances, Tax Rules, Approval Workflow
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type {
  PayGrade,
  CreatePayGradeDto,
  UpdatePayGradeDto,
  FilterPayGradeDto,
  Allowance,
  CreateAllowanceDto,
  UpdateAllowanceDto,
  FilterAllowanceDto,
  TaxRule,
  CreateTaxRuleDto,
  UpdateTaxRuleDto,
  FilterTaxRuleDto,
  ApproveDto,
  PendingApprovalsDashboard,
  ApprovedConfigurations,
} from '../types';

const BASE_URL = API_ENDPOINTS.PAYROLL_CONFIGURATION;

// ==========================================
// PAY GRADE API
// ==========================================

export const payGradeApi = {
  /**
   * Create a new pay grade (DRAFT status)
   */
  create: async (data: CreatePayGradeDto): Promise<PayGrade> => {
    const response = await apiClient.post<PayGrade>(`${BASE_URL}/pay-grades`, data);
    return response.data;
  },

  /**
   * Get all pay grades with optional filtering
   */
  getAll: async (filter?: FilterPayGradeDto): Promise<PayGrade[]> => {
    const response = await apiClient.get<PayGrade[]>(`${BASE_URL}/pay-grades`, {
      params: filter,
    });
    return response.data;
  },

  /**
   * Get all approved pay grades
   */
  getApproved: async (): Promise<PayGrade[]> => {
    const response = await apiClient.get<PayGrade[]>(`${BASE_URL}/pay-grades/approved`);
    return response.data;
  },

  /**
   * Get a single pay grade by ID
   */
  getById: async (id: string): Promise<PayGrade> => {
    const response = await apiClient.get<PayGrade>(`${BASE_URL}/pay-grades/${id}`);
    return response.data;
  },

  /**
   * Update a pay grade (only DRAFT status)
   */
  update: async (id: string, data: UpdatePayGradeDto): Promise<PayGrade> => {
    const response = await apiClient.put<PayGrade>(`${BASE_URL}/pay-grades/${id}`, data);
    return response.data;
  },

  /**
   * Delete a pay grade (only DRAFT status)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/pay-grades/${id}`);
  },

  /**
   * Submit pay grade for approval
   */
  submit: async (id: string): Promise<PayGrade> => {
    const response = await apiClient.post<PayGrade>(`${BASE_URL}/pay-grades/${id}/submit`);
    return response.data;
  },

  /**
   * Approve a pay grade (Payroll Manager only)
   */
  approve: async (id: string, data?: ApproveDto): Promise<PayGrade> => {
    const response = await apiClient.post<PayGrade>(`${BASE_URL}/pay-grades/${id}/approve`, data);
    return response.data;
  },

  /**
   * Reject a pay grade (Payroll Manager only)
   */
  reject: async (id: string): Promise<PayGrade> => {
    const response = await apiClient.post<PayGrade>(`${BASE_URL}/pay-grades/${id}/reject`);
    return response.data;
  },
};

// ==========================================
// ALLOWANCE API
// ==========================================

export const allowanceApi = {
  /**
   * Create a new allowance (DRAFT status)
   */
  create: async (data: CreateAllowanceDto): Promise<Allowance> => {
    const response = await apiClient.post<Allowance>(`${BASE_URL}/allowances`, data);
    return response.data;
  },

  /**
   * Get all allowances with optional filtering
   */
  getAll: async (filter?: FilterAllowanceDto): Promise<Allowance[]> => {
    const response = await apiClient.get<Allowance[]>(`${BASE_URL}/allowances`, {
      params: filter,
    });
    return response.data;
  },

  /**
   * Get all approved allowances
   */
  getApproved: async (): Promise<Allowance[]> => {
    const response = await apiClient.get<Allowance[]>(`${BASE_URL}/allowances/approved`);
    return response.data;
  },

  /**
   * Get a single allowance by ID
   */
  getById: async (id: string): Promise<Allowance> => {
    const response = await apiClient.get<Allowance>(`${BASE_URL}/allowances/${id}`);
    return response.data;
  },

  /**
   * Update an allowance (only DRAFT status)
   */
  update: async (id: string, data: UpdateAllowanceDto): Promise<Allowance> => {
    const response = await apiClient.put<Allowance>(`${BASE_URL}/allowances/${id}`, data);
    return response.data;
  },

  /**
   * Delete an allowance (only DRAFT status)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/allowances/${id}`);
  },

  /**
   * Submit allowance for approval
   */
  submit: async (id: string): Promise<Allowance> => {
    const response = await apiClient.post<Allowance>(`${BASE_URL}/allowances/${id}/submit`);
    return response.data;
  },

  /**
   * Approve an allowance (Payroll Manager only)
   */
  approve: async (id: string, data?: ApproveDto): Promise<Allowance> => {
    const response = await apiClient.post<Allowance>(`${BASE_URL}/allowances/${id}/approve`, data);
    return response.data;
  },

  /**
   * Reject an allowance (Payroll Manager only)
   */
  reject: async (id: string): Promise<Allowance> => {
    const response = await apiClient.post<Allowance>(`${BASE_URL}/allowances/${id}/reject`);
    return response.data;
  },
};

// ==========================================
// TAX RULE API
// ==========================================

export const taxRuleApi = {
  /**
   * Create a new tax rule (DRAFT status)
   */
  create: async (data: CreateTaxRuleDto): Promise<TaxRule> => {
    const response = await apiClient.post<TaxRule>(`${BASE_URL}/tax-rules`, data);
    return response.data;
  },

  /**
   * Get all tax rules with optional filtering
   */
  getAll: async (filter?: FilterTaxRuleDto): Promise<TaxRule[]> => {
    const response = await apiClient.get<TaxRule[]>(`${BASE_URL}/tax-rules`, {
      params: filter,
    });
    return response.data;
  },

  /**
   * Get all approved tax rules
   */
  getApproved: async (): Promise<TaxRule[]> => {
    const response = await apiClient.get<TaxRule[]>(`${BASE_URL}/tax-rules/approved`);
    return response.data;
  },

  /**
   * Get a single tax rule by ID
   */
  getById: async (id: string): Promise<TaxRule> => {
    const response = await apiClient.get<TaxRule>(`${BASE_URL}/tax-rules/${id}`);
    return response.data;
  },

  /**
   * Update a tax rule (only DRAFT status)
   */
  update: async (id: string, data: UpdateTaxRuleDto): Promise<TaxRule> => {
    const response = await apiClient.put<TaxRule>(`${BASE_URL}/tax-rules/${id}`, data);
    return response.data;
  },

  /**
   * Delete a tax rule (only DRAFT status)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/tax-rules/${id}`);
  },

  /**
   * Submit tax rule for approval
   */
  submit: async (id: string): Promise<TaxRule> => {
    const response = await apiClient.post<TaxRule>(`${BASE_URL}/tax-rules/${id}/submit`);
    return response.data;
  },

  /**
   * Approve a tax rule (Payroll Manager only)
   */
  approve: async (id: string, data?: ApproveDto): Promise<TaxRule> => {
    const response = await apiClient.post<TaxRule>(`${BASE_URL}/tax-rules/${id}/approve`, data);
    return response.data;
  },

  /**
   * Reject a tax rule (Payroll Manager only)
   */
  reject: async (id: string): Promise<TaxRule> => {
    const response = await apiClient.post<TaxRule>(`${BASE_URL}/tax-rules/${id}/reject`);
    return response.data;
  },
};

// ==========================================
// APPROVAL WORKFLOW API
// ==========================================

export const approvalApi = {
  /**
   * Get pending approvals dashboard
   */
  getPendingDashboard: async (): Promise<PendingApprovalsDashboard> => {
    const response = await apiClient.get<PendingApprovalsDashboard>(
      `${BASE_URL}/approvals/pending`
    );
    return response.data;
  },

  /**
   * Get all approved configurations
   */
  getAllApproved: async (): Promise<ApprovedConfigurations> => {
    const response = await apiClient.get<ApprovedConfigurations>(
      `${BASE_URL}/configurations/approved`
    );
    return response.data;
  },
};

// ========================== END EMAD ==========================

// ========================== JOHN WASFY ==========================
// Add Insurance Brackets, Payroll Policies API here
// ========================== END JOHN WASFY ==========================

// ========================== ESLAM ==========================
// Add Signing Bonus, Pay Types, Termination Benefits, Company Settings, Audit Logs API here
// ========================== END ESLAM ==========================
