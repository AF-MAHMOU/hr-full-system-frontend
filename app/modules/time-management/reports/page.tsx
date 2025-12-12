"use client";

import { useState } from "react";
import s from "../page.module.css";
import {
  getAllAttendanceRecord,
  getAllOvertime,
  getAllTimeExceptions,
} from "../api/index";
import { EmployeeProfile } from "../../hr/api/hrApi";
import Selections from "../components/Selections";
import { TimeExceptionStatus, TimeExceptionType } from "../types";

type ExportFormat = "excel" | "access" | "text";
type ReportType = "attendance" | "lateness" | "overtime";

export default function ReportsPage() {
  const [format, setFormat] = useState<ExportFormat>("excel");
  const [reportType, setReportType] = useState<ReportType>("attendance");
  const [exporting, setExporting] = useState(false);
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [employeeId, setEmployeeId] = useState("");
    
  const exportReport = async () => {
    try {
      setExporting(true);

      let data: any[] = [];

      if (reportType === "attendance") {
        data = await getAllAttendanceRecord();
      } else if (reportType === "lateness") {
      const attendance = await getAllAttendanceRecord();
      const exceptions = await getAllTimeExceptions();
          
      data = exceptions
        .filter(e => e.type === TimeExceptionType.LATE)
        .filter(e => e.employeeId === employeeId || !employeeId)
        .map(e => {
          const record = attendance.find(
            r => r.id === e.attendanceRecordId
          );
        
          return {
            employeeId: e.employeeId,
            attendanceRecordId: e.attendanceRecordId,
            status: e.status,
            reason: e.reason ?? "",
          };
        });
    }


      else if (reportType === "overtime") {
        data = await getAllOvertime();
      }

      if (employeeId) {
        data = data.filter((row) => row.employeeId === employeeId);
      }

      if (!data.length) {
        alert("No data to export for selected employee");
        return;
      }

      const headers = Object.keys(data[0]);
      const rows = data.map((row) =>
        headers.map((h) => `"${row[h] ?? ""}"`).join(",")
      );

      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/plain;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download =
        format === "text"
          ? `${reportType}-report.txt`
          : `${reportType}-report.csv`;

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Generate Reports</h1>

      {/* Report type */}
      <Selections
                            employeeId={employeeId}
                            setEmployeeId={setEmployeeId}
                            employees={employees}
                            setEmployees={setEmployees}
                          />
      <div className={s.buttonCollection}>
        <button className={`${s.segmentButton} ${ reportType === "attendance" ? s.active : "" }`}
          onClick={() => setReportType("attendance")}>
          Attendance
        </button>
        <button
          className={`${s.segmentButton} ${ reportType === "lateness" ? s.active : "" }`} onClick={() => setReportType("lateness")}>
          Lateness
        </button>
        <button className={`${s.segmentButton} ${ reportType === "overtime" ? s.active : "" }`} onClick={() => setReportType("overtime")}>
          Overtime
        </button>
      </div>

      <div className={s.buttonCollection}>
        <button className={`${s.segmentButton} ${ format === "excel" ? s.active : "" }`} onClick={() => setFormat("excel")}>
          Excel
        </button>
        <button className={`${s.segmentButton} ${ format === "access" ? s.active : "" }`} onClick={() => setFormat("access")} >
          Access
        </button>

        <button
          className={`${s.segmentButton} ${ format === "text" ? s.active : ""}`} onClick={() => setFormat("text")}>
          Text
        </button>
      </div>

      <button className={s.button} onClick={exportReport} disabled={exporting}>
        {exporting ? "Exporting..." : "Export Report"}
      </button>
    </div>
  );
}