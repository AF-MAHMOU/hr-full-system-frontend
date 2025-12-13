import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationLog, NotificationLogDocument } from '../../time-management/models/notification-log.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../../employee-profile/models/employee-system-role.schema';
import { Position, PositionDocument } from '../models/position.schema';
import { Department, DepartmentDocument } from '../models/department.schema';
import { SystemRole } from '../../employee-profile/enums/employee-profile.enums';

export enum NotificationType {
  DEPARTMENT_CREATED = 'department_created',
  DEPARTMENT_UPDATED = 'department_updated',
  DEPARTMENT_DELETED = 'department_deleted',
  POSITION_CREATED = 'position_created',
  POSITION_UPDATED = 'position_updated',
  POSITION_DELETED = 'position_deleted',
  POSITION_REPORTING_CHANGED = 'position_reporting_changed',
  CHANGE_REQUEST_SUBMITTED = 'change_request_submitted',
  CHANGE_REQUEST_APPROVED = 'change_request_approved',
  CHANGE_REQUEST_REJECTED = 'change_request_rejected',
}

@Injectable()
export class OrganizationNotificationService {
  private readonly logger = new Logger(OrganizationNotificationService.name);

  constructor(
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeModel: Model<EmployeeProfileDocument>,
    @InjectModel(EmployeeSystemRole.name)
    private roleModel: Model<EmployeeSystemRoleDocument>,
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
  ) {}

