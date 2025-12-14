/**
 * Performance API functions
 * Handles performance appraisal operations
 * Module-specific API - only used within performance module
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type {
  AppraisalTemplate,
  CreateAppraisalTemplateDto,
  UpdateAppraisalTemplateDto,
  AppraisalAssignment,
  CreateAppraisalAssignmentDto,
  BulkAssignTemplateDto,
  UpdateAppraisalAssignmentDto,
  AppraisalCycle,
  CreateAppraisalCycleDto,
  AppraisalDispute,
  CreateAppraisalDisputeDto,
  ResolveAppraisalDisputeDto,
  AppraisalDisputeStatus,
  HighPerformerFlag,
  FlagHighPerformerDto,
  VisibilityRule,
  CreateVisibilityRuleDto,
  UpdateVisibilityRuleDto,
  OneOnOneMeeting,
  CreateOneOnOneMeetingDto,
  UpdateOneOnOneMeetingDto,
} from '../types';

/**
 * Get all appraisal templates
 * Backend returns data directly (not wrapped)
 */
export const getTemplates = async (isActive?: boolean): Promise<AppraisalTemplate[]> => {
  const params = isActive !== undefined ? { isActive: String(isActive) } : {};
  const response = await apiClient.get<AppraisalTemplate[] | { success: boolean; message: string; data: AppraisalTemplate[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/templates`,
    { params }
  );
  // Handle both wrapped and unwrapped responses
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Get a single template by ID
 * Backend returns data directly (not wrapped)
 */
export const getTemplateById = async (id: string): Promise<AppraisalTemplate> => {
  const response = await apiClient.get<AppraisalTemplate | { success: boolean; message: string; data: AppraisalTemplate }>(
    `${API_ENDPOINTS.PERFORMANCE}/templates/${id}`
  );
  // Handle both wrapped and unwrapped responses
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalTemplate;
  }
  return (response.data as any).data;
};

/**
 * Create a new appraisal template
 * Backend returns data directly (not wrapped)
 */
export const createTemplate = async (data: CreateAppraisalTemplateDto): Promise<AppraisalTemplate> => {
  const response = await apiClient.post<AppraisalTemplate | { success: boolean; message: string; data: AppraisalTemplate }>(
    `${API_ENDPOINTS.PERFORMANCE}/templates`,
    data
  );
  // Handle both wrapped and unwrapped responses
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalTemplate;
  }
  return (response.data as any).data;
};

/**
 * Update an existing template
 * Backend returns data directly (not wrapped)
 */
export const updateTemplate = async (
  id: string,
  data: UpdateAppraisalTemplateDto
): Promise<AppraisalTemplate> => {
  const response = await apiClient.put<AppraisalTemplate | { success: boolean; message: string; data: AppraisalTemplate }>(
    `${API_ENDPOINTS.PERFORMANCE}/templates/${id}`,
    data
  );
  // Handle both wrapped and unwrapped responses
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalTemplate;
  }
  return (response.data as any).data;
};

/**
 * Delete a template
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.PERFORMANCE}/templates/${id}`);
};

/**
 * Get all appraisal cycles
 */
export const getCycles = async (status?: string): Promise<AppraisalCycle[]> => {
  const params = status ? { status } : {};
  const response = await apiClient.get<AppraisalCycle[] | { success: boolean; message: string; data: AppraisalCycle[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/cycles`,
    { params }
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Create a new appraisal cycle
 */
export const createCycle = async (data: CreateAppraisalCycleDto): Promise<AppraisalCycle> => {
  const response = await apiClient.post<AppraisalCycle | { success: boolean; message: string; data: AppraisalCycle }>(
    `${API_ENDPOINTS.PERFORMANCE}/cycles`,
    data
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalCycle;
  }
  return (response.data as any).data;
};

/**
 * Update an existing appraisal cycle
 */
export const updateCycle = async (
  cycleId: string,
  data: CreateAppraisalCycleDto
): Promise<AppraisalCycle> => {
  const response = await apiClient.put<AppraisalCycle | { success: boolean; message: string; data: AppraisalCycle }>(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}`,
    data
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalCycle;
  }
  return (response.data as any).data;
};

/**
 * Activate an appraisal cycle
 * Changes status from PLANNED to ACTIVE and auto-assigns appraisals
 */
export const activateCycle = async (cycleId: string): Promise<AppraisalCycle> => {
  const response = await apiClient.post<AppraisalCycle | { success: boolean; message: string; data: AppraisalCycle }>(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/activate`
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalCycle;
  }
  return (response.data as any).data;
};

/**
 * Publish an appraisal cycle
 * Publishes all evaluations and assignments in the cycle to employees
 * Roles: HR_MANAGER, HR_ADMIN, SYSTEM_ADMIN
 */
export const publishCycle = async (cycleId: string): Promise<AppraisalCycle> => {
  const response = await apiClient.post<AppraisalCycle | { success: boolean; message: string; data: AppraisalCycle }>(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/publish`
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalCycle;
  }
  return (response.data as any).data;
};

/**
 * Get all assignments with optional filters
 */
export const getAssignments = async (filters?: {
  cycleId?: string;
  templateId?: string;
  employeeProfileId?: string;
  managerProfileId?: string;
  departmentId?: string;
  status?: string;
}): Promise<AppraisalAssignment[]> => {
  const params: any = {};
  if (filters?.cycleId) params.cycleId = filters.cycleId;
  if (filters?.templateId) params.templateId = filters.templateId;
  if (filters?.employeeProfileId) params.employeeProfileId = filters.employeeProfileId;
  if (filters?.managerProfileId) params.managerProfileId = filters.managerProfileId;
  if (filters?.departmentId) params.departmentId = filters.departmentId;
  if (filters?.status) params.status = filters.status;

  const response = await apiClient.get<AppraisalAssignment[] | { success: boolean; message: string; data: AppraisalAssignment[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/assignments`,
    { params }
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Get a single assignment by ID
 */
export const getAssignmentById = async (id: string): Promise<AppraisalAssignment> => {
  const response = await apiClient.get<AppraisalAssignment | { success: boolean; message: string; data: AppraisalAssignment }>(
    `${API_ENDPOINTS.PERFORMANCE}/assignments/${id}`
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalAssignment;
  }
  return (response.data as any).data;
};

/**
 * Manually assign template to employee(s)
 */
export const assignTemplateToEmployees = async (data: CreateAppraisalAssignmentDto): Promise<AppraisalAssignment[]> => {
  const response = await apiClient.post<AppraisalAssignment[] | { success: boolean; message: string; data: AppraisalAssignment[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/assignments`,
    data
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Bulk assign template
 */
export const bulkAssignTemplate = async (data: BulkAssignTemplateDto): Promise<AppraisalAssignment[]> => {
  const response = await apiClient.post<AppraisalAssignment[] | { success: boolean; message: string; data: AppraisalAssignment[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/assignments/bulk`,
    data
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Update an assignment
 */
export const updateAssignment = async (
  id: string,
  data: UpdateAppraisalAssignmentDto
): Promise<AppraisalAssignment> => {
  const response = await apiClient.put<AppraisalAssignment | { success: boolean; message: string; data: AppraisalAssignment }>(
    `${API_ENDPOINTS.PERFORMANCE}/assignments/${id}`,
    data
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalAssignment;
  }
  return (response.data as any).data;
};

/**
 * Remove an assignment
 */
export const removeAssignment = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.PERFORMANCE}/assignments/${id}`);
};

/**
 * Get assignments for an employee
 */
export const getEmployeeAssignments = async (employeeId: string, cycleId?: string): Promise<AppraisalAssignment[]> => {
  const params: any = {};
  if (cycleId) params.cycleId = cycleId;
  
  console.log('API: getEmployeeAssignments called with:', { employeeId, cycleId, params });
  
  const response = await apiClient.get<AppraisalAssignment[] | { success: boolean; message: string; data: AppraisalAssignment[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/employees/${employeeId}/assignments`,
    { params }
  );
  
  console.log('API: getEmployeeAssignments response:', response.data);
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Get assignments for a manager (their direct reports)
 */
export const getManagerAssignments = async (managerId: string, cycleId?: string): Promise<AppraisalAssignment[]> => {
  const params: any = {};
  if (cycleId) params.cycleId = cycleId;
  
  console.log('API: getManagerAssignments called with:', { managerId, cycleId, params });
  
  const response = await apiClient.get<AppraisalAssignment[] | { success: boolean; message: string; data: AppraisalAssignment[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/managers/${managerId}/assignments`,
    { params }
  );
  
  console.log('API: getManagerAssignments response:', response.data);
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Get assignments for a cycle
 */
export const getCycleAssignments = async (cycleId: string): Promise<AppraisalAssignment[]> => {
  const response = await apiClient.get<AppraisalAssignment[] | { success: boolean; message: string; data: AppraisalAssignment[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/assignments`
  );
  
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Get assignment by employee and cycle
 */
export const getEmployeeAssignmentByCycle = async (cycleId: string, employeeId: string): Promise<AppraisalAssignment> => {
  const response = await apiClient.get<AppraisalAssignment | { success: boolean; message: string; data: AppraisalAssignment }>(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/employees/${employeeId}/assignment`
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalAssignment;
  }
  return (response.data as any).data;
};

/**
 * Submit self-assessment
 */
export const submitSelfAssessment = async (
  cycleId: string,
  employeeId: string,
  data: {
    sections: Array<{
      sectionId: string;
      sectionScore?: number;
      criteria: Array<{
        criteriaId: string;
        rating?: number;
        comments?: string;
      }>;
    }>;
    overallComments?: string;
  }
): Promise<any> => {
  const response = await apiClient.post(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/employees/${employeeId}/self-assessment`,
    data
  );
  return response.data;
};

/**
 * Get evaluation by ID
 */
export const getEvaluationById = async (evaluationId: string): Promise<any> => {
  const response = await apiClient.get(
    `${API_ENDPOINTS.PERFORMANCE}/evaluations/${evaluationId}`
  );
  return response.data;
};

/**
 * Get evaluation by cycle and employee
 */
export const getEvaluationByCycleAndEmployee = async (
  cycleId: string,
  employeeId: string
): Promise<any> => {
  const response = await apiClient.get(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/employees/${employeeId}/evaluation`
  );
  return response.data;
};

/**
 * Submit manager evaluation
 */
export const submitManagerEvaluation = async (
  cycleId: string,
  employeeId: string,
  data: {
    cycleId: string;
    templateId: string;
    employeeId: string;
    reviewerId: string;
    managerEvaluation: {
      sections: Array<{
        sectionId: string;
        sectionScore?: number;
        criteria: Array<{
          criteriaId: string;
          rating?: number;
          comments?: string;
        }>;
      }>;
      overallRating?: number;
      strengths?: string;
      areasForImprovement?: string;
      developmentRecommendations?: string;
      attendanceScore?: number;
      punctualityScore?: number;
      attendanceComments?: string;
    };
    finalRating: number;
  }
): Promise<any> => {
  const response = await apiClient.post(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/employees/${employeeId}/evaluation`,
    data
  );
  return response.data;
};

/**
 * Get cycle progress dashboard
 */
export const getCycleProgress = async (cycleId: string): Promise<{
  total: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  acknowledged: number;
  completed: number;
  completionRate: number;
}> => {
  const response = await apiClient.get(
    `${API_ENDPOINTS.PERFORMANCE}/cycles/${cycleId}/progress`
  );
  return response.data;
};

/**
 * Create a dispute for an appraisal evaluation
 */
export const createDispute = async (
  employeeId: string,
  data: CreateAppraisalDisputeDto
): Promise<AppraisalDispute> => {
  const response = await apiClient.post<AppraisalDispute | { success: boolean; message: string; data: AppraisalDispute }>(
    `${API_ENDPOINTS.PERFORMANCE}/disputes`,
    { employeeId, ...data }
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalDispute;
  }
  return (response.data as any).data;
};

/**
 * Get all disputes
 */
export const getDisputes = async (status?: AppraisalDisputeStatus): Promise<AppraisalDispute[]> => {
  const params = status ? { status } : {};
  const response = await apiClient.get<AppraisalDispute[] | { success: boolean; message: string; data: AppraisalDispute[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/disputes`,
    { params }
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Get disputes for a specific employee
 */
export const getEmployeeDisputes = async (employeeId: string): Promise<AppraisalDispute[]> => {
  const response = await apiClient.get<AppraisalDispute[] | { success: boolean; message: string; data: AppraisalDispute[] }>(
    `${API_ENDPOINTS.PERFORMANCE}/employees/${employeeId}/disputes`
  );
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return (response.data as any).data || [];
};

/**
 * Get a single dispute by ID
 */
export const getDisputeById = async (id: string): Promise<AppraisalDispute> => {
  const response = await apiClient.get<AppraisalDispute | { success: boolean; message: string; data: AppraisalDispute }>(
    `${API_ENDPOINTS.PERFORMANCE}/disputes/${id}`
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalDispute;
  }
  return (response.data as any).data;
};

/**
 * Resolve a dispute (HR Manager action)
 */
export const resolveDispute = async (
  disputeId: string,
  reviewerId: string,
  data: ResolveAppraisalDisputeDto
): Promise<AppraisalDispute> => {
  const response = await apiClient.post<AppraisalDispute | { success: boolean; message: string; data: AppraisalDispute }>(
    `${API_ENDPOINTS.PERFORMANCE}/disputes/${disputeId}/resolve`,
    { reviewerId, ...data }
  );
  if (response.data && '_id' in response.data) {
    return response.data as AppraisalDispute;
  }
  return (response.data as any).data;
};

/**
 * Acknowledge an appraisal evaluation (Employee action)
 */
export const acknowledgeEvaluation = async (
  evaluationId: string,
  comment?: string
): Promise<any> => {
  const response = await apiClient.post(
    `${API_ENDPOINTS.PERFORMANCE}/evaluations/${evaluationId}/acknowledge`,
    { comment }
  );
  return response.data;
};

/**
 * Export appraisal summaries (HR Employee action)
 * REQ-AE-11: HR Employee exports ad-hoc appraisal summaries
 */
export interface ExportAppraisalSummaryParams {
  cycleId?: string;
  departmentId?: string;
  employeeId?: string;
  format?: 'csv' | 'pdf';
  status?: string;
}

export const exportAppraisalSummaries = async (
  params: ExportAppraisalSummaryParams
): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (params.cycleId) queryParams.append('cycleId', params.cycleId);
  if (params.departmentId) queryParams.append('departmentId', params.departmentId);
  if (params.employeeId) queryParams.append('employeeId', params.employeeId);
  if (params.format) queryParams.append('format', params.format);
  if (params.status) queryParams.append('status', params.status);

  const response = await apiClient.get(
    `${API_ENDPOINTS.PERFORMANCE}/export/summaries?${queryParams.toString()}`,
    {
      responseType: 'blob', // Important for file downloads
    }
  );

  return response.data;
};

/**
 * Generate outcome report (HR Employee action)
 * REQ-OD-06: HR Employee generates outcome reports
 */
export interface ExportOutcomeReportParams {
  cycleId?: string;
  departmentId?: string;
  format?: 'csv' | 'pdf' | 'json';
  includeHighPerformers?: boolean;
  includePIPs?: boolean;
  includeDisputes?: boolean;
}

export const generateOutcomeReport = async (
  params: ExportOutcomeReportParams
): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  if (params.cycleId) queryParams.append('cycleId', params.cycleId);
  if (params.departmentId) queryParams.append('departmentId', params.departmentId);
  if (params.format) queryParams.append('format', params.format);
  if (params.includeHighPerformers !== undefined) {
    queryParams.append('includeHighPerformers', params.includeHighPerformers ? 'true' : 'false');
  }
  if (params.includePIPs !== undefined) {
    queryParams.append('includePIPs', params.includePIPs ? 'true' : 'false');
  }
  if (params.includeDisputes !== undefined) {
    queryParams.append('includeDisputes', params.includeDisputes ? 'true' : 'false');
  }

  const response = await apiClient.get(
    `${API_ENDPOINTS.PERFORMANCE}/export/outcome-report?${queryParams.toString()}`,
    {
      responseType: 'blob', // Important for file downloads
    }
  );

  return response.data;
};

/**
 * Flag an employee as a high-performer
 * POST /performance/high-performers/flag
 */
export const flagHighPerformer = async (
  flagDto: FlagHighPerformerDto
): Promise<any> => {
  const response = await apiClient.post<any>(
    `${API_ENDPOINTS.PERFORMANCE}/high-performers/flag`,
    flagDto
  );
  return response.data;
};

/**
 * Unflag a high-performer
 * POST /performance/high-performers/unflag/:appraisalRecordId
 */
export const unflagHighPerformer = async (
  appraisalRecordId: string
): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(
    `${API_ENDPOINTS.PERFORMANCE}/high-performers/unflag/${appraisalRecordId}`
  );
  return response.data;
};

/**
 * Get high-performer flag for an appraisal
 * GET /performance/high-performers/flag/:appraisalRecordId
 */
export const getHighPerformerFlag = async (
  appraisalRecordId: string
): Promise<HighPerformerFlag | null> => {
  const response = await apiClient.get<HighPerformerFlag | null>(
    `${API_ENDPOINTS.PERFORMANCE}/high-performers/flag/${appraisalRecordId}`
  );
  return response.data;
};

/**
 * Get all high-performers flagged by a manager
 * GET /performance/high-performers/manager/:managerId
 */
export const getHighPerformersByManager = async (
  managerId: string
): Promise<any[]> => {
  const response = await apiClient.get<any[]>(
    `${API_ENDPOINTS.PERFORMANCE}/high-performers/manager/${managerId}`
  );
  return response.data;
};

/**
 * Get all high-performers (HR/Admin view)
 * GET /performance/high-performers
 */
export const getAllHighPerformers = async (): Promise<any[]> => {
  const response = await apiClient.get<any[]>(
    `${API_ENDPOINTS.PERFORMANCE}/high-performers`
  );
  return response.data;
};

// ==================== PERFORMANCE IMPROVEMENT PLAN (PIP) API ====================
// REQ-OD-05: Line Manager initiates Performance Improvement Plans

export const createPerformanceImprovementPlan = async (
  createDto: import('../types').CreatePerformanceImprovementPlanDto
): Promise<any> => {
  const response = await apiClient.post(
    `${API_ENDPOINTS.PERFORMANCE}/improvement-plans`,
    createDto
  );
  return response.data;
};

export const getPIPsByEmployee = async (employeeId: string): Promise<any[]> => {
  const response = await apiClient.get<any[]>(
    `${API_ENDPOINTS.PERFORMANCE}/employees/${employeeId}/improvement-plans`
  );
  return response.data;
};

export const getPIPsByManager = async (managerId: string): Promise<any[]> => {
  const response = await apiClient.get<any[]>(
    `${API_ENDPOINTS.PERFORMANCE}/managers/${managerId}/improvement-plans`
  );
  return response.data;
};

export const getAllPIPs = async (status?: string): Promise<any[]> => {
  const url = status
    ? `${API_ENDPOINTS.PERFORMANCE}/improvement-plans?status=${status}`
    : `${API_ENDPOINTS.PERFORMANCE}/improvement-plans`;
  const response = await apiClient.get<any[]>(url);
  return response.data;
};

export const getPIPByAppraisalId = async (appraisalRecordId: string): Promise<any> => {
  const response = await apiClient.get(
    `${API_ENDPOINTS.PERFORMANCE}/improvement-plans/appraisal/${appraisalRecordId}`
  );
  return response.data;
};

export const updatePIP = async (
  appraisalRecordId: string,
  updateDto: import('../types').UpdatePerformanceImprovementPlanDto
): Promise<any> => {
  const response = await apiClient.put(
    `${API_ENDPOINTS.PERFORMANCE}/improvement-plans/appraisal/${appraisalRecordId}`,
    updateDto
  );
  return response.data;
};

export const deletePIP = async (appraisalRecordId: string): Promise<void> => {
  await apiClient.delete(
    `${API_ENDPOINTS.PERFORMANCE}/improvement-plans/appraisal/${appraisalRecordId}`
  );
};

/**
 * Get employee performance history
 * REQ-OD-08: Employee / Line Manager access past appraisal history
 * GET /performance/employees/:employeeId/history
 */
export const getEmployeePerformanceHistory = async (
  employeeId: string
): Promise<any[]> => {
  const response = await apiClient.get(
    `${API_ENDPOINTS.PERFORMANCE}/employees/${employeeId}/history`
  );
  return response.data;
};

/**
 * Visibility Rules API - REQ-OD-16: System Admin configures visibility rules
 */
export const getAllVisibilityRules = async (): Promise<VisibilityRule[]> => {
  const response = await apiClient.get<VisibilityRule[]>(
    `${API_ENDPOINTS.PERFORMANCE}/visibility-rules`
  );
  return response.data;
};

export const getActiveVisibilityRules = async (): Promise<VisibilityRule[]> => {
  const response = await apiClient.get<VisibilityRule[]>(
    `${API_ENDPOINTS.PERFORMANCE}/visibility-rules/active`
  );
  return response.data;
};

export const getVisibilityRuleById = async (id: string): Promise<VisibilityRule> => {
  const response = await apiClient.get<VisibilityRule>(
    `${API_ENDPOINTS.PERFORMANCE}/visibility-rules/${id}`
  );
  return response.data;
};

export const createVisibilityRule = async (
  data: CreateVisibilityRuleDto
): Promise<VisibilityRule> => {
  const response = await apiClient.post<VisibilityRule>(
    `${API_ENDPOINTS.PERFORMANCE}/visibility-rules`,
    data
  );
  return response.data;
};

export const updateVisibilityRule = async (
  id: string,
  data: UpdateVisibilityRuleDto
): Promise<VisibilityRule> => {
  const response = await apiClient.put<VisibilityRule>(
    `${API_ENDPOINTS.PERFORMANCE}/visibility-rules/${id}`,
    data
  );
  return response.data;
};

export const deleteVisibilityRule = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.PERFORMANCE}/visibility-rules/${id}`);
};

/**
 * 1-on-1 Meetings API - REQ-OD-14: Line Manager schedules 1-on-1 meetings
 */
export const createOneOnOneMeeting = async (
  data: CreateOneOnOneMeetingDto
): Promise<OneOnOneMeeting> => {
  const response = await apiClient.post<OneOnOneMeeting>(
    `${API_ENDPOINTS.PERFORMANCE}/meetings`,
    data
  );
  return response.data;
};

export const getMeetingsByManager = async (
  managerId: string
): Promise<OneOnOneMeeting[]> => {
  const response = await apiClient.get<OneOnOneMeeting[]>(
    `${API_ENDPOINTS.PERFORMANCE}/managers/${managerId}/meetings`
  );
  return response.data;
};

export const getMeetingsByEmployee = async (
  employeeId: string
): Promise<OneOnOneMeeting[]> => {
  const response = await apiClient.get<OneOnOneMeeting[]>(
    `${API_ENDPOINTS.PERFORMANCE}/employees/${employeeId}/meetings`
  );
  return response.data;
};

export const getMeetingById = async (id: string): Promise<OneOnOneMeeting> => {
  const response = await apiClient.get<OneOnOneMeeting>(
    `${API_ENDPOINTS.PERFORMANCE}/meetings/${id}`
  );
  return response.data;
};

export const updateOneOnOneMeeting = async (
  id: string,
  data: UpdateOneOnOneMeetingDto
): Promise<OneOnOneMeeting> => {
  const response = await apiClient.put<OneOnOneMeeting>(
    `${API_ENDPOINTS.PERFORMANCE}/meetings/${id}`,
    data
  );
  return response.data;
};

export const deleteOneOnOneMeeting = async (id: string): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.PERFORMANCE}/meetings/${id}`);
};

export const performanceApi = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getCycles,
  createCycle,
  updateCycle,
  activateCycle,
  publishCycle,
  getAssignments,
  getAssignmentById,
  assignTemplateToEmployees,
  bulkAssignTemplate,
  updateAssignment,
  removeAssignment,
  getEmployeeAssignments,
  getEmployeeAssignmentByCycle,
  getCycleAssignments,
  getManagerAssignments,
  submitSelfAssessment,
  getEvaluationById,
  getEvaluationByCycleAndEmployee,
  submitManagerEvaluation,
  getCycleProgress,
  createDispute,
  getDisputes,
  getEmployeeDisputes,
  getDisputeById,
  resolveDispute,
  acknowledgeEvaluation,
  exportAppraisalSummaries,
  generateOutcomeReport,
  flagHighPerformer,
  unflagHighPerformer,
  getHighPerformerFlag,
  getHighPerformersByManager,
  getAllHighPerformers,
  createPerformanceImprovementPlan,
  getPIPsByEmployee,
  getPIPsByManager,
  getAllPIPs,
  getPIPByAppraisalId,
  updatePIP,
  deletePIP,
  getEmployeePerformanceHistory,
  // Visibility Rules - REQ-OD-16
  getAllVisibilityRules,
  getActiveVisibilityRules,
  getVisibilityRuleById,
  createVisibilityRule,
  updateVisibilityRule,
  deleteVisibilityRule,
  // 1-on-1 Meetings - REQ-OD-14
  createOneOnOneMeeting,
  getMeetingsByManager,
  getMeetingsByEmployee,
  getMeetingById,
  updateOneOnOneMeeting,
  deleteOneOnOneMeeting,
};

