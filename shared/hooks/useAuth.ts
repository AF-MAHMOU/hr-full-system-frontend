/**
 * Authentication hook
 * Integrates with backend cookie-based JWT authentication
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants';
import type { AuthUser, LoginDto, RegisterDto, ChangePasswordDto, LoginResponse, RegisterResponse, ChangePasswordResponse, ApiErrorResponse } from '../types/auth';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user from /auth/me
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await apiClient.get<AuthUser>(API_ENDPOINTS.AUTH.ME);
      setUser(response.data);
      setError(null);
      return response.data;
    } catch (err: any) {
      // 401 means not authenticated, which is fine
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'Failed to fetch user');
      }
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication on mount
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (loginDto: LoginDto): Promise<LoginResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        loginDto
      );
      
      // Backend sets httpOnly cookie, we just store user data
      setUser(response.data.user);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerDto: RegisterDto): Promise<RegisterResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.post<RegisterResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        registerDto
      );
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', err);
    } finally {
      setUser(null);
      setError(null);
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const changePassword = async (changePasswordDto: ChangePasswordDto): Promise<ChangePasswordResponse> => {
    try {
      setError(null);
      const response = await apiClient.post<ChangePasswordResponse>(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        changePasswordDto
      );
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const refreshUser = async (): Promise<void> => {
    await fetchCurrentUser();
  };

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    changePassword,
    refreshUser,
  };
};