  /**
   * Create a notification for a specific employee
   */
  private async createNotification(
    to: Types.ObjectId,
    type: NotificationType,
    message: string,
  ): Promise<NotificationLogDocument> {
    try {
      const notification = await this.notificationLogModel.create({
        to,
        type,
        message,
      });
      this.logger.log(`Notification created: ${type} for employee ${to}`);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error}`);
      throw error;
    }
  }

  /**
   * Get employees with specific roles
   */
  private async getEmployeesWithRoles(roles: SystemRole[]): Promise<EmployeeProfileDocument[]> {
    try {
      const roleRecords = await this.roleModel
        .find({
          roles: { $in: roles },
          isActive: true,
        })
        .select('employeeProfileId')
        .lean();

      const employeeIds = roleRecords.map((r) => r.employeeProfileId);

      if (employeeIds.length === 0) {
        return [];
      }

      const employees = await this.employeeModel
        .find({
          _id: { $in: employeeIds },
          status: 'ACTIVE',
        })
        .lean();

      return employees as EmployeeProfileDocument[];
    } catch (error) {
      this.logger.error(`Failed to get employees with roles: ${error}`);
      return [];
    }
  }

  /**
   * Get employee in a specific position
   */
  private async getEmployeeInPosition(positionId: string): Promise<EmployeeProfileDocument | null> {
    try {
      // For now, we'll just return null as position assignment is not fully implemented
      // This can be extended later when PositionAssignment is fully integrated
      return null;
    } catch (error) {
      this.logger.error(`Failed to get employee in position: ${error}`);
      return null;
    }
  }

  /**
   * Notify relevant stakeholders about department creation
   */
  async notifyDepartmentCreated(
    department: DepartmentDocument,
    createdBy: string,
  ): Promise<void> {
    try {
      const recipients = new Set<string>();

      // Get HR Admins
      const hrAdmins = await this.getEmployeesWithRoles([SystemRole.HR_ADMIN]);
      hrAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get System Admins
      const systemAdmins = await this.getEmployeesWithRoles([SystemRole.SYSTEM_ADMIN]);
      systemAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get HR Managers
      const hrManagers = await this.getEmployeesWithRoles([SystemRole.HR_MANAGER]);
      hrManagers.forEach((emp) => recipients.add(emp._id.toString()));

      // Get Department Head if assigned
      if (department.headPositionId) {
        const headPosition = await this.positionModel.findById(department.headPositionId).lean();
        if (headPosition) {
          // Try to find employee in this position
          const headEmployee = await this.getEmployeeInPosition(department.headPositionId.toString());
          if (headEmployee) {
            recipients.add(headEmployee._id.toString());
          }
        }
      }

      // Remove the creator from recipients (they already know they created it)
      recipients.delete(createdBy);

      // Create notifications
      const message = `New department created: ${department.name} (${department.code})${department.headPositionId ? '. You have been assigned as department head.' : ''}`;

      this.logger.log(`[notifyDepartmentCreated] Recipients before exclusion: ${Array.from(recipients).join(', ')}`);
      this.logger.log(`[notifyDepartmentCreated] Created by: ${createdBy}`);

      for (const recipientId of recipients) {
        try {
          await this.createNotification(
            new Types.ObjectId(recipientId),
            NotificationType.DEPARTMENT_CREATED,
            message,
          );
          this.logger.log(`[notifyDepartmentCreated] Notification created for: ${recipientId}`);
        } catch (error) {
          this.logger.error(`[notifyDepartmentCreated] Failed to create notification for ${recipientId}:`, error);
        }
      }

      this.logger.log(`Department creation notifications sent to ${recipients.size} recipients: ${Array.from(recipients).join(', ')}`);
    } catch (error) {
      this.logger.error(`Failed to send department creation notifications: ${error}`);
      // Don't throw - notifications are not critical
    }
  }

  /**
   * Notify relevant stakeholders about department update
   */
  async notifyDepartmentUpdated(
    department: DepartmentDocument,
    changes: string[],
    updatedBy: string,
  ): Promise<void> {
    try {
      const recipients = new Set<string>();

      // Get HR Admins
      const hrAdmins = await this.getEmployeesWithRoles([SystemRole.HR_ADMIN]);
      hrAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get System Admins
      const systemAdmins = await this.getEmployeesWithRoles([SystemRole.SYSTEM_ADMIN]);
      systemAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get Department Head if assigned
      if (department.headPositionId) {
        const headEmployee = await this.getEmployeeInPosition(department.headPositionId.toString());
        if (headEmployee) {
          recipients.add(headEmployee._id.toString());
        }
      }

      // Remove the updater from recipients (they already know they updated it)
      recipients.delete(updatedBy);

      // Create notifications
      const changesText = changes.length > 0 ? ` Changes: ${changes.join(', ')}.` : '';
      const message = `Department updated: ${department.name} (${department.code}).${changesText}`;

      for (const recipientId of recipients) {
        await this.createNotification(
          new Types.ObjectId(recipientId),
          NotificationType.DEPARTMENT_UPDATED,
          message,
        );
      }

      this.logger.log(`Department update notifications sent to ${recipients.size} recipients`);
    } catch (error) {
      this.logger.error(`Failed to send department update notifications: ${error}`);
    }
  }

  /**
   * Notify relevant stakeholders about department deletion
   */
  async notifyDepartmentDeleted(
    department: DepartmentDocument,
    deletedBy: string,
  ): Promise<void> {
    try {
      const recipients = new Set<string>();

      // Get HR Admins
      const hrAdmins = await this.getEmployeesWithRoles([SystemRole.HR_ADMIN]);
      hrAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get System Admins
      const systemAdmins = await this.getEmployeesWithRoles([SystemRole.SYSTEM_ADMIN]);
      systemAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get Department Head if assigned
      if (department.headPositionId) {
        const headEmployee = await this.getEmployeeInPosition(department.headPositionId.toString());
        if (headEmployee) {
          recipients.add(headEmployee._id.toString());
        }
      }

      // Remove the deleter from recipients (they already know they deleted it)
      recipients.delete(deletedBy);

      // Create notifications
      const message = `Department deactivated: ${department.name} (${department.code}). All positions in this department have been deactivated.`;

      for (const recipientId of recipients) {
        await this.createNotification(
          new Types.ObjectId(recipientId),
          NotificationType.DEPARTMENT_DELETED,
          message,
        );
      }

      this.logger.log(`Department deletion notifications sent to ${recipients.size} recipients`);
    } catch (error) {
      this.logger.error(`Failed to send department deletion notifications: ${error}`);
    }
  }

  /**
   * Notify relevant stakeholders about position creation
   */
  async notifyPositionCreated(
    position: PositionDocument,
    createdBy: string,
  ): Promise<void> {
    try {
      const recipients = new Set<string>();

      // Get HR Admins
      const hrAdmins = await this.getEmployeesWithRoles([SystemRole.HR_ADMIN]);
      hrAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get System Admins
      const systemAdmins = await this.getEmployeesWithRoles([SystemRole.SYSTEM_ADMIN]);
      systemAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get Department info for the message
      let departmentName = 'Unknown Department';
      let departmentId: any = position.departmentId;
      
      // Handle populated department (if it's an object with name property)
      if (departmentId && typeof departmentId === 'object' && departmentId.name) {
        departmentName = departmentId.name;
        departmentId = departmentId._id || departmentId;
        this.logger.log(`[notifyPositionCreated] Using populated department: ${departmentName}`);
        
        // Get Department Head - need to fetch department to get headPositionId
        try {
          const department = await this.departmentModel.findById(departmentId).lean();
          if (department?.headPositionId) {
            const headEmployee = await this.getEmployeeInPosition(department.headPositionId.toString());
            if (headEmployee) {
              recipients.add(headEmployee._id.toString());
            }
          }
        } catch (error) {
          this.logger.error(`[notifyPositionCreated] Error fetching department for head: ${error}`);
        }
      } else if (departmentId) {
        // If it's just an ID, fetch the department
        try {
          const department = await this.departmentModel.findById(departmentId).lean();
          if (department) {
            departmentName = department.name || 'Unknown Department';
            this.logger.log(`[notifyPositionCreated] Found department: ${departmentName} for position ${position.title}`);
            
            // Get Department Head
            if (department.headPositionId) {
              const headEmployee = await this.getEmployeeInPosition(department.headPositionId.toString());
              if (headEmployee) {
                recipients.add(headEmployee._id.toString());
              }
            }
          } else {
            this.logger.warn(`[notifyPositionCreated] Department not found for ID: ${departmentId}`);
          }
        } catch (error) {
          this.logger.error(`[notifyPositionCreated] Error fetching department: ${error}`);
        }
      } else {
        this.logger.warn(`[notifyPositionCreated] Position ${position.title} has no departmentId`);
      }

      // Get Reporting Manager if assigned and get position name
      let reportingPositionName = '';
      if (position.reportsToPositionId) {
        const reportingPosition = await this.positionModel.findById(position.reportsToPositionId).lean();
        if (reportingPosition) {
          reportingPositionName = `${reportingPosition.title} (${reportingPosition.code})`;
        }
        const reportingEmployee = await this.getEmployeeInPosition(position.reportsToPositionId.toString());
        if (reportingEmployee) {
          recipients.add(reportingEmployee._id.toString());
        }
      }

      // Remove the creator from recipients (they already know they created it)
      recipients.delete(createdBy);

      // Create notifications
      const reportingText = reportingPositionName ? ` It reports to ${reportingPositionName}.` : '';
      const message = `New position created: ${position.title} (${position.code}) in ${departmentName} department.${reportingText}`;
      this.logger.log(`[notifyPositionCreated] Final message: ${message}`);

      for (const recipientId of recipients) {
        await this.createNotification(
          new Types.ObjectId(recipientId),
          NotificationType.POSITION_CREATED,
          message,
        );
      }

      this.logger.log(`Position creation notifications sent to ${recipients.size} recipients`);
    } catch (error) {
      this.logger.error(`Failed to send position creation notifications: ${error}`);
    }
  }

  /**
   * Notify relevant stakeholders about position update
   */
  async notifyPositionUpdated(
    position: PositionDocument,
    changes: string[],
    updatedBy: string,
  ): Promise<void> {
    try {
      const recipients = new Set<string>();

      // Get HR Admins
      const hrAdmins = await this.getEmployeesWithRoles([SystemRole.HR_ADMIN]);
      hrAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get System Admins
      const systemAdmins = await this.getEmployeesWithRoles([SystemRole.SYSTEM_ADMIN]);
      systemAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get Department info for the message
      let departmentName = 'Unknown Department';
      if (position.departmentId) {
        const department = await this.departmentModel.findById(position.departmentId).lean();
        if (department) {
          departmentName = department.name;
          
          // Get Department Head
          if (department.headPositionId) {
            const headEmployee = await this.getEmployeeInPosition(department.headPositionId.toString());
            if (headEmployee) {
              recipients.add(headEmployee._id.toString());
            }
          }
        }
      }

      // Get Reporting Manager if assigned
      if (position.reportsToPositionId) {
        const reportingEmployee = await this.getEmployeeInPosition(position.reportsToPositionId.toString());
        if (reportingEmployee) {
          recipients.add(reportingEmployee._id.toString());
        }
      }

      // Remove the updater from recipients (they already know they updated it)
      recipients.delete(updatedBy);

      // Create notifications
      const changesText = changes.length > 0 ? ` Changes: ${changes.join(', ')}.` : '';
      const message = `Position updated: ${position.title} (${position.code}) in ${departmentName} department.${changesText}`;

      for (const recipientId of recipients) {
        await this.createNotification(
          new Types.ObjectId(recipientId),
          NotificationType.POSITION_UPDATED,
          message,
        );
      }

      this.logger.log(`Position update notifications sent to ${recipients.size} recipients`);
    } catch (error) {
      this.logger.error(`Failed to send position update notifications: ${error}`);
    }
  }

  /**
   * Notify relevant stakeholders about position deletion
   */
  async notifyPositionDeleted(
    position: PositionDocument,
    deletedBy: string,
  ): Promise<void> {
    try {
      const recipients = new Set<string>();

      // Get HR Admins
      const hrAdmins = await this.getEmployeesWithRoles([SystemRole.HR_ADMIN]);
      hrAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get System Admins
      const systemAdmins = await this.getEmployeesWithRoles([SystemRole.SYSTEM_ADMIN]);
      systemAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get Department info for the message
      let departmentName = 'Unknown Department';
      if (position.departmentId) {
        const department = await this.departmentModel.findById(position.departmentId).lean();
        if (department) {
          departmentName = department.name;
          
          // Get Department Head
          if (department.headPositionId) {
            const headEmployee = await this.getEmployeeInPosition(department.headPositionId.toString());
            if (headEmployee) {
              recipients.add(headEmployee._id.toString());
            }
          }
        }
      }

      // Get Reporting Manager if assigned
      if (position.reportsToPositionId) {
        const reportingEmployee = await this.getEmployeeInPosition(position.reportsToPositionId.toString());
        if (reportingEmployee) {
          recipients.add(reportingEmployee._id.toString());
        }
      }

      // Get positions that report to this position
      const reportingPositions = await this.positionModel
        .find({ reportsToPositionId: position._id, isActive: true })
        .lean();

      for (const reportingPosition of reportingPositions) {
        const reportingEmployee = await this.getEmployeeInPosition(reportingPosition._id.toString());
        if (reportingEmployee) {
          recipients.add(reportingEmployee._id.toString());
        }
      }

      // Remove the deleter from recipients (they already know they deleted it)
      recipients.delete(deletedBy);

      // Create notifications
      const message = `Position deactivated: ${position.title} (${position.code}) in ${departmentName} department. Note: Positions reporting to this position may need reassignment.`;

      for (const recipientId of recipients) {
        await this.createNotification(
          new Types.ObjectId(recipientId),
          NotificationType.POSITION_DELETED,
          message,
        );
      }

      this.logger.log(`Position deletion notifications sent to ${recipients.size} recipients`);
    } catch (error) {
      this.logger.error(`Failed to send position deletion notifications: ${error}`);
    }
  }

  /**
   * Notify relevant stakeholders about position reporting relationship change
   */
  async notifyPositionReportingChanged(
    position: PositionDocument,
    oldReportingPositionId: string | null,
    newReportingPositionId: string | null,
    changedBy: string,
  ): Promise<void> {
    try {
      const recipients = new Set<string>();

      // Get HR Admins
      const hrAdmins = await this.getEmployeesWithRoles([SystemRole.HR_ADMIN]);
      hrAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get System Admins
      const systemAdmins = await this.getEmployeesWithRoles([SystemRole.SYSTEM_ADMIN]);
      systemAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get Department Head
      if (position.departmentId) {
        const department = await this.departmentModel.findById(position.departmentId).lean();
        if (department?.headPositionId) {
          const headEmployee = await this.getEmployeeInPosition(department.headPositionId.toString());
          if (headEmployee) {
            recipients.add(headEmployee._id.toString());
          }
        }
      }

      // Get old reporting manager
      if (oldReportingPositionId) {
        const oldReportingEmployee = await this.getEmployeeInPosition(oldReportingPositionId);
        if (oldReportingEmployee) {
          recipients.add(oldReportingEmployee._id.toString());
        }
      }

      // Get new reporting manager and position info
      let newReportingPositionName = 'Unknown Position';
      if (newReportingPositionId) {
        const newReportingPosition = await this.positionModel.findById(newReportingPositionId).lean();
        if (newReportingPosition) {
          newReportingPositionName = `${newReportingPosition.title} (${newReportingPosition.code})`;
        }
        const newReportingEmployee = await this.getEmployeeInPosition(newReportingPositionId);
        if (newReportingEmployee) {
          recipients.add(newReportingEmployee._id.toString());
        }
      }

      // Get old reporting position name for context
      let oldReportingPositionName = 'Unknown Position';
      if (oldReportingPositionId) {
        const oldReportingPosition = await this.positionModel.findById(oldReportingPositionId).lean();
        if (oldReportingPosition) {
          oldReportingPositionName = `${oldReportingPosition.title} (${oldReportingPosition.code})`;
        }
      }

      // Remove the changer from recipients (they already know they changed it)
      recipients.delete(changedBy);

      // Create notifications
      let message = `Reporting relationship changed: ${position.title} (${position.code})`;
      if (oldReportingPositionId && newReportingPositionId) {
        message += ` now reports to ${newReportingPositionName} (previously reported to ${oldReportingPositionName}).`;
      } else if (newReportingPositionId) {
        message += ` now reports to ${newReportingPositionName}.`;
      } else {
        message += ` no longer reports to any position.`;
      }

      for (const recipientId of recipients) {
        await this.createNotification(
          new Types.ObjectId(recipientId),
          NotificationType.POSITION_REPORTING_CHANGED,
          message,
        );
      }

      this.logger.log(`Position reporting change notifications sent to ${recipients.size} recipients`);
    } catch (error) {
      this.logger.error(`Failed to send position reporting change notifications: ${error}`);
    }
  }

  /**
   * Notify reviewers about change request submission
   */
  async notifyChangeRequestSubmitted(
    changeRequest: any,
    submittedBy: string,
  ): Promise<void> {
    try {
      const recipients = new Set<string>();

      // Get HR Admins (reviewers)
      const hrAdmins = await this.getEmployeesWithRoles([SystemRole.HR_ADMIN]);
      hrAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Get HR Managers (reviewers)
      const hrManagers = await this.getEmployeesWithRoles([SystemRole.HR_MANAGER]);
      hrManagers.forEach((emp) => recipients.add(emp._id.toString()));

      // Get System Admins (reviewers)
      const systemAdmins = await this.getEmployeesWithRoles([SystemRole.SYSTEM_ADMIN]);
      systemAdmins.forEach((emp) => recipients.add(emp._id.toString()));

      // Remove the submitter from recipients (they already know they submitted it)
      recipients.delete(submittedBy);

      // Create notifications
      const message = `Change request submitted: ${changeRequest.requestNumber} (${changeRequest.requestType}). Please review and approve/reject.`;

      for (const recipientId of recipients) {
        await this.createNotification(
          new Types.ObjectId(recipientId),
          NotificationType.CHANGE_REQUEST_SUBMITTED,
          message,
        );
      }

      this.logger.log(`Change request submission notifications sent to ${recipients.size} recipients`);
    } catch (error) {
      this.logger.error(`Failed to send change request submission notifications: ${error}`);
    }
  }

  /**
   * Helper to extract employee ID from populated or unpopulated field
   */
  private getEmployeeId(employeeField: any): string | null {
    if (!employeeField) return null;
    // If it's a populated object, use _id
    if (typeof employeeField === 'object' && employeeField._id) {
      return employeeField._id.toString();
    }
    // If it's an ObjectId or string, convert to string
    return employeeField.toString();
  }

  /**
   * Notify requester and stakeholders about change request approval
   */
  async notifyChangeRequestApproved(
    changeRequest: any,
    approvedBy: string,
  ): Promise<void> {
    try {
      this.logger.log(`[notifyChangeRequestApproved] Processing approval for change request ${changeRequest.requestNumber || changeRequest._id}`);
      this.logger.log(`[notifyChangeRequestApproved] Approved by: ${approvedBy}`);
      this.logger.log(`[notifyChangeRequestApproved] RequestedByEmployeeId type: ${typeof changeRequest.requestedByEmployeeId}, value: ${JSON.stringify(changeRequest.requestedByEmployeeId)}`);
      
      const recipients = new Set<string>();

      // Get requester (handle both populated and unpopulated cases)
      const requesterId = this.getEmployeeId(changeRequest.requestedByEmployeeId);
      if (requesterId) {
        recipients.add(requesterId);
        this.logger.log(`[notifyChangeRequestApproved] Added requester: ${requesterId}`);
      } else {
        this.logger.warn(`[notifyChangeRequestApproved] No requester found for change request ${changeRequest.requestNumber}`);
      }

      // Get HR Admins
      const hrAdmins = await this.getEmployeesWithRoles([SystemRole.HR_ADMIN]);
      hrAdmins.forEach((emp) => recipients.add(emp._id.toString()));
      this.logger.log(`[notifyChangeRequestApproved] Added ${hrAdmins.length} HR Admins`);

      // Get HR Managers (they should also be notified)
      const hrManagers = await this.getEmployeesWithRoles([SystemRole.HR_MANAGER]);
      hrManagers.forEach((emp) => recipients.add(emp._id.toString()));
      this.logger.log(`[notifyChangeRequestApproved] Added ${hrManagers.length} HR Managers`);

      // Get System Admins
      const systemAdmins = await this.getEmployeesWithRoles([SystemRole.SYSTEM_ADMIN]);
      systemAdmins.forEach((emp) => recipients.add(emp._id.toString()));
      this.logger.log(`[notifyChangeRequestApproved] Added ${systemAdmins.length} System Admins`);

      // Get relevant Department Head if applicable
      if (changeRequest.targetDepartmentId) {
        const department = await this.departmentModel.findById(changeRequest.targetDepartmentId).lean();
        if (department?.headPositionId) {
          const headEmployee = await this.getEmployeeInPosition(department.headPositionId.toString());
          if (headEmployee) {
            recipients.add(headEmployee._id.toString());
          }
        }
      }

      // Remove the approver from recipients (they already know they approved it)
      const beforeDelete = recipients.size;
      recipients.delete(approvedBy);
      this.logger.log(`[notifyChangeRequestApproved] Removed approver ${approvedBy}. Recipients: ${beforeDelete} -> ${recipients.size}`);

      // Create notifications
      const message = `Change request approved: ${changeRequest.requestNumber} (${changeRequest.requestType}). The change will be implemented shortly.`;

      this.logger.log(`[notifyChangeRequestApproved] Creating notifications for ${recipients.size} recipients: ${Array.from(recipients).join(', ')}`);
      for (const recipientId of recipients) {
        await this.createNotification(
          new Types.ObjectId(recipientId),
          NotificationType.CHANGE_REQUEST_APPROVED,
          message,
        );
      }

      this.logger.log(`[notifyChangeRequestApproved] Change request approval notifications sent to ${recipients.size} recipients`);
    } catch (error) {
      this.logger.error(`Failed to send change request approval notifications: ${error}`);
    }
  }

  /**
   * Notify requester and stakeholders about change request rejection
   */
  async notifyChangeRequestRejected(
    changeRequest: any,
    rejectedBy: string,
    reason: string,
  ): Promise<void> {
    try {
      this.logger.log(`[notifyChangeRequestRejected] Processing rejection for change request ${changeRequest.requestNumber || changeRequest._id}`);
      this.logger.log(`[notifyChangeRequestRejected] Rejected by: ${rejectedBy}`);
      this.logger.log(`[notifyChangeRequestRejected] RequestedByEmployeeId type: ${typeof changeRequest.requestedByEmployeeId}, value: ${JSON.stringify(changeRequest.requestedByEmployeeId)}`);
      
      const recipients = new Set<string>();

      // Get requester (handle both populated and unpopulated cases)
      const requesterId = this.getEmployeeId(changeRequest.requestedByEmployeeId);
      if (requesterId) {
        recipients.add(requesterId);
        this.logger.log(`[notifyChangeRequestRejected] Added requester: ${requesterId}`);
      } else {
        this.logger.warn(`[notifyChangeRequestRejected] No requester found for change request ${changeRequest.requestNumber}`);
      }

      // Get HR Admins
      const hrAdmins = await this.getEmployeesWithRoles([SystemRole.HR_ADMIN]);
      hrAdmins.forEach((emp) => recipients.add(emp._id.toString()));
      this.logger.log(`[notifyChangeRequestRejected] Added ${hrAdmins.length} HR Admins`);

      // Get HR Managers (they should also be notified)
      const hrManagers = await this.getEmployeesWithRoles([SystemRole.HR_MANAGER]);
      hrManagers.forEach((emp) => recipients.add(emp._id.toString()));
      this.logger.log(`[notifyChangeRequestRejected] Added ${hrManagers.length} HR Managers`);

      // Get System Admins
      const systemAdmins = await this.getEmployeesWithRoles([SystemRole.SYSTEM_ADMIN]);
      systemAdmins.forEach((emp) => recipients.add(emp._id.toString()));
      this.logger.log(`[notifyChangeRequestRejected] Added ${systemAdmins.length} System Admins`);

      // Remove the rejector from recipients (they already know they rejected it)
      const beforeDelete = recipients.size;
      recipients.delete(rejectedBy);
      this.logger.log(`[notifyChangeRequestRejected] Removed rejector ${rejectedBy}. Recipients: ${beforeDelete} -> ${recipients.size}`);

      // Create notifications
      const message = `Change request rejected: ${changeRequest.requestNumber} (${changeRequest.requestType}). Reason: ${reason}`;

      this.logger.log(`[notifyChangeRequestRejected] Creating notifications for ${recipients.size} recipients: ${Array.from(recipients).join(', ')}`);
      for (const recipientId of recipients) {
        await this.createNotification(
          new Types.ObjectId(recipientId),
          NotificationType.CHANGE_REQUEST_REJECTED,
          message,
        );
      }

      this.logger.log(`[notifyChangeRequestRejected] Change request rejection notifications sent to ${recipients.size} recipients`);
    } catch (error) {
      this.logger.error(`Failed to send change request rejection notifications: ${error}`);
    }
  }
}

