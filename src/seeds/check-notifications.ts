import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationLog, NotificationLogDocument } from '../time-management/models/notification-log.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../employee-profile/models/employee-system-role.schema';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';

async function checkNotifications() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const notificationModel = app.get<Model<NotificationLogDocument>>(
    getModelToken(NotificationLog.name),
  );
  const employeeModel = app.get<Model<EmployeeProfileDocument>>(
    getModelToken(EmployeeProfile.name),
  );
  const roleModel = app.get<Model<EmployeeSystemRoleDocument>>(
    getModelToken(EmployeeSystemRole.name),
  );

  try {
    console.log('\n📊 Checking Notifications...\n');

    // Get all notifications
    const allNotifications = await notificationModel.find({}).lean();
    console.log(`Total notifications in database: ${allNotifications.length}\n`);

    if (allNotifications.length > 0) {
      console.log('Recent notifications:');
      allNotifications.slice(0, 5).forEach((notif: any) => {
        console.log(`  - ${notif.type}: ${notif.message}`);
        console.log(`    To: ${notif.to}`);
        console.log(`    Created: ${notif.createdAt}`);
        console.log(`    Read: ${notif.read || false}\n`);
      });
    }

    // Check HR Managers
    console.log('\n👥 Checking HR Managers...\n');
    const hrManagerRoles = await roleModel.find({
      roles: { $in: [SystemRole.HR_MANAGER] },
      isActive: true,
    }).lean();

    console.log(`HR Managers found: ${hrManagerRoles.length}`);
    
    for (const roleRecord of hrManagerRoles) {
      const employee = await employeeModel.findById(roleRecord.employeeProfileId).lean();
      if (employee) {
        console.log(`  - ${(employee as any).fullName} (${(employee as any).personalEmail || (employee as any).workEmail})`);
        console.log(`    ID: ${employee._id}`);
        
        // Check notifications for this employee
        const employeeNotifications = await notificationModel.find({
          to: employee._id,
        }).lean();
        console.log(`    Notifications: ${employeeNotifications.length}`);
        if (employeeNotifications.length > 0) {
          employeeNotifications.forEach((notif: any) => {
            console.log(`      - ${notif.type}: ${notif.message}`);
          });
        }
        console.log('');
      }
    }

    // Check HR Admins
    console.log('\n👥 Checking HR Admins...\n');
    const hrAdminRoles = await roleModel.find({
      roles: { $in: [SystemRole.HR_ADMIN] },
      isActive: true,
    }).lean();

    console.log(`HR Admins found: ${hrAdminRoles.length}`);
    
    for (const roleRecord of hrAdminRoles) {
      const employee = await employeeModel.findById(roleRecord.employeeProfileId).lean();
      if (employee) {
        console.log(`  - ${(employee as any).fullName} (${(employee as any).personalEmail || (employee as any).workEmail})`);
        console.log(`    ID: ${employee._id}`);
        
        // Check notifications for this employee
        const employeeNotifications = await notificationModel.find({
          to: employee._id,
        }).lean();
        console.log(`    Notifications: ${employeeNotifications.length}`);
        if (employeeNotifications.length > 0) {
          employeeNotifications.forEach((notif: any) => {
            console.log(`      - ${notif.type}: ${notif.message}`);
          });
        }
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error checking notifications:', error);
  } finally {
    await app.close();
  }
}

checkNotifications();

