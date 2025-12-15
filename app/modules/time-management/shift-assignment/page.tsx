"use client";

import { useEffect, useState } from "react";
import ShiftAssignmentList from "../components/ShiftAssignmentList";
import Calendar from "../components/Calendar";
import s from "../page.module.css";

import {
  getAllShiftAssignmentsByDepartment,
  getAllShiftAssignmentsByEmployee,
  getAllShiftAssignmentsByPosition,
  deleteShiftAssignmentByDepartment,
  deleteShiftAssignmentByEmployee,
  deleteShiftAssignmentByPosition,
} from "../api";

import {
  ShiftAssignmentWithType,
  AssignmentType,
  ShiftAssignment,
} from "../types";

import CreateShiftAssignmentDepartmentForm from "../components/CreateShiftAssignmentDepartmentForm";
import CreateShiftAssignmentEmployeeForm from "../components/CreateShiftAssignmentEmployeeForm";
import CreateShiftAssignmentPositionForm from "../components/CreateShiftAssignmentPositionForm";
import { Button } from "@/shared/components";
import { usePathname, useRouter } from "next/navigation";

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

  const router = useRouter();
  const pathname = usePathname();

  const goToDepartmentPage = () => {
    const newPath = pathname.endsWith("/")
      ? pathname + "department"
      : pathname + "/department";
      
    router.push(newPath);
  };

  const gotoPositionPage = () => {
    const newPath = pathname.endsWith("/")
      ? pathname + "position"
      : pathname + "/position";
      
    router.push(newPath);
  };

  const goToEmployeePage = () => {
    const newPath = pathname.endsWith("/")
      ? pathname + "employee"
      : pathname + "/employee";
      
    router.push(newPath);
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
          <button className={s.button}   onClick={() => goToDepartmentPage()}>Assign by Department</button>
          <button className={s.button}   onClick={() => goToEmployeePage()}>Assign by Employee</button>
          <button className={s.button}   onClick={() => gotoPositionPage()}>Assign by Position</button>
        </>
      )}
    </div>
  );
}
