import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

// Organization Structure Schemas
import { Department, DepartmentSchema } from './models/department.schema';
import { Position, PositionSchema } from './models/position.schema';
import {
  StructureChangeRequest,
  StructureChangeRequestSchema,
} from './models/structure-change-request.schema';
import {
  StructureApproval,
  StructureApprovalSchema,
} from './models/structure-approval.schema';
import {
  StructureChangeLog,
  StructureChangeLogSchema,
} from './models/structure-change-log.schema';
import {
  PositionAssignment,
  PositionAssignmentSchema,
} from './models/position-assignment.schema';

// Notification and Employee Schemas
import {
  NotificationLog,
  NotificationLogSchema,
} from '../time-management/models/notification-log.schema';
import {
  EmployeeProfile,
  EmployeeProfileSchema,
} from '../employee-profile/models/employee-profile.schema';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleSchema,
} from '../employee-profile/models/employee-system-role.schema';

// Controllers
import { OrganizationStructureController } from './organization-structure.controller';

// Services
import { OrganizationStructureService } from './organization-structure.service';
import { OrganizationNotificationService } from './services/notification.service';

@Module({
  imports: [
    AuthModule, // Import AuthModule to use JwtAuthGuard and RolesGuard
    MongooseModule.forFeature([
      // Organization Structure schemas
      { name: Department.name, schema: DepartmentSchema },
      { name: Position.name, schema: PositionSchema },
      {
        name: StructureChangeRequest.name,
        schema: StructureChangeRequestSchema,
      },
      { name: StructureApproval.name, schema: StructureApprovalSchema },
      { name: StructureChangeLog.name, schema: StructureChangeLogSchema },
      { name: PositionAssignment.name, schema: PositionAssignmentSchema },
      // Notification and Employee schemas
      { name: NotificationLog.name, schema: NotificationLogSchema },
      { name: EmployeeProfile.name, schema: EmployeeProfileSchema },
      { name: EmployeeSystemRole.name, schema: EmployeeSystemRoleSchema },
    ]),
  ],
  controllers: [OrganizationStructureController],
  providers: [OrganizationStructureService, OrganizationNotificationService],
  exports: [OrganizationStructureService],
})
export class OrganizationStructureModule {}
