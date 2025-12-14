/**
 * Performance Module Types
 * Define types specific to this module
 */

export enum AppraisalTemplateType {
  ANNUAL = 'ANNUAL',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  PROBATIONARY = 'PROBATIONARY',
  PROJECT = 'PROJECT',
  AD_HOC = 'AD_HOC',
}

export enum AppraisalRatingScaleType {
  THREE_POINT = 'THREE_POINT',
  FIVE_POINT = 'FIVE_POINT',
  TEN_POINT = 'TEN_POINT',
}

/**
 * RatingScaleDefinition - matches backend schema exactly
 */
export interface RatingScaleDefinition {
  type: AppraisalRatingScaleType;
  min: number;
  max: number;
  step?: number;
  labels?: string[];
}

/**
 * EvaluationCriterion - matches backend schema exactly
 */
export interface EvaluationCriterion {
  key: string;
  title: string;
  details?: string;
  weight?: number;
  maxScore?: number;
  required?: boolean;
}

/**
 * AppraisalTemplate - matches backend schema exactly
 */
export interface AppraisalTemplate {
  _id?: string;
  name: string;
  description?: string;
  templateType: AppraisalTemplateType;
  ratingScale: RatingScaleDefinition;
  criteria: EvaluationCriterion[];
  instructions?: string;
  applicableDepartmentIds?: string[];
  applicablePositionIds?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * CreateAppraisalTemplateDto - matches backend DTO exactly
 */
export interface CreateAppraisalTemplateDto {
  name: string;
  description?: string;
  templateType: AppraisalTemplateType;
  ratingScale: RatingScaleDefinition;
  criteria?: EvaluationCriterion[];
  instructions?: string;
  applicableDepartmentIds?: string[];
  applicablePositionIds?: string[];
  isActive?: boolean;
}

/**
 * UpdateAppraisalTemplateDto - matches backend DTO exactly
 */
export interface UpdateAppraisalTemplateDto extends Partial<CreateAppraisalTemplateDto> {
  isActive?: boolean;
}

/**
 * AppraisalAssignmentStatus - matches backend enum
 */
export enum AppraisalAssignmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  PUBLISHED = 'PUBLISHED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

/**
 * AppraisalAssignment - matches backend schema
 */
export interface AppraisalAssignment {
  _id?: string;
  cycleId?: string;
  templateId: string;
  employeeProfileId: string;
  managerProfileId: string;
  departmentId: string;
  positionId?: string;
  status: AppraisalAssignmentStatus;
  assignedAt?: string;
  dueDate?: string;
  submittedAt?: string;
  publishedAt?: string;
  latestAppraisalId?: string;
  // Populated fields
  template?: AppraisalTemplate;
  employee?: any;
  manager?: any;
  department?: any;
  position?: any;
  cycle?: any;
}

/**
 * CreateAppraisalAssignmentDto - matches backend DTO
 */
export interface CreateAppraisalAssignmentDto {
  templateId: string;
  cycleId: string;
  employeeProfileIds: string[];
  managerProfileId?: string;
  dueDate?: string;
}

/**
 * BulkAssignTemplateDto - matches backend DTO
 */
export interface BulkAssignTemplateDto {
  templateId: string;
  cycleId: string;
  departmentIds?: string[];
  positionIds?: string[];
  employeeProfileIds?: string[];
  dueDate?: string;
  managerProfileId?: string;
}

/**
 * UpdateAppraisalAssignmentDto - matches backend DTO
 */
export interface UpdateAppraisalAssignmentDto {
  templateId?: string;
  managerProfileId?: string;
  dueDate?: string;
  status?: AppraisalAssignmentStatus;
}

/**
 * AppraisalCycle - matches backend schema
 */
export interface CycleTemplateAssignment {
  templateId: string | { _id: string; name?: string };
  departmentIds?: (string | { _id: string; name?: string })[];
}

export interface AppraisalCycle {
  _id?: string;
  name: string;
  description?: string;
  cycleType: AppraisalTemplateType;
  startDate: string;
  endDate: string;
  managerDueDate?: string;
  employeeAcknowledgementDueDate?: string;
  status: string; // AppraisalCycleStatus
  publishedAt?: string;
  closedAt?: string;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  templateAssignments?: CycleTemplateAssignment[];
}

/**
 * CreateAppraisalCycleDto - matches backend DTO
 */
export interface CreateAppraisalCycleDto {
  cycleName: string;
  description?: string;
  appraisalType: string; // AppraisalTemplateType as string
  templateId: string;
  startDate: string;
  endDate: string;
  selfAssessmentDeadline?: string;
  managerReviewDeadline: string;
  hrReviewDeadline?: string;
  disputeDeadline?: string;
  targetEmployeeIds?: string[];
  targetDepartmentIds?: string[];
  targetPositionIds?: string[];
  excludeEmployeeIds?: string[];
}

/**
 * CycleProgress - matches backend getCycleProgress response
 */
export interface CycleProgress {
  total: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  acknowledged: number;
  completed: number;
  completionRate: number;
}

/**
 * AppraisalDisputeStatus - matches backend enum
 */
export enum AppraisalDisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ADJUSTED = 'ADJUSTED',
  REJECTED = 'REJECTED',
}

/**
 * AppraisalDispute - matches backend schema
 */
export interface AppraisalDispute {
  _id?: string;
  appraisalId: string | any;
  assignmentId: string | any;
  cycleId: string | any;
  raisedByEmployeeId: string | any;
  reason: string;
  details?: string;
  status: AppraisalDisputeStatus;
  submittedAt?: string;
  assignedReviewerEmployeeId?: string | any;
  resolutionSummary?: string;
  resolvedAt?: string;
  resolvedByEmployeeId?: string | any;
  // Populated fields
  appraisal?: any;
  cycle?: AppraisalCycle;
  assignment?: AppraisalAssignment;
  raisedBy?: any;
  resolvedBy?: any;
  reviewer?: any;
}

