"use client";

import { useEffect, useState } from "react";
import ShiftAssignmentList from "../../components/ShiftAssignmentList";
import Calendar from "../../components/Calendar";
import s from "../../page.module.css";

import {
  getAllShiftAssignmentsByDepartment,
  getAllShiftAssignmentsByEmployee,
  getAllShiftAssignmentsByPosition,
  deleteShiftAssignmentByDepartment,
  deleteShiftAssignmentByEmployee,
  deleteShiftAssignmentByPosition,
} from "../../api";

import {
  ShiftAssignmentWithType,
  AssignmentType,
  ShiftAssignment,
} from "../../types";

import CreateShiftAssignmentEmployeeForm from "../../components/CreateShiftAssignmentEmployeeForm";

export default function ShiftAssignmentPage() {
  const [shiftassignments, setShiftAssignments] = useState<ShiftAssignmentWithType[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);

    try {
      const [byDept, byEmp, byPos] = await Promise.all([
        getAllShiftAssignmentsByDepartment(),
        getAllShiftAssignmentsByEmployee(),
        getAllShiftAssignmentsByPosition(),
      ]);
const allAssignments: ShiftAssignmentWithType[] = [
  ...byDept.map((a: ShiftAssignment) => ({ ...a, type: 1 })),
  ...byEmp.map((a: ShiftAssignment) => ({ ...a, type: 2 })),
  ...byPos.map((a: ShiftAssignment) => ({ ...a, type: 3 })),
];


      setShiftAssignments(allAssignments);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, type: AssignmentType) => {
    try {
      if (type === 1) await deleteShiftAssignmentByDepartment(id);
      if (type === 2) await deleteShiftAssignmentByEmployee(id);
      if (type === 3) await deleteShiftAssignmentByPosition(id);

      await load();
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
            onDelete={handleDelete}
          />
          <CreateShiftAssignmentEmployeeForm onCreated={load} />

          <div style={{ marginTop: "3rem" }}>
            <Calendar shiftassignments={shiftassignments} />
          </div>
        </>
      )}
    </div>
  );
}
