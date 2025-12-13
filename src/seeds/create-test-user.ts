import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../employee-profile/models/employee-system-role.schema';
import { SystemRole, EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
import * as bcrypt from 'bcrypt';

async function createTestUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const employeeModel = app.get<Model<EmployeeProfileDocument>>(
    getModelToken(EmployeeProfile.name),
  );
  const roleModel = app.get<Model<EmployeeSystemRoleDocument>>(
    getModelToken(EmployeeSystemRole.name),
  );

  const testEmail = 'hrmanager@company.com';
  const testPassword = 'hrmanager123';
  const testNationalId = '98765432109876';

  try {
    // Check if user already exists
    const existingEmployee = await employeeModel.findOne({
      $or: [
        { personalEmail: testEmail },
        { workEmail: testEmail },
        { nationalId: testNationalId },
      ],
    });

    if (existingEmployee) {
      console.log('⚠️  Test user already exists!');
      console.log('Email:', testEmail);
      console.log('Password:', testPassword);
      
      // Check if role exists
      const existingRole = await roleModel.findOne({
        employeeProfileId: existingEmployee._id,
      });

      if (!existingRole) {
        // Create role for existing employee
        await roleModel.create({
          employeeProfileId: existingEmployee._id,
          roles: [SystemRole.HR_MANAGER, SystemRole.HR_ADMIN],
          isActive: true,
        });
        console.log('✅ HR Manager role assigned to existing employee!');
      } else {
        // Update role if needed
        if (!existingRole.roles.includes(SystemRole.HR_MANAGER)) {
          existingRole.roles.push(SystemRole.HR_MANAGER);
        }
        if (!existingRole.roles.includes(SystemRole.HR_ADMIN)) {
          existingRole.roles.push(SystemRole.HR_ADMIN);
        }
        await existingRole.save();
        console.log('✅ HR Manager roles updated!');
      }
    } else {
      // Create new test employee
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      const testEmployee = await employeeModel.create({
        firstName: 'HR',
        lastName: 'Manager',
        fullName: 'HR Manager',
        nationalId: testNationalId,
        personalEmail: testEmail,
        workEmail: testEmail,
        password: hashedPassword,
        gender: 'FEMALE',
        maritalStatus: 'SINGLE',
        status: EmployeeStatus.ACTIVE,
        dateOfHire: new Date(),
        employeeNumber: 'HRMGR001',
      });

      // Create HR Manager role
      await roleModel.create({
        employeeProfileId: testEmployee._id,
        roles: [SystemRole.HR_MANAGER, SystemRole.HR_ADMIN],
        isActive: true,
      });

      console.log('✅ Test user created successfully!');
    }

    console.log('\n📧 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', testEmail);
    console.log('Password: ', testPassword);
    console.log('Roles:    HR Manager, HR Admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await app.close();
  }
}

createTestUser();