/**
 * CreateAppraisalDisputeDto - matches backend DTO
 */
export interface CreateAppraisalDisputeDto {
  evaluationId: string;
  disputeReason: string;
  disputedSections?: string[];
  disputedCriteria?: string[];
  proposedRating?: number;
  supportingDocumentIds?: string[];
  additionalComments?: string;
}

/**
 * ResolveAppraisalDisputeDto - matches backend DTO
 */
export interface ResolveAppraisalDisputeDto {
  status: 'RESOLVED' | 'REJECTED' | 'ADJUSTED' | 'REJECTED';
  resolutionType?: string;
  adjustedRating?: number;
  resolutionNotes?: string;
  reviewComments?: string;
}

/**
 * HighPerformerFlag - extracted from AppraisalRecord fields
 */
export interface HighPerformerFlag {
  isHighPerformer: boolean;
  notes?: string;
  promotionRecommendation?: string;
  flaggedAt?: string;
}

/**
 * FlagHighPerformerDto - for creating/updating flags
 */
export interface FlagHighPerformerDto {
  appraisalRecordId: string;
  isHighPerformer?: boolean;
  notes?: string;
  promotionRecommendation?: string;
}

/**
 * AppraisalRecord - matches backend AppraisalRecord schema
 * REQ-OD-08: Employee / Line Manager access past appraisal history
 */
export interface AppraisalRecord {
  _id?: string;
  assignmentId: string | any;
  cycleId?: string | any;
  templateId?: string | any;
  employeeProfileId?: string | any;
  managerProfileId?: string | any;
  ratings?: Array<{
    key: string;
    title: string;
    ratingValue: number;
    ratingLabel?: string;
    weightedScore?: number;
    comments?: string;
  }>;
  totalScore?: number;
  overallRatingLabel?: string;
  managerSummary?: string;
  strengths?: string;
  improvementAreas?: string;
  status?: string;
  managerSubmittedAt?: string;
  hrPublishedAt?: string;
  publishedByEmployeeId?: string | any;
  employeeViewedAt?: string;
  employeeAcknowledgedAt?: string;
  employeeAcknowledgementComment?: string;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Performance Improvement Plan (PIP) - stored in AppraisalRecord fields
 * REQ-OD-05: Line Manager initiates Performance Improvement Plans
 */
export interface PerformanceImprovementPlan {
  appraisalRecordId: string;
  employeeProfileId: string;
  title: string;
  description?: string;
  reason: string;
  improvementAreas: string[];
  actionItems: string[];
  expectedOutcomes?: string;
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progressNotes?: string;
  finalOutcome?: string;
  createdByManagerId: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * CreatePerformanceImprovementPlanDto - for creating PIPs
 */
export interface CreatePerformanceImprovementPlanDto {
  appraisalRecordId: string;
  title: string;
  description?: string;
  reason: string;
  improvementAreas: string[];
  actionItems: string[];
  expectedOutcomes?: string;
  startDate: string;
  targetCompletionDate: string;
}

/**
 * UpdatePerformanceImprovementPlanDto - for updating PIPs
 */
export interface UpdatePerformanceImprovementPlanDto {
  title?: string;
  description?: string;
  reason?: string;
  improvementAreas?: string[];
  actionItems?: string[];
  expectedOutcomes?: string;
  startDate?: string;
  targetCompletionDate?: string;
  actualCompletionDate?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  progressNotes?: string;
  finalOutcome?: string;
}

/**
 * Visibility Rules - REQ-OD-16: System Admin configures visibility rules
 */
export enum FeedbackFieldType {
  MANAGER_SUMMARY = 'MANAGER_SUMMARY',
  STRENGTHS = 'STRENGTHS',
  IMPROVEMENT_AREAS = 'IMPROVEMENT_AREAS',
  RATINGS = 'RATINGS',
  COMMENTS = 'COMMENTS',
  SELF_ASSESSMENT = 'SELF_ASSESSMENT',
  OVERALL_SCORE = 'OVERALL_SCORE',
  FINAL_RATING = 'FINAL_RATING',
}

export interface VisibilityRule {
  id?: string;
  name: string;
  description?: string;
  fieldType: FeedbackFieldType;
  allowedRoles: string[]; // SystemRole[]
  isActive: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVisibilityRuleDto {
  name: string;
  description?: string;
  fieldType: FeedbackFieldType;
  allowedRoles: string[];
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface UpdateVisibilityRuleDto {
  name?: string;
  description?: string;
  fieldType?: FeedbackFieldType;
  allowedRoles?: string[];
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

/**
 * 1-on-1 Meetings - REQ-OD-14: Line Manager schedules 1-on-1 meetings
 */
export enum MeetingStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
}

export interface OneOnOneMeeting {
  id?: string;
  managerId: string;
  employeeId: string;
  scheduledDate: string;
  meetingNotes?: string;
  agenda?: string;
  status: MeetingStatus;
  completedAt?: string;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  // Populated fields
  manager?: any;
  employee?: any;
}

export interface CreateOneOnOneMeetingDto {
  employeeId: string;
  scheduledDate: string;
  agenda?: string;
  meetingNotes?: string;
}

export interface UpdateOneOnOneMeetingDto {
  scheduledDate?: string;
  agenda?: string;
  meetingNotes?: string;
  status?: MeetingStatus;
}