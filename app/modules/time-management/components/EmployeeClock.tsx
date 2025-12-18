"use client";  // This tells Next.js that this component is a Client Component

import { useEffect, useState } from "react";
import { useAuth } from "@/shared/hooks";
import { useRouter } from "next/navigation";
import { addPunchToAttendance, createAttendanceRecord, getAllAttendanceRecord, getAllHolidays, getAllShiftAssignmentsByDepartment, getAllShiftAssignmentsByEmployee, getAllShiftAssignmentsByPosition } from "../api/index";
import s from "../page.module.css";
import { PunchType } from "../types";
import * as XLSX from "xlsx";
import { getAllEmployees } from "../../hr/api/hrApi";

export default function EmployeeClock() {
  const { user } = useAuth();
  const [punchType, setPunchType] = useState<PunchType>(PunchType.IN);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const router = useRouter(); // This is the router hook for navigation.

  // Handle manual punch for clocking in/out 
  const handlePunch = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (!user?.userid) {
        router.push("/login");
        return;
      }

      const today = new Date();

      // Helper: strip time portion for date-only comparison
      const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const todayOnly = toDateOnly(today).getTime();

      try {
        const [
          allEmployees,
          employeeAssignments,
          departmentAssignments,
          positionAssignments,
          holidays
        ] = await Promise.all([
          getAllEmployees(),
          getAllShiftAssignmentsByEmployee(),
          getAllShiftAssignmentsByDepartment(),
          getAllShiftAssignmentsByPosition(),
          getAllHolidays()
        ]);

        const currentUserProfile = allEmployees.find((e: any) => e._id === user.userid);

        // Helper to compare IDs safely
        const getIdsMatch = (id1: any, id2: any) => {
          if (!id1 || !id2) return false;
          const s1 = (typeof id1 === 'object' && id1?._id) ? id1._id : id1;
          const s2 = (typeof id2 === 'object' && id2?._id) ? id2._id : id2;
          return String(s1) === String(s2);
        };

        const isAssignmentActive = (a: any) => {
          if (!a || (a.status !== 'APPROVED' && a.status !== 'PENDING')) return false;
          const start = toDateOnly(new Date(a.startDate)).getTime();
          const end = a.endDate ? toDateOnly(new Date(a.endDate)).getTime() : new Date(8640000000000000).getTime();
          return todayOnly >= start && todayOnly <= end;
        };

        let activeAssignment = null;

        // 1. Direct Employee Assignment
        activeAssignment = employeeAssignments.find((a: any) =>
          getIdsMatch(a.employeeId, user.userid) && isAssignmentActive(a)
        );

        // 2. Department Assignment
        if (!activeAssignment && currentUserProfile?.primaryDepartmentId) {
          activeAssignment = departmentAssignments.find((a: any) =>
            getIdsMatch(a.departmentId, currentUserProfile.primaryDepartmentId) && isAssignmentActive(a)
          );
        }

        // 3. Position Assignment
        if (!activeAssignment && currentUserProfile?.primaryPositionId) {
          activeAssignment = positionAssignments.find((a: any) =>
            getIdsMatch(a.positionId, currentUserProfile.primaryPositionId) && isAssignmentActive(a)
          );
        }

        if (!activeAssignment) {
          setMessage("No shift assignment found for today; contact your manager if this is an error.");
          setLoading(false);
          return;
        }

        // Check Holidays
        const isHoliday = holidays.some((h: any) => {
          if (!h || !h.active) return false;
          const start = toDateOnly(new Date(h.startDate)).getTime();
          const end = h.endDate ? toDateOnly(new Date(h.endDate)).getTime() : toDateOnly(new Date(h.startDate)).getTime();
          return todayOnly >= start && todayOnly <= end;
        });

        if (isHoliday) {
          setMessage("It is a holiday... take a rest ya basha");
          setLoading(false);
          return;
        }

      } catch (err: any) {
        console.error('Failed to validate shift/holiday:', err);
        setMessage("Error validating information: " + (err.message || "Unknown error"));
        setLoading(false);
        return;
      }

      const all = await getAllAttendanceRecord();
      const todayStr = today.toDateString();

      const existingRecord = all.find(record =>
        record.employeeId === user.userid &&
        record.punches?.some(p =>
          new Date(p.time).toDateString() === todayStr
        )
      );


      const punch = {
        type: punchType,
        time: new Date(),
      };

      if (existingRecord) {
        // PATCH :D
        await addPunchToAttendance(existingRecord.id, punch);
        setMessage(`Punch ${punchType} recorded successfully at ${new Date().toLocaleTimeString()}`);
      } else {
        // CREATE new record
        await createAttendanceRecord({
          employeeId: user.userid,
          punches: [punch],
          finalisedForPayroll: true,
        });
        setMessage(`Attendance record created with ${punchType} punch at ${new Date().toLocaleTimeString()}`);
      }

      setPunchType(punchType === PunchType.IN ? PunchType.OUT : PunchType.IN);

    } catch (error: any) {
      setMessage(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };


  // Handle file upload for bulk import from Excel 
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportResults(null);
    setMessage("");

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

      // Prepare import results and error tracking 
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNum = i + 2;
        try {
          const punchTypeStr = row.punchType?.toString().toUpperCase() || row.PunchType?.toString().toUpperCase();

          if (!punchTypeStr || (punchTypeStr !== "IN" && punchTypeStr !== "OUT")) {
            errors.push(`Row ${rowNum}: Invalid punch type (must be IN or OUT)`);
            failedCount++;
            continue;
          }

          const time =
            row.timestamp
              ? new Date(row.timestamp)
              : row.Time
                ? new Date(row.Time)
                : new Date();

          const punches = [
            {
              type: punchTypeStr as PunchType,
              time,
            },
          ];


          if (!user?.userid) {
            router.push("/login");
            throw new Error("User ID not found");
          }

          await createAttendanceRecord({
            employeeId: user?.userid,
            punches,
            finalisedForPayroll: true,
          });

          successCount++;
        } catch (error: any) {
          failedCount++;
          const errorMsg = error.response?.data?.message || error.message || "Failed to process";
          errors.push(`Row ${rowNum}: ${errorMsg}`);
        }
      }

      setImportResults({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10), // Show first 10 errors 
      });

      // Display results based on the import outcome 
      if (successCount > 0) {
        setMessage(`Import completed: ${successCount} records processed successfully`);
      } else if (failedCount > 0) {
        setMessage(`Import failed: All ${failedCount} records had errors`);
      }
    } catch (err: any) {
      console.error("Error importing file:", err);
      setMessage(`Failed to import file: ${err.message}`);
    } finally {
      setImportLoading(false);
      event.target.value = ""; // Reset file input after upload 
    }
  };

  // Download a template for the Excel file 
  const downloadTemplate = () => {
    const template = [
      { punchType: "IN", timestamp: new Date().toISOString() },
      { punchType: "OUT", timestamp: new Date().toISOString() },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance_template.xlsx");
  };

  return (
    <>
      <h1 className={s.header}>Employee Clock In/Out</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2 className={s.description}>Manual Clock In/Out</h2>
        <button className={s.button} onClick={handlePunch} disabled={loading}>
          {loading ? "Processing..." : `Clock ${punchType}`}
        </button>
      </div>

      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '2rem', marginTop: '2rem' }}>
        <h2 className={s.description}>Bulk Import from Excel</h2>

        <div style={{ marginBottom: '1rem' }}>
          <button onClick={downloadTemplate} className={s.button}>
            Download Template
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="excel-upload"
            className={s.button}
          >
            {importLoading ? 'Importing...' : 'Upload Excel File'}
          </label>
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={importLoading}
            style={{ display: 'none' }}
          />
        </div>

        {importResults && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem',
            marginTop: '1rem',
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Import Results
            </h3>
            <p style={{ color: '#059669' }}>
              ✓ Successful: {importResults.success}
            </p>
            <p style={{ color: '#dc2626' }}>
              ✗ Failed: {importResults.failed}
            </p>

            {importResults.errors.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  Errors:
                </p>
                <ul style={{ fontSize: '0.875rem', color: '#dc2626', paddingLeft: '1.5rem' }}>
                  {importResults.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                  {importResults.failed > 10 && (
                    <li style={{ fontStyle: 'italic' }}>
                      ... and {importResults.failed - 10} more errors
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className={s.textBox}>
          <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            Excel Format Requirements:
          </p>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>Column: <strong>punchType</strong> (required: IN or OUT)</li>
            <li>Column: <strong>timestamp</strong> (optional, uses current time if empty)</li>
            <li><em>Note: Employee ID is automatically taken from your logged-in session</em></li>
          </ul>
        </div>
      </div>

      {message && <p className={s.message}>{message}</p>}
    </>
  );
}
