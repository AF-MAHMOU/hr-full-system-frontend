/**
 * Organization Structure API functions
 * Handles all API calls for organization structure module
 */

import { apiClient } from '@/shared/utils/api';
import { API_ENDPOINTS } from '@/shared/constants';
import type {
  CreateDepartmentDto,
  CreateDepartmentResponse,
  UpdateDepartmentDto,
  UpdateDepartmentResponse,
  DeleteDepartmentResponse,
  CreatePositionDto,
  CreatePositionResponse,
  UpdatePositionDto,
  UpdatePositionResponse,
  DeletePositionResponse,
  Department,
  Position,
} from '../types';

/**
 * Create a new department
 */
export async function createDepartment(
  data: CreateDepartmentDto
): Promise<CreateDepartmentResponse> {
  const response = await apiClient.post<CreateDepartmentResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments`,
    data
  );
  return response.data;
}

/**
 * Get all departments
 */
export async function getDepartments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  data: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments`,
    { params }
  );
  return response.data;
}

/**
 * Get department by ID
 */
export async function getDepartmentById(id: string): Promise<{
  success: boolean;
  message: string;
  data: Department;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments/${id}`
  );
  return response.data;
}

/**
 * Get position by ID
 */
export async function getPositionById(id: string): Promise<{
  success: boolean;
  message: string;
  data: Position;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/${id}`
  );
  return response.data;
}

/**
 * Update a department
 */
export async function updateDepartment(
  id: string,
  data: UpdateDepartmentDto
): Promise<UpdateDepartmentResponse> {
  const response = await apiClient.put<UpdateDepartmentResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments/${id}`,
    data
  );
  return response.data;
}

/**
 * Get positions by department ID
 */
export async function getPositionsByDepartment(departmentId: string): Promise<{
  success: boolean;
  message: string;
  data: Position[];
  count: number;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/department/${departmentId}`
  );
  return response.data;
}

/**
 * Create a new position
 */
export async function createPosition(
  data: CreatePositionDto
): Promise<CreatePositionResponse> {
  const response = await apiClient.post<CreatePositionResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions`,
    data
  );
  return response.data;
}

/**
 * Get all positions
 */
export async function getPositions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  isActive?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  data: Position[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions`,
    { params }
  );
  return response.data;
}

/**
 * Update a position
 */
export async function updatePosition(
  id: string,
  data: UpdatePositionDto
): Promise<UpdatePositionResponse> {
  const response = await apiClient.put<UpdatePositionResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/${id}`,
    data
  );
  return response.data;
}

/**
 * Delete (deactivate) a position
 */
export async function deletePosition(
  id: string
): Promise<DeletePositionResponse> {
  const response = await apiClient.delete<DeletePositionResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/${id}`
  );
  return response.data;
}

/**
 * Delete (deactivate) a department
 */
export async function deleteDepartment(
  id: string
): Promise<DeleteDepartmentResponse> {
  const response = await apiClient.delete<DeleteDepartmentResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments/${id}`
  );
  return response.data;
}

/**
 * Assign department head position
 */
export async function assignDepartmentHead(
  departmentId: string,
  headPositionId: string | null
): Promise<UpdateDepartmentResponse> {
  const response = await apiClient.put<UpdateDepartmentResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/departments/${departmentId}/head`,
    { headPositionId }
  );
  return response.data;
}

/**
 * Assign reporting position
 */
export async function assignReportingPosition(
  positionId: string,
  reportsToPositionId: string | null
): Promise<UpdatePositionResponse> {
  const response = await apiClient.put<UpdatePositionResponse>(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/${positionId}/reporting-position`,
    { reportsToPositionId }
  );
  return response.data;
}

/**
 * Get position hierarchy
 */
export async function getPositionHierarchy(positionId?: string): Promise<{
  success: boolean;
  message: string;
  data: any[];
}> {
  const response = await apiClient.get(
    `${API_ENDPOINTS.ORGANIZATION_STRUCTURE}/positions/hierarchy`,
    { params: positionId ? { positionId } : {} }
  );
  return response.data;
}

