import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';

async function testLogin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const authService = app.get(AuthService);

  const loginDto: LoginDto = {
    email: 'hrmanager@company.com',
    password: 'manager123',
  };

  try {
    console.log('Testing login...');
    const result = await authService.signIn(loginDto);
    console.log('✅ Login successful!');
    console.log('User ID:', result.payload.userid);
    console.log('Email:', result.payload.email);
    console.log('Roles:', result.payload.roles);
    console.log('User Type:', result.payload.userType);
  } catch (error: any) {
    console.error('❌ Login failed!');
    console.error('Error:', error.message);
    console.error('Status:', error.status);
    console.error('Full error:', error);
  } finally {
    await app.close();
  }
}

testLogin();

