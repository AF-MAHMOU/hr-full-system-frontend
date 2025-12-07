'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthNoCheck } from '@/shared/hooks/useAuthNoCheck';
import { Button, Input, Card } from '@/shared/components';
import type { LoginDto } from '@/shared/types/auth';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  // useAuthNoCheck: checks if already logged in and redirects if so
  // If not logged in, allows login. On success, redirects to home.
  const { login, isLoading, isCheckingAuth, error } = useAuthNoCheck();
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Don't render the page at all if we're still checking auth status
  // This prevents the flash of login page before redirect
  if (isCheckingAuth) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormError(null);

  // validation omitted for brevity

  try {
    const result = await login(formData); // assuming result contains token
    console.log('Login successful:', result);

    // ✅ Store token in localStorage
    if (result.token) {
      localStorage.setItem('token', result.token);
    } else {
      console.error('No token returned from API');
      setFormError('Login failed: no token returned');
      return;
    }

    // Redirect handled by useAuthNoCheck
  } catch (err: any) {
    console.error('Login error:', err);
    setFormError(err.message || 'Login failed. Please check your credentials.');
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user types
    if (formError) setFormError(null);
  };

  return (
    <div className={styles.loginContainer}>
      <Card padding="lg" shadow="warm" className={styles.loginCard}>
        <div className={styles.header}>
          <h1>HR Management System</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {(error || formError) && (
            <div className={styles.errorMessage} role="alert">
              <strong>Error:</strong> {error || formError}
            </div>
          )}

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="email"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className={styles.footer}>
          <p>
            Don't have an account?{' '}
            <a href="/register" className={styles.link}>
              Register here
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}

