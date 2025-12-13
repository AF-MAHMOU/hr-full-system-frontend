import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../employee-profile/models/employee-system-role.schema';
import { SystemRole } from '../employee-profile/enums/employee-profile.enums';
import { RegisterDto } from '../auth/dto/register.dto';

async function createTestUsers() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const authService = app.get(AuthService);
  const roleModel = app.get<Model<EmployeeSystemRoleDocument>>(
    getModelToken('EmployeeSystemRole'),
  );

  const { EmployeeProfile } = await import('../employee-profile/models/employee-profile.schema');
  const employeeModel = app.get<Model<any>>(
    getModelToken(EmployeeProfile.name),
  );

  // User 1: HR Admin (for creating departments)
  const adminEmail = 'hradmin@company.com';
  const adminPassword = 'admin123';
  const adminNationalId = '11111111111111';

  // User 2: HR Manager (for receiving notifications)
  const managerEmail = 'hrmanager@company.com';
  const managerPassword = 'manager123';
  const managerNationalId = '22222222222222';

  try {
    // Create HR Admin
    try {
      const adminDto: RegisterDto = {
        email: adminEmail,
        password: adminPassword,
        firstName: 'HR',
        lastName: 'Admin',
        nationalId: adminNationalId,
        userType: 'employee',
        gender: 'MALE',
        dateOfHire: new Date().toISOString(),
        workEmail: adminEmail,
        status: 'ACTIVE',
      };

      await authService.register(adminDto);
      console.log('✅ HR Admin registered!');
    } catch (error: any) {
      if (error.message && error.message.includes('already exists')) {
        console.log('⚠️  HR Admin already exists');
      } else {
        throw error;
      }
    }

    // Create HR Manager
    try {
      const managerDto: RegisterDto = {
        email: managerEmail,
        password: managerPassword,
        firstName: 'HR',
        lastName: 'Manager',
        nationalId: managerNationalId,
        userType: 'employee',
        gender: 'FEMALE',
        dateOfHire: new Date().toISOString(),
        workEmail: managerEmail,
        status: 'ACTIVE',
      };

      await authService.register(managerDto);
      console.log('✅ HR Manager registered!');
    } catch (error: any) {
      if (error.message && error.message.includes('already exists')) {
        console.log('⚠️  HR Manager already exists');
      } else {
        throw error;
      }
    }

    // Assign roles
    const adminEmployee = await employeeModel.findOne({
      $or: [
        { personalEmail: adminEmail },
        { workEmail: adminEmail },
      ],
    });

    if (adminEmployee) {
      let adminRole = await roleModel.findOne({
        employeeProfileId: adminEmployee._id,
      });

      if (!adminRole) {
        await roleModel.create({
          employeeProfileId: adminEmployee._id,
          roles: [SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN],
          isActive: true,
        });
        console.log('✅ HR Admin roles assigned!');
      } else {
        if (!adminRole.roles.includes(SystemRole.HR_ADMIN)) {
          adminRole.roles.push(SystemRole.HR_ADMIN);
        }
        if (!adminRole.roles.includes(SystemRole.SYSTEM_ADMIN)) {
          adminRole.roles.push(SystemRole.SYSTEM_ADMIN);
        }
        await adminRole.save();
        console.log('✅ HR Admin roles updated!');
      }
    }

    const managerEmployee = await employeeModel.findOne({
      $or: [
        { personalEmail: managerEmail },
        { workEmail: managerEmail },
      ],
    });

    if (managerEmployee) {
      let managerRole = await roleModel.findOne({
        employeeProfileId: managerEmployee._id,
      });

      if (!managerRole) {
        await roleModel.create({
          employeeProfileId: managerEmployee._id,
          roles: [SystemRole.HR_MANAGER, SystemRole.HR_ADMIN],
          isActive: true,
        });
        console.log('✅ HR Manager roles assigned!');
      } else {
        if (!managerRole.roles.includes(SystemRole.HR_MANAGER)) {
          managerRole.roles.push(SystemRole.HR_MANAGER);
        }
        if (!managerRole.roles.includes(SystemRole.HR_ADMIN)) {
          managerRole.roles.push(SystemRole.HR_ADMIN);
        }
        await managerRole.save();
        console.log('✅ HR Manager roles updated!');
      }
    }

    console.log('\n📧 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━Id: 693d65080f7e2dcf3a7ce97d
    Notifications: 2
      - position_created: New position created: fgggfv (CFFFE) in your department.
      - department_created: New department created: gfgffgbv (GFGFGG)


👥 Checking HR Admins...

HR Admins found: 2
  - System Admin (admin@company.com)
    ID: 693d5c241c49c021de5038dd
    Notifications: 3
      - position_created: New position created: fgggfv (CFFFE) in your department.
      - department_created: New department created: gfgffgbv (GFGFGG)
      - department_created: New department created: vjfrknfvreverf (LEADERS)

  - HR Manager (hrmanager@company.com)
    ID: 693d65080f7e2dcf3a7ce97d
    Notifications: 2
      - position_created: New position created: fgggfv (CFFFE) in your department.
      - department_created: New department created: gfgffgbv (GFGFGG)


```

The check shows notifications exist for the HR Manager. The issue might be a userId format mismatch. Creating fresh test users with proper credentials:
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
search_replace
