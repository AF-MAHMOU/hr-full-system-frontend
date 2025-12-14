"use client";  // This tells Next.js that this component is a Client Component

import { useState } from "react";  
import { useAuth } from "@/shared/hooks"; 
import { useRouter } from "next/navigation"; 
import { createAttendanceRecord } from "../api";  
import s from "../page.module.css";  
import { PunchType } from "../types";  
import { EmployeeProfile } from "../../hr/api/hrApi";  
import * as XLSX from "xlsx";  

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
    const punches = [{ type: punchType, timestamp: new Date().toISOString() }];
    if (!user?.userid) {
      const router = useRouter();
      router.push("/login");
      throw new Error("User ID not found");
    }

    const attendanceData = {
      employeeId: user?.userid,
      punches,
      finalisedForPayroll: true,
    };

    console.log("Attendance Data:", attendanceData); // Log the data before sending
    await createAttendanceRecord(attendanceData);

    setMessage(`Attendance recorded (${punchType}) successfully`);
    setPunchType(punchType === PunchType.IN ? PunchType.OUT : PunchType.IN);
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.message || "Failed to process attendance";
    console.error("Error:", errorMsg);
    setMessage(errorMsg);
  }
 finally {
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
      // Read the Excel file into JSON format 
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
        const rowNum = i + 2; // Adjust for header row 
        try { 
          // Extract and validate data from Excel row 
          const punchTypeStr = row.punchType?.toString().toUpperCase() || row.PunchType?.toString().toUpperCase(); 
          const timestampStr = row.timestamp || row.Timestamp || row.Time; 

          if (!punchTypeStr || (punchTypeStr !== "IN" && punchTypeStr !== "OUT")) { 
            errors.push(`Row ${rowNum}: Invalid punch type (must be IN or OUT)`); 
            failedCount++; 
            continue; 
          } 

          // Prepare punch data 
          const timestamp = timestampStr ? new Date(timestampStr).toISOString() : new Date().toISOString(); 
          const punches = [{ type: punchTypeStr as PunchType, timestamp }]; 

          if (!user?.userid) { 
            // Redirect to login if user is not authenticated
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
    <div className={s.container}> 
      <h1 className={s.header}>Employee Clock In/Out</h1> 

      <div style={{ marginBottom: '2rem' }}> 
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Manual Clock In/Out</h2> 
        <button className={s.button} onClick={handlePunch} disabled={loading}> 
          {loading ? "Processing..." : `Clock ${punchType}`} 
        </button> 
      </div> 

      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '2rem', marginTop: '2rem' }}> 
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Bulk Import from Excel</h2> 

        <div style={{ marginBottom: '1rem' }}> 
          <button onClick={downloadTemplate} style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}> 
            Download Template 
          </button> 
        </div> 

        <div style={{ marginBottom: '1rem' }}> 
          <label 
            htmlFor="excel-upload" 
            style={{ 
              display: 'inline-block', 
              padding: '0.75rem 1.5rem', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              borderRadius: '0.375rem', 
              cursor: importLoading ? 'not-allowed' : 'pointer', 
              opacity: importLoading ? 0.6 : 1, 
            }} 
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

        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#eff6ff', 
          borderRadius: '0.375rem', 
          fontSize: '0.875rem', 
        }}> 
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
    </div> 
  ); 
}
