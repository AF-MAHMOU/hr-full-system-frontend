import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../employee-profile/models/employee-system-role.schema';
import { SystemRole, EmployeeStatus } from '../employee-profile/enums/employee-profile.enums';
import * as bcrypt from 'bcrypt';

async function fixManagerLogin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const employeeModel = app.get<Model<EmployeeProfileDocument>>(
    getModelToken(EmployeeProfile.name),
  );
  const roleModel = app.get<Model<EmployeeSystemRoleDocument>>(
    getModelToken(EmployeeSystemRole.name),
  );

  const testEmail = 'hrmanager@company.com';
  const testPassword = 'manager123';

  try {
    // Find the user
    const employee = await employeeModel.findOne({
      $or: [
        { personalEmail: testEmail },
        { workEmail: testEmail },
      ],
    });

    if (!employee) {
      console.error('❌ User not found!');
      return;
    }

    console.log('✅ User found!');
    console.log('Current status:', (employee as any).status);
    console.log('Has password:', !!(employee as any).password);

    // Ensure user is ACTIVE
    await employeeModel.findByIdAndUpdate(employee._id, {
      status: EmployeeStatus.ACTIVE,
      password: await bcrypt.hash(testPassword, 10),
    });

    // Ensure roles exist
    let role = await roleModel.findOne({
      employeeProfileId: employee._id,
    });

    if (!role) {
      await roleModel.create({
        employeeProfileId: employee._id,
        roles: [SystemRole.HR_MANAGER, SystemRole.HR_ADMIN],
        isActive: true,
      });
      console.log('✅ Roles created!');
    } else {
      role.roles = [SystemRole.HR_MANAGER, SystemRole.HR_ADMIN];
      role.isActive = true;
      await role.save();
      console.log('✅ Roles updated!');
    }

    console.log('✅ User fixed!');
    console.log('\n📧 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', testEmail);
    console.log('Password: ', testPassword);
    console.log('Status:   ACTIVE');
    console.log('Roles:    HR_MANAGER, HR_ADMIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await app.close();
  }
}

fixManagerLogin();

