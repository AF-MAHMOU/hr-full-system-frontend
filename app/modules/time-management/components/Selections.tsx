"use client";

import { useEffect } from "react";
import s from "../page.module.css";
import { EmployeeProfile, getAllEmployees } from "../../hr/api/hrApi";

interface Props {
  employeeId: string;
  setEmployeeId: (id: string) => void;
  employees: EmployeeProfile[];
  setEmployees: (e: EmployeeProfile[]) => void;
}

export default function Selections({
  employeeId,
  setEmployeeId,
  employees,
  setEmployees,
}: Props) {
  useEffect(() => {
    getAllEmployees().then(setEmployees).catch(() => {});
  }, [setEmployees]);

  return (
    <select
      className={s.select}
      value={employeeId}
      onChange={(e) => setEmployeeId(e.target.value)}
      required
    >
      <option value="" disabled>
        Select an Employee
      </option>
      {employees.map((em) => (
        <option key={em._id} value={em._id}>
          {em.firstName} {em.lastName}
        </option>
      ))}
    </select>
  );
}
