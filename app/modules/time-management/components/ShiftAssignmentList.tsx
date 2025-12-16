import { ShiftAssignmentWithType, AssignmentType, ScheduleRule, Shift } from "../types";
import s from "../page.module.css";
import { useState } from "react";
import { EmployeeProfile } from "../../hr/api/hrApi";
import { Department, Position } from "../../organization-structure/types";

interface Props {
  shiftassignments: ShiftAssignmentWithType[];
  onDelete: (id: string, type: AssignmentType) => void;
}

export default function ShiftAssignmentList({ shiftassignments, onDelete }: Props) {
  if (!shiftassignments.length) return <p>No shift assignments found</p>;
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [scheduleRules, setScheduleRules] = useState<ScheduleRule[]>([]);

  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  return (
    <div className={s.cardcontainer}>
      {shiftassignments.map((sa) => (
        <div key={sa.id} className={s.Card}>
          <h4 className={s.header}>{sa.shiftId}</h4>

          <p className={s.description}>
            Starts: {new Date(sa.startDate).toLocaleDateString()}
          </p>

          <p className={s.description}>
            Ends: {sa.endDate ? new Date(sa.endDate).toLocaleDateString() : "N/A"}
          </p>

          <p className={s.description}>Status: {sa.status}</p>

          <p className={s.description}>Shift: {sa.shiftId}</p>

          <p className={s.description}>Schedule Rule: {sa.scheduleRuleId}</p>

          <p className={s.description}>Employee: {sa.employeeId}</p>

          <p className={s.description}>Department: {sa.departmentId}</p>

          <p className={s.description}>Position: {sa.positionId}</p>

          <button
            className={s.button}
            onClick={() => onDelete(sa.id, sa.type)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
