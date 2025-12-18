// ReviewAttendanceCorrectionForm.tsx
"use client";

import { useEffect, useState } from "react";
import s from "../../page.module.css";
import { AttendanceCorrectionRequest, CorrectionRequestStatus } from "../../types";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/shared/hooks"; // Import auth if you need user info
import { getAttendanceCorrection, updateAttendanceCorrection } from "../../api";

interface ReviewCorrectionFormProps {
  onUpdated?: () => void;
}

interface AttendanceCorrectionAPIResponse {
  id: string;
  employeeId: string;
  attendanceRecord: any;
  reason?: string;
  status: CorrectionRequestStatus;
}

export default function ReviewAttendanceCorrectionForm({
  onUpdated,
}: ReviewCorrectionFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth(); // If you need to track who reviewed
  const requestId = searchParams.get('id');

  const [attendanceCorrectionRequest, setAttendanceCorrectionRequest] = useState<AttendanceCorrectionAPIResponse | null>(null);
  const [status, setStatus] = useState<CorrectionRequestStatus | "">("");
  const [reviewerComment, setReviewerComment] = useState(""); // Optional: Add comments
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the request data when component mounts
  useEffect(() => {
    if (requestId) {
      fetchAttendanceCorrectionRequest(requestId);
    } else {
      setError("No request ID provided");
      setFetching(false);
    }
  }, [requestId]);

  const fetchAttendanceCorrectionRequest = async (id: string) => {
    setFetching(true);
    setError(null);
    try {
      const data = await getAttendanceCorrection(id);
      if (data) {
        setAttendanceCorrectionRequest(data);
        setStatus(data.status);
      } else {
        setError("Request not found");
      }
    } catch (error) {
      console.error("Failed to fetch request:", error);
      setError("Failed to load request. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestId || !status) return;

    setLoading(true);
    setError(null);

    try {
      // Prepare update payload
      const updatePayload = {
        status,
        // Add reviewer information if needed
        reviewedBy: user?.userid,
        reviewerComment: reviewerComment || undefined,
        reviewedAt: new Date().toISOString(),
      };

      // Update the request
      const result = await updateAttendanceCorrection(requestId, updatePayload);

      if (result) {
        // Refresh the request data
        await fetchAttendanceCorrectionRequest(requestId);

        // Show success message or redirect
        alert("Request updated successfully!");

        // Call the callback if provided
        if (onUpdated) {
          onUpdated();
        }

        // Optionally redirect back to list
        // router.push("/modules/time-management/attendance-correction");
      } else {
        setError("Failed to update request. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update request:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/modules/time-management/attendance-correction");
  };

  if (fetching) {
    return (
      <div className={s.buttonCollection}>
        <div className={s.loading}>Loading request details...</div>
      </div>
    );
  }

  if (error || !attendanceCorrectionRequest) {
    return (
      <div className={s.buttonCollection}>
        <div>{error || "Request not found"}</div>
        <button className={s.button} onClick={handleBack}>
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className={s.container}>
      <div>
        <button className={s.button} onClick={handleBack}>
          ← Back
        </button>
        <h2 className={s.header}>Review Attendance Correction Request</h2>
      </div>

      <div className={s.description}>
        <div className={s.detailRow}>
          <span className={s.detailLabel}>Request ID:</span>
          <span className={s.detailValue}>{attendanceCorrectionRequest.id}</span>
        </div>

        <div className={s.detailRow}>
          <span className={s.detailLabel}>Employee ID:</span>
          <span className={s.detailValue}>{attendanceCorrectionRequest.employeeId}</span>
        </div>

        {attendanceCorrectionRequest.reason && (
          <div className={s.detailRow}>
            <span className={s.detailLabel}>Reason for Correction:</span>
            <span className={s.detailValue}>{attendanceCorrectionRequest.reason}</span>
          </div>
        )}

        <div className={s.detailRow}>
          <span className={s.detailLabel}>Current Status:</span>
          <span className={`${s.statusBadge} ${s[attendanceCorrectionRequest.status.toLowerCase()]}`}>
            {attendanceCorrectionRequest.status.replace("_", " ")}
          </span>
        </div>

        {/* Display attendance record details if available */}
        {attendanceCorrectionRequest.attendanceRecord && (
          <div className={s.attendanceSection}>
            <h3>Attendance Record Details</h3>
            {/* Render attendance record details based on your data structure */}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={s.form}>
        <div className={s.formSection}>
          <h3 className={s.header2}>Update Request Status</h3>

          <div className={s.field}>
            <label className={s.label}>Status *</label>
            <select
              className={s.select}
              value={status}
              onChange={(e) => setStatus(e.target.value as CorrectionRequestStatus)}
              required
              disabled={loading}
            >
              <option value="" disabled>Select new status</option>
              {Object.values(CorrectionRequestStatus)
                .filter(statusValue => !['SUBMITTED', 'IN_REVIEW', 'ESCALATED'].includes(statusValue))
                .map((statusValue) => (
                  <option key={statusValue} value={statusValue}>
                    {statusValue.replace("_", " ")}
                  </option>
                ))}
            </select>
          </div>

          {error && <div className={s.error}>{error}</div>}

          <div className={s.buttonGroup}>
            <button
              type="button"
              className={`${s.button} ${s.secondary}`}
              onClick={handleBack}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={s.button}
              disabled={loading || !status}
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}