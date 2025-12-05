/**
 * Payroll Configuration Module Types
 * Define types specific to this module
 * 
 * ========================== EMAD ==========================
 * Types for: Pay Grades, Allowances, Tax Rules, Approval Workflow
 * Author: Mohammed Emad
 * ========================== EMAD ==========================
 */

import { BaseEntity } from '@/shared/types';

// ==========================================
// ENUMS
// ==========================================

export enum ApprovalStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum AllowanceType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export enum AllowanceFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  ONE_TIME = 'ONE_TIME',
}

export enum TaxCalculationType {
  FLAT = 'FLAT',
  PROGRESSIVE = 'PROGRESSIVE',
  TIERED = 'TIERED',
}

// ==========================================
// PAY GRADE TYPES
// ==========================================

export interface PayGrade extends BaseEntity {
  name: string;
  description?: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface CreatePayGradeDto {
  name: string;
  description?: string;
  minSalary: number;
  maxSalary: number;
  currency?: string;
}

export interface UpdatePayGradeDto extends Partial<CreatePayGradeDto> {}

export interface FilterPayGradeDto {
  status?: ApprovalStatus;
  name?: string;
  minSalaryFrom?: number;
  minSalaryTo?: number;
  maxSalaryFrom?: number;
  maxSalaryTo?: number;
  page?: number;
  limit?: number;
}

// ==========================================
// ALLOWANCE TYPES
// ==========================================

export interface Allowance extends BaseEntity {
  name: string;
  description?: string;
  type: AllowanceType;
  value: number;
  frequency: AllowanceFrequency;
  isTaxable: boolean;
  isActive: boolean;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface CreateAllowanceDto {
  name: string;
  description?: string;
  type: AllowanceType;
  value: number;
  frequency: AllowanceFrequency;
  isTaxable?: boolean;
  isActive?: boolean;
}

export interface UpdateAllowanceDto extends Partial<CreateAllowanceDto> {}

export interface FilterAllowanceDto {
  status?: ApprovalStatus;
  name?: string;
  type?: AllowanceType;
  frequency?: AllowanceFrequency;
  isTaxable?: boolean;
  page?: number;
  limit?: number;
}

// ==========================================
// TAX RULE TYPES
// ==========================================

export interface TaxBracket {
  minAmount: number;
  maxAmount: number;
  rate: number;
  fixedAmount?: number;
}

export interface TaxRule extends BaseEntity {
  name: string;
  description?: string;
  calculationType: TaxCalculationType;
  rate?: number;
  brackets?: TaxBracket[];
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface CreateTaxRuleDto {
  name: string;
  description?: string;
  calculationType: TaxCalculationType;
  rate?: number;
  brackets?: TaxBracket[];
  effectiveFrom: string;
  effectiveTo?: string;
  isActive?: boolean;
}

export interface UpdateTaxRuleDto extends Partial<CreateTaxRuleDto> {}

export interface FilterTaxRuleDto {
  status?: ApprovalStatus;
  name?: string;
  calculationType?: TaxCalculationType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// ==========================================
// APPROVAL WORKFLOW TYPES
// ==========================================

export interface ApproveDto {
  comments?: string;
}

export interface PendingApproval {
  id: string;
  entityType: 'PAY_GRADE' | 'ALLOWANCE' | 'TAX_RULE';
  name: string;
  submittedAt: string;
  submittedBy?: string;
}

export interface PendingApprovalsDashboard {
  payGrades: PayGrade[];
  allowances: Allowance[];
  taxRules: TaxRule[];
  totalPending: number;
}

export interface ApprovedConfigurations {
  payGrades: PayGrade[];
  allowances: Allowance[];
  taxRules: TaxRule[];
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

export interface PayGradeResponse {
  data: PayGrade;
  message?: string;
}

export interface PayGradesListResponse {
  data: PayGrade[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface AllowanceResponse {
  data: Allowance;
  message?: string;
}

export interface AllowancesListResponse {
  data: Allowance[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface TaxRuleResponse {
  data: TaxRule;
  message?: string;
}

export interface TaxRulesListResponse {
  data: TaxRule[];
  total?: number;
  page?: number;
  limit?: number;
}

// ========================== END EMAD ==========================

// ========================== JOHN WASFY ==========================
// Add Insurance Brackets, Payroll Policies types here
// ========================== END JOHN WASFY ==========================

// ========================== ESLAM ==========================
// Add Signing Bonus, Pay Types, Termination Benefits, Company Settings, Audit Logs types here
// ========================== END ESLAM ==========================

