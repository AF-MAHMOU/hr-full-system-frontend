import { BaseEntity } from '@/shared/types';

// ============================================================
// 
// ============================================================

export enum CorrectionRequestStatus {
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
}

export enum PunchType {
  IN = 'IN',
  OUT = 'OUT',
}

export enum HolidayType {
  NATIONAL = 'NATIONAL',
  ORGANIZATIONAL = 'ORGANIZATIONAL',
  WEEKLY_REST = 'WEEKLY_REST',
}

export enum ShiftAssignmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum PunchPolicy {
  MULTIPLE = 'MULTIPLE',
  FIRST_LAST = 'FIRST_LAST',
  ONLY_FIRST = 'ONLY_FIRST',
}

export enum TimeExceptionType {
  MISSED_PUNCH = 'MISSED_PUNCH',
  LATE = 'LATE',
  EARLY_LEAVE = 'EARLY_LEAVE',
  SHORT_TIME = 'SHORT_TIME',
  OVERTIME_REQUEST = 'OVERTIME_REQUEST',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
}

export enum TimeExceptionStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
}

// ============================================================
// 
// ============================================================

export interface Punch {
  timestamp: string; // ISO string
  type: 'IN' | 'OUT';
}

export interface AttendanceCorrectionRequest {
  employeeId: string; // just the ID
  attendanceRecordId: string; // just the ID
  reason?: string;
  status: CorrectionRequestStatus;
}

export interface AttendanceRecord {
  id: string; // optional, for frontend use
  employeeId: string;
  punches: Punch[];
  totalWorkMinutes: number;
  hasMissedPunch: boolean;
  exceptionIds: string[];
  finalisedForPayroll: boolean;
}

export interface Holiday {
  type: HolidayType;
  startDate: string; // ISO string
  endDate?: string;
  name?: string;
  active: boolean;
}

export interface LatenessRule {
  name: string;
  description?: string;
  gracePeriodMinutes: number;
  deductionForEachMinute: number;
  active: boolean;
}

export interface NotificationLog {
  to: string; // employee ID
  type: string;
  message?: string;
}

export interface OvertimeRule {
  name: string;
  description?: string;
  active: boolean;
  approved: boolean;
}

export interface ScheduleRule {
  name: string;
  pattern: string;
  active: boolean;
}

export interface ShiftAssignment {
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
  shiftId: string;
  scheduleRuleId?: string;
  startDate: string;
  endDate?: string;
  status: ShiftAssignmentStatus;
}

export interface ShiftType {
  name: string;
  active: boolean;
}

export interface Shift {
  id: string;
  name: string;
  shiftTypeId: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  punchPolicy: PunchPolicy;
  graceInMinutes: number;
  graceOutMinutes: number;
  requiresApprovalForOvertime: boolean;
  active: boolean;
}

export interface TimeException {
  employeeId: string;
  type: TimeExceptionType;
  attendanceRecordId: string;
  assignedTo: string;
  status: TimeExceptionStatus;
  reason?: string;
}

export interface Holiday {
  id: string;           // corresponds to MongoDB _id
  type: HolidayType;
  startDate: string;    // usually ISO string for frontend
  endDate?: string;     // optional
  name?: string;        // optional
  active: boolean;
  createdAt: string;    // from timestamps
  updatedAt: string;    // from timestamps
}


// ============================================================
// 
// ============================================================

// Attendance Correction Request DTO
export interface CreateAttendanceCorrectionRequestDto {
  employeeId: string;
  attendanceRecordId: string;
  reason?: string;
}

export interface UpdateAttendanceCorrectionRequestDto {
  status?: CorrectionRequestStatus;
  reason?: string;
}

// Attendance Record DTO
export interface CreateAttendanceRecordDto {
  employeeId: string;
  punches?: Punch[];
  totalWorkMinutes?: number;
  hasMissedPunch?: boolean;
  exceptionIds?: string[];
  finalisedForPayroll?: boolean;
}

export interface UpdateAttendanceRecordDto {
  punches?: Punch[];
  totalWorkMinutes?: number;
  hasMissedPunch?: boolean;
  exceptionIds?: string[];
  finalisedForPayroll?: boolean;
}

// Shift Assignment DTO
export interface CreateShiftAssignmentDto {
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
  shiftId: string;
  scheduleRuleId?: string;
  startDate: string;
  endDate?: string;
}

export interface UpdateShiftAssignmentDto {
  status?: ShiftAssignmentStatus;
  endDate?: string;
}

// Holiday DTO
export interface CreateHolidayDto {
  type: HolidayType;
  startDate: string;
  endDate?: string;
  name?: string;
  active?: boolean;
}

export interface UpdateHolidayDto {
  type?: HolidayType;
  startDate?: string;
  endDate?: string;
  name?: string;
  active?: boolean;
}

// Shift DTO
export interface CreateShiftDto {
  name: string;
  shiftTypeId: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  punchPolicy?: PunchPolicy;
  graceInMinutes?: number;
  graceOutMinutes?: number;
  requiresApprovalForOvertime?: boolean;
  active?: boolean;
}

