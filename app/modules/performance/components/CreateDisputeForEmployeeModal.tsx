/**
 * CreateDisputeForEmployeeModal Component
 * Allows HR employees to create disputes on behalf of employees (REQ-AE-07)
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/shared/components';
import { performanceApi } from '../api/performanceApi';
import type { CreateAppraisalDisputeDto, AppraisalAssignment } from '../types';
import styles from './CreateDisputeForEmployeeModal.module.css';

// Simplified employee interface from assignment data
interface EmployeeInfo {
  _id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  employeeNumber?: string;
  workEmail?: string;
}

interface CreateDisputeForEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDisputeForEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDisputeForEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeInfo | null>(null);
  const [assignments, setAssignments] = useState<AppraisalAssignment[]>([]);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>('');
  const [disputeReason, setDisputeReason] = useState('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [proposedRating, setProposedRating] = useState<number | ''>('');

  // Cache for all employees (fetched once when modal opens)
  const [allEmployeesCache, setAllEmployeesCache] = useState<EmployeeInfo[]>([]);

  // Fetch all employees once when modal opens
  useEffect(() => {
    if (!isOpen) {
      setAllEmployeesCache([]);
      return;
    }

    const fetchAllEmployees = async () => {
      try {
        // Get all cycles first (HR employees can view cycles)
        const cycles = await performanceApi.getCycles();
        
        // Get assignments from all cycles to extract unique employees
        const employeeMap = new Map<string, EmployeeInfo>();
        
        // Fetch assignments for each cycle
        for (const cycle of cycles) {
          try {
            // Skip if cycle doesn't have an ID
            if (!cycle._id) {
              continue;
            }
            // Get assignments for this cycle
            const cycleAssignments = await performanceApi.getCycleAssignments(cycle._id);
            
            cycleAssignments.forEach((assignment: AppraisalAssignment) => {
              const emp = (assignment.employeeProfileId as any);
              
              // Handle both populated and non-populated employeeProfileId
              let empId: string | null = null;
              let firstName = '';
              let middleName = '';
              let lastName = '';
              let employeeNumber = '';
              let workEmail = '';
              
              if (emp) {
                // If populated (object with _id and fields)
                if (emp._id) {
                  empId = emp._id.toString();
                  firstName = emp.firstName || emp.first_name || '';
                  middleName = emp.middleName || emp.middle_name || '';
                  lastName = emp.lastName || emp.last_name || '';
                  employeeNumber = emp.employeeNumber || emp.employee_number || '';
                  workEmail = emp.workEmail || emp.work_email || '';
                } 
                // If just an ObjectId string
                else if (typeof emp === 'string') {
                  empId = emp;
                }
                // If it's an object with just _id
                else if (emp.toString) {
                  empId = emp.toString();
                }
              }
              
              if (empId && !employeeMap.has(empId)) {
                const fullName = `${firstName} ${middleName} ${lastName}`.trim() || 'Unknown Employee';
                
                employeeMap.set(empId, {
                  _id: empId,
                  firstName: firstName || 'Unknown',
                  lastName: lastName || 'Employee',
                  middleName,
                  fullName,
                  employeeNumber,
                  workEmail,
                });
              }
            });
          } catch (err) {
            // Skip cycles that fail (might not have access to all)
            console.warn(`Could not fetch assignments for cycle ${cycle._id}:`, err);
          }
        }

        const allEmployees = Array.from(employeeMap.values());
        setAllEmployeesCache(allEmployees);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setAllEmployeesCache([]);
      }
    };

    fetchAllEmployees();
  }, [isOpen]);

  // Filter employees based on search query (client-side)
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setEmployees([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allEmployeesCache.filter(
      (emp) =>
        emp.fullName?.toLowerCase().includes(query) ||
        emp.firstName?.toLowerCase().includes(query) ||
        emp.lastName?.toLowerCase().includes(query) ||
        emp.employeeNumber?.toLowerCase().includes(query)
    ).slice(0, 10);

    setEmployees(filtered);
  }, [searchQuery, allEmployeesCache]);

  // Fetch assignments when employee is selected
  useEffect(() => {
    if (!isOpen || !selectedEmployee?._id) {
      setAssignments([]);
      setSelectedEvaluationId('');
      return;
    }

    const fetchAssignments = async () => {
      try {
        const data = await performanceApi.getEmployeeAssignments(selectedEmployee._id);
        // Filter to only show assignments with evaluations (SUBMITTED or PUBLISHED)
        const assignmentsWithEvaluations = data.filter(
          (a: AppraisalAssignment) => a.status === 'SUBMITTED' || a.status === 'PUBLISHED'
        );
        setAssignments(assignmentsWithEvaluations);
      } catch (err: any) {
        setError(err.message || 'Failed to load assignments');
        console.error('Error fetching assignments:', err);
      }
    };

    fetchAssignments();
  }, [selectedEmployee, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setSearchQuery('');
      setSelectedEmployee(null);
      setAssignments([]);
      setSelectedEvaluationId('');
      setDisputeReason('');
      setAdditionalComments('');
      setProposedRating('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!disputeReason.trim()) {
      setError('Please provide a reason for disputing this appraisal');
      return;
    }

    if (!selectedEmployee?._id) {
      setError('Please select an employee');
      return;
    }

    if (!selectedEvaluationId) {
      setError('Please select an evaluation to dispute');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const disputeData: CreateAppraisalDisputeDto = {
        evaluationId: selectedEvaluationId,
        disputeReason: disputeReason.trim(),
        additionalComments: additionalComments.trim() || undefined,
        proposedRating: proposedRating ? Number(proposedRating) : undefined,
      };

      await performanceApi.createDispute(selectedEmployee._id, disputeData);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create dispute');
      console.error('Error creating dispute:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Dispute for Employee"
      size="xl"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.infoBox}>
          <p>
            <strong>Note:</strong> As an HR Employee, you can create disputes on behalf of employees 
            when you identify concerns about their appraisal ratings.
          </p>
        </div>

        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="employeeSearch" className={styles.label}>
            Search Employee <span className={styles.required}>*</span>
          </label>
          <Input
            id="employeeSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or employee number..."
            className={styles.searchInput}
          />
          {employees.length > 0 && (
            <div className={styles.dropdown}>
              {employees.map((emp) => (
                <button
                  key={emp._id}
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setSearchQuery(`${emp.firstName} ${emp.lastName}${emp.employeeNumber ? ` (${emp.employeeNumber})` : ''}`);
                    setEmployees([]);
                  }}
                >
                  {emp.fullName}{emp.employeeNumber ? ` - ${emp.employeeNumber}` : ''}
                </button>
              ))}
            </div>
          )}
          {selectedEmployee && (
            <div className={styles.selectedEmployee}>
              Selected: <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong>
            </div>
          )}
        </div>

        {selectedEmployee && assignments.length > 0 && (
          <div className={styles.formGroup}>
            <label htmlFor="evaluation" className={styles.label}>
              Select Evaluation <span className={styles.required}>*</span>
            </label>
            <select
              id="evaluation"
              value={selectedEvaluationId}
              onChange={(e) => setSelectedEvaluationId(e.target.value)}
              className={styles.select}
              required
            >
              <option value="">Select an evaluation...</option>
              {assignments.map((assignment: AppraisalAssignment) => {
                const evalId = (assignment.latestAppraisalId as any)?._id || assignment.latestAppraisalId;
                const cycleName = (assignment.cycleId as any)?.name || 'Unknown Cycle';
                const templateName = (assignment.templateId as any)?.name || 'Unknown Template';
                return (
                  <option key={assignment._id} value={evalId}>
                    {cycleName} - {templateName} ({assignment.status})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {selectedEmployee && assignments.length === 0 && (
          <div className={styles.infoMessage}>
            No completed evaluations found for this employee.
          </div>
        )}

        {selectedEvaluationId && (
          <>
            <div className={styles.formGroup}>
              <label htmlFor="disputeReason" className={styles.label}>
                Reason for Dispute <span className={styles.required}>*</span>
              </label>
              <textarea
                id="disputeReason"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className={styles.textarea}
                rows={4}
                placeholder="Please explain why you are disputing this appraisal rating..."
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="proposedRating" className={styles.label}>
                Proposed Rating (Optional)
              </label>
              <Input
                id="proposedRating"
                type="number"
                value={proposedRating}
                onChange={(e) => setProposedRating(e.target.value ? parseFloat(e.target.value) : '')}
                placeholder="Enter proposed rating"
                min="0"
                step="0.1"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="additionalComments" className={styles.label}>
                Additional Comments (Optional)
              </label>
              <textarea
                id="additionalComments"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                className={styles.textarea}
                rows={3}
                placeholder="Any additional information or context..."
              />
            </div>
          </>
        )}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !disputeReason.trim() || !selectedEmployee || !selectedEvaluationId}
          >
            {loading ? 'Creating...' : 'Create Dispute'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

