import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../employee-profile/models/employee-system-role.schema';
import { SystemRole, EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
import * as bcrypt from 'bcrypt';

async function createAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const employeeModel = app.get<Model<EmployeeProfileDocument>>(
    getModelToken(EmployeeProfile.name),
  );
  const roleModel = app.get<Model<EmployeeSystemRoleDocument>>(
    getModelToken(EmployeeSystemRole.name),
  );

  const adminEmail = 'admin@company.com';
  const adminPassword = 'admin123';
  const adminNationalId = '12345678901234';

  try {
    // Check if admin already exists
    const existingEmployee = await employeeModel.findOne({
      $or: [
        { personalEmail: adminEmail },
        { workEmail: adminEmail },
        { nationalId: adminNationalId },
      ],
    });

    if (existingEmployee) {
      console.log('Admin user already exists!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      
      // Check if role exists
      const existingRole = await roleModel.findOne({
        employeeProfileId: existingEmployee._id,
      });

      if (!existingRole) {
        // Create role for existing employee
        await roleModel.create({
          employeeProfileId: existingEmployee._id,
          roles: [SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN],
          isActive: true,
        });
        console.log('✅ Admin role assigned to existing employee!');
      } else {
        // Update role if needed
        if (!existingRole.roles.includes(SystemRole.SYSTEM_ADMIN)) {
          existingRole.roles.push(SystemRole.SYSTEM_ADMIN);
        }
        if (!existingRole.roles.includes(SystemRole.HR_ADMIN)) {
          existingRole.roles.push(SystemRole.HR_ADMIN);
        }
        await existingRole.save();
        console.log('✅ Admin roles updated!');
      }
    } else {
      // Create new admin employee
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const adminEmployee = await employeeModel.create({
        firstName: 'System',
        lastName: 'Admin',
        fullName: 'System Admin',
        nationalId: adminNationalId,
        personalEmail: adminEmail,
        workEmail: adminEmail,
        password: hashedPassword,
        gender: 'MALE',
        maritalStatus: 'SINGLE',
        status: EmployeeStatus.ACTIVE,
        dateOfHire: new Date(),
        employeeNumber: 'ADMIN001',
      });

      // Create admin role
      await roleModel.create({
        employeeProfileId: adminEmployee._id,
        roles: [SystemRole.SYSTEM_ADMIN, SystemRole.HR_ADMIN],
        isActive: true,
      });

      console.log('✅ Admin user created successfully!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
    }

    console.log('\n📧 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', adminEmail);
    console.log('Password: ', adminPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await app.close();
  }
}

createAdmin();

