"use client";

import { useEffect, useState } from "react";
import s from "../page.module.css";
import Calendar from "../components/Calendar";
import ShiftAssignmentList from "../components/ShiftAssignmentList";

import CreateShiftAssignmentEmployeeForm from "../components/CreateShiftAssignmentEmployeeForm";
import CreateShiftAssignmentPositionForm from "../components/CreateShiftAssignmentPositionForm";
import CreateShiftAssignmentDepartmentForm from "../components/CreateShiftAssignmentDepartmentForm";

import { ShiftAssignment } from "../types";
import {
  getShiftAssignmentsByEmployee,
  getShiftAssignmentsByPosition,
  getShiftAssignmentsByDepartment,
  deleteShiftAssignmentByEmployee,
  deleteShiftAssignmentByPosition,
  deleteShiftAssignmentByDepartment,
} from "../api";

export default function ShiftAssignmentPage() {
  const [shiftassignments, setShiftAssignments] = useState<ShiftAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [byEmployee, byPosition, byDepartment] = await Promise.all([
  getShiftAssignmentsByEmployee("EMPLOYEE_ID", token).then(arr => arr.map(a => ({ ...a, type: "employee" }))),
  getShiftAssignmentsByPosition("POSITION_ID", token).then(arr => arr.map(a => ({ ...a, type: "position" }))),
  getShiftAssignmentsByDepartment("DEPARTMENT_ID", token).then(arr => arr.map(a => ({ ...a, type: "department" }))),
]);

setShiftAssignments([...byEmployee, ...byPosition, ...byDepartment]);

    } catch (err) {
      console.error("Error fetching shift assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const handleDelete = async (id: string, type: "employee" | "position" | "department") => {
    if (!token) return;
    try {
      if (type === "employee") await deleteShiftAssignmentByEmployee(id, token);
      if (type === "position") await deleteShiftAssignmentByPosition(id, token);
      if (type === "department") await deleteShiftAssignmentByDepartment(id, token);
      load();
    } catch (err) {
      console.error("Error deleting shift assignment:", err);
    }
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Shift Assignments</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ShiftAssignmentList
            shiftassignments={shiftassignments}
            onDelete={(id) => {
            const assignment = shiftassignments.find(a => a.id === id);
            if (!assignment) return;
            handleDelete(id, assignment.type);
          }}

          />


          <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
            <CreateShiftAssignmentEmployeeForm onCreated={load} />
            <CreateShiftAssignmentPositionForm onCreated={load} />
            <CreateShiftAssignmentDepartmentForm onCreated={load} />
          </div>

          <div style={{ marginTop: "3rem" }}>
            <Calendar shiftassignments={shiftassignments} />
          </div>
        </>
      )}
    </div>
  );
}
