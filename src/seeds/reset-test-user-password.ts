import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import * as bcrypt from 'bcrypt';

async function resetTestUserPassword() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const employeeModel = app.get<Model<EmployeeProfileDocument>>(
    getModelToken(EmployeeProfile.name),
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

    // Hash the password properly
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    // Update the password
    await employeeModel.findByIdAndUpdate(employee._id, {
      password: hashedPassword,
    });

    console.log('✅ Password reset successfully!');
    console.log('\n📧 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', testEmail);
    console.log('Password: ', testPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error resetting password:', error);
  } finally {
    await app.close();
  }
}

resetTestUserPassword();