export interface UpdateShiftDto {
  name?: string;
  shiftTypeId?: string;
  startTime?: string;
  endTime?: string;
  punchPolicy?: PunchPolicy;
  graceInMinutes?: number;
  graceOutMinutes?: number;
  requiresApprovalForOvertime?: boolean;
  active?: boolean;
}

// Time Exception DTO
export interface CreateTimeExceptionDto {
  employeeId: string;
  type: TimeExceptionType;
  attendanceRecordId: string;
  assignedTo: string;
  reason?: string;
}

export interface UpdateTimeExceptionDto {
  status?: TimeExceptionStatus;
  reason?: string;
}

// LatenessRule DTO
export interface CreateLatenessRuleDto {
  name: string;
  description?: string;
  gracePeriodMinutes?: number;
  deductionForEachMinute?: number;
  active?: boolean;
}

export interface UpdateLatenessRuleDto {
  name?: string;
  description?: string;
  gracePeriodMinutes?: number;
  deductionForEachMinute?: number;
  active?: boolean;
}

// NotificationLog DTO
export interface CreateNotificationLogDto {
  to: string;
  type: string;
  message?: string;
}

// OvertimeRule DTO
export interface CreateOvertimeRuleDto {
  name: string;
  description?: string;
  active?: boolean;
  approved?: boolean;
}

export interface UpdateOvertimeRuleDto {
  name?: string;
  description?: string;
  active?: boolean;
  approved?: boolean;
}

// ScheduleRule DTO
export interface CreateScheduleRuleDto {
  name: string;
  pattern: string;
  active?: boolean;
}

export interface UpdateScheduleRuleDto {
  name?: string;
  pattern?: string;
  active?: boolean;
}

// ShiftType DTO
export interface CreateShiftTypeDto {
  name: string;
  active?: boolean;
}

export interface UpdateShiftTypeDto {
  name?: string;
  active?: boolean;
}

/*
Keeping this for when I need it again
for... some reason... :)

export class AttendanceCorrectionRequest {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AttendanceRecord', required: true })
  attendanceRecord: AttendanceRecord;

  @Prop()
  reason?: string;

  @Prop({
    type: String,
    enum: CorrectionRequestStatus,
    default: CorrectionRequestStatus.SUBMITTED,
  })
  status: CorrectionRequestStatus;
}

export class AttendanceRecord {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ default: [] })
  punches: Punch[];

  @Prop({ default: 0 }) // to be computed after creating an instance
  totalWorkMinutes: number;

  @Prop({ default: false }) // to be computed after creating an instance
  hasMissedPunch: boolean;

  @Prop({ type: Types.ObjectId, ref: 'TimeException', default: [] })
  exceptionIds: Types.ObjectId[];

  @Prop({ default: true }) // should be set to false when there is an attendance correction request that is not yet resolved
  finalisedForPayroll: boolean;
}

export class Holiday {
  @Prop({ type: String, enum: HolidayType, required: true })
  type: HolidayType;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date; // if missing, startDate == holiday day

  @Prop()
  name?: string;

  @Prop({ default: true })
  active: boolean;
}

export class LatenessRule {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: 0 })
  gracePeriodMinutes: number;

  @Prop({ default: 0 })
  deductionForEachMinute: number;

  @Prop({ default: true })
  active: boolean;
}

export class NotificationLog {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  to: Types.ObjectId;

  @Prop({ required: true })
  type: string;

  @Prop()
  message?: string;
}

export class OvertimeRule {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: false })
  approved: boolean;
}

export class ScheduleRule {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  pattern: string;

  @Prop({ default: true })
  active: boolean;
}

export class ShiftAssignment {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile' })
  employeeId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Position' })
  positionId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Shift', required: true })
  shiftId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ScheduleRule' })
  scheduleRuleId?: Types.ObjectId;

  @Prop({ required: true })
  startDate: Date;

  @Prop()
  endDate?: Date; //null means ongoing

  @Prop({ type: String, enum: ShiftAssignmentStatus, default: ShiftAssignmentStatus.PENDING })
  status: ShiftAssignmentStatus;
}

export class ShiftType {
  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  active: boolean;
}

export class Shift {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'ShiftType', required: true })
  shiftType: Types.ObjectId;

  @Prop({ required: true })
  startTime: string;

  @Prop({ required: true })
  endTime: string;

  @Prop({ type: String, enum: PunchPolicy, default: PunchPolicy.FIRST_LAST })
  punchPolicy: PunchPolicy;

  @Prop({ default: 0 })
  graceInMinutes: number;

  @Prop({ default: 0 })
  graceOutMinutes: number;

  @Prop({ default: false })
  requiresApprovalForOvertime: boolean;

  @Prop({ default: true })
  active: boolean;
}

export class TimeException {
  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  employeeId: Types.ObjectId;

  @Prop({ type: String, enum: TimeExceptionType, required: true })
  type: TimeExceptionType;

  @Prop({ type: Types.ObjectId, ref: 'AttendanceRecord', required: true })
  attendanceRecordId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'EmployeeProfile', required: true })
  assignedTo: Types.ObjectId; // person responsible for handling the exception

  @Prop({ type: String, enum: TimeExceptionStatus, default: TimeExceptionStatus.OPEN })
  status: TimeExceptionStatus;

  @Prop()
  reason?: string;
}
  */