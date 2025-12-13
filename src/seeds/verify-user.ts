import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from '../employee-profile/models/employee-profile.schema';
import * as bcrypt from 'bcrypt';

async function verifyUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const employeeModel = app.get<Model<EmployeeProfileDocument>>(
    getModelToken(EmployeeProfile.name),
  );

  const testEmail = 'hrmanager@company.com';
  const testPassword = 'manager123';

  try {
    // Find the user - check all possible email fields
    const employee = await employeeModel.findOne({
      $or: [
        { personalEmail: testEmail },
        { workEmail: testEmail },
        { personalEmail: testEmail.toLowerCase() },
        { workEmail: testEmail.toLowerCase() },
      ],
    }).lean();

    if (!employee) {
      console.error('❌ User not found!');
      console.log('Searching for users with similar emails...');
      const similarUsers = await employeeModel.find({
        $or: [
          { personalEmail: { $regex: 'manager', $options: 'i' } },
          { workEmail: { $regex: 'manager', $options: 'i' } },
        ],
      }).select('personalEmail workEmail fullName').lean();
      console.log('Similar users:', similarUsers);
    } else {
      console.log('✅ User found!');
      console.log('Email:', (employee as any).personalEmail || (employee as any).workEmail);
      console.log('Full Name:', (employee as any).fullName);
      console.log('ID:', employee._id);
      console.log('Has password:', !!(employee as any).password);
      
      // Test password
      if ((employee as any).password) {
        const isValid = await bcrypt.compare(testPassword, (employee as any).password);
        console.log('Password match:', isValid);
        if (!isValid) {
          console.log('⚠️  Password does not match! Resetting...');
          const hashedPassword = await bcrypt.hash(testPassword, 10);
          await employeeModel.findByIdAndUpdate(employee._id, {
            password: hashedPassword,
          });
          console.log('✅ Password reset!');
        }
      } else {
        console.log('⚠️  No password set! Setting password...');
        const hashedPassword = await bcrypt.hash(testPassword, 10);
        await employeeModel.findByIdAndUpdate(employee._id, {
          password: hashedPassword,
        });
        console.log('✅ Password set!');
      }
    }

    console.log('\n📧 Final Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', testEmail);
    console.log('Password: ', testPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await app.close();
  }
}

verifyUser();

