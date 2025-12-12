"use client";

import { useMemo, useState } from "react";
import s from "../page.module.css";
import { createSchedule } from "../api/index";

interface CreateScheduleRuleFormProps {
  onCreated: () => void;
}

type RuleKind = "FIXED" | "FLEX" | "ROT";

const pad2 = (n: number) => String(n).padStart(2, "0");

// 0=Sun ... 6=Sat
const WEEKDAYS: { value: number; label: string }[] = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

function isTime(t: string) {
  return /^\d{2}:\d{2}$/.test(t);
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function inRange(innerStart: string, innerEnd: string, outerStart: string, outerEnd: string) {
  const a = timeToMinutes(innerStart);
  const b = timeToMinutes(innerEnd);
  const c = timeToMinutes(outerStart);
  const d = timeToMinutes(outerEnd);
  return a >= c && b <= d;
}

export default function CreateScheduleRuleForm({ onCreated }: CreateScheduleRuleFormProps) {
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [kind, setKind] = useState<RuleKind>("FIXED");

  // FIXED
  const [fixedDays, setFixedDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [fixedStart, setFixedStart] = useState("09:00");
  const [fixedEnd, setFixedEnd] = useState("17:00");
  const [fixedBreak, setFixedBreak] = useState<number>(60);

  // FLEX
  const [flexEarliest, setFlexEarliest] = useState("07:00");
  const [flexLatest, setFlexLatest] = useState("10:00");
  const [coreStart, setCoreStart] = useState("10:00");
  const [coreEnd, setCoreEnd] = useState("15:00");
  const [requiredMinutes, setRequiredMinutes] = useState<number>(480);
  const [flexBreak, setFlexBreak] = useState<number>(60);

  // ROT (Rotation)
  const [rotStartDate, setRotStartDate] = useState(() => {
    // default today in YYYY-MM-DD
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  });
  const [rotOnDays, setRotOnDays] = useState<number>(4);
  const [rotOffDays, setRotOffDays] = useState<number>(3);
  const [rotStart, setRotStart] = useState("09:00");
  const [rotEnd, setRotEnd] = useState("17:00");
  const [rotBreak, setRotBreak] = useState<number>(60);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pattern = useMemo(() => {
    if (kind === "FIXED") {
      const days = fixedDays.slice().sort((a, b) => a - b).join(",");
      const breakPart = fixedBreak > 0 ? `;break=${fixedBreak}` : "";
      return `FIXED;days=${days};time=${fixedStart}-${fixedEnd}${breakPart}`;
    }

    if (kind === "FLEX") {
      const breakPart = flexBreak > 0 ? `;break=${flexBreak}` : "";
      return `FLEX;flex=${flexEarliest}-${flexLatest};core=${coreStart}-${coreEnd};req=${requiredMinutes}${breakPart}`;
    }

    const on = Math.max(1, rotOnDays);
    const off = Math.max(0, rotOffDays);
    const cycleBits = `${"1".repeat(on)}${"0".repeat(off)}`; // e.g. 1111000
    const breakPart = rotBreak > 0 ? `;break=${rotBreak}` : "";
    return `ROT;start=${rotStartDate};cycle=${cycleBits};time=${rotStart}-${rotEnd}${breakPart}`;
  }, [
    kind,
    fixedDays,
    fixedStart,
    fixedEnd,
    fixedBreak,
    flexEarliest,
    flexLatest,
    coreStart,
    coreEnd,
    requiredMinutes,
    flexBreak,
    rotStartDate,
    rotOnDays,
    rotOffDays,
    rotStart,
    rotEnd,
    rotBreak,
  ]);

  const validation = useMemo(() => {
    const errs: string[] = [];

    if (!name.trim()) errs.push("Name is required btw");

    if (kind === "FIXED") {
      if (!fixedDays.length) errs.push("Pick at least one weekday.");
      if (!isTime(fixedStart) || !isTime(fixedEnd)) errs.push("Fixed times must be HH:MM.");
      if (isTime(fixedStart) && isTime(fixedEnd) && timeToMinutes(fixedEnd) <= timeToMinutes(fixedStart)) {
        errs.push("End time must be after start time.");
      }
      if (fixedBreak < 0) errs.push("Break minutes can’t be negative.");
    }

    if (kind === "FLEX") {
      const times = [flexEarliest, flexLatest, coreStart, coreEnd];
      if (times.some((t) => !isTime(t))) errs.push("Flex/core times must be HH:MM.");
      if (isTime(flexEarliest) && isTime(flexLatest) && timeToMinutes(flexLatest) <= timeToMinutes(flexEarliest)) {
        errs.push("Flex latest must be after flex earliest.");
      }
      if (isTime(coreStart) && isTime(coreEnd) && timeToMinutes(coreEnd) <= timeToMinutes(coreStart)) {
        errs.push("Core end must be after core start.");
      }
      if (isTime(coreStart) && isTime(coreEnd) && isTime(flexEarliest) && isTime(flexLatest)) {
        if (!inRange(coreStart, coreEnd, flexEarliest, flexLatest)) {
          errs.push("Core hours must be inside the flex window.");
        }
      }
      if (requiredMinutes <= 0) errs.push("Required daily minutes must be > 0.");
      if (flexBreak < 0) errs.push("Break minutes can’t be negative.");
    }

    if (kind === "ROT") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rotStartDate)) errs.push("Rotation start date must be YYYY-MM-DD.");
      if (!isTime(rotStart) || !isTime(rotEnd)) errs.push("Rotation times must be HH:MM.");
      if (isTime(rotStart) && isTime(rotEnd) && timeToMinutes(rotEnd) <= timeToMinutes(rotStart)) {
        errs.push("End time must be after start time.");
      }
      if (rotOnDays < 1) errs.push("On-days must be at least 1.");
      if (rotOffDays < 0) errs.push("Off-days can’t be negative.");
      if (rotBreak < 0) errs.push("Break minutes can’t be negative.");
    }

    return errs;
  }, [
    name,
    kind,
    fixedDays,
    fixedStart,
    fixedEnd,
    fixedBreak,
    flexEarliest,
    flexLatest,
    coreStart,
    coreEnd,
    requiredMinutes,
    flexBreak,
    rotStartDate,
    rotOnDays,
    rotOffDays,
    rotStart,
    rotEnd,
    rotBreak,
  ]);

  const canSubmit = validation.length === 0 && !loading;

  const toggleDay = (day: number) => {
    setFixedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) {
      setError(validation[0] ?? "Fix the form errors.");
      return;
    }

    setLoading(true);
    try {
      await createSchedule({
        name: name.trim(),
        pattern, // ✅ still just a string
        active,
      });

      // reset
      setName("");
      setActive(true);
      setKind("FIXED");

      setFixedDays([1, 2, 3, 4, 5]);
      setFixedStart("09:00");
      setFixedEnd("17:00");
      setFixedBreak(60);

      setFlexEarliest("07:00");
      setFlexLatest("10:00");
      setCoreStart("10:00");
      setCoreEnd("15:00");
      setRequiredMinutes(480);
      setFlexBreak(60);

      const d = new Date();
      setRotStartDate(`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`);
      setRotOnDays(4);
      setRotOffDays(3);
      setRotStart("09:00");
      setRotEnd("17:00");
      setRotBreak(60);

      onCreated();
    } catch (err) {
      console.error("Error creating schedule rule:", err);
      setError("Failed to create schedule rule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className={s.formContainer}>
      <div className={s.grid}>
        <div className={s.field}>
          <label className={s.description}>Schedule Rule Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

          <label className={s.description}>Rule Type</label>
          <select className={s.select} value={kind} onChange={(e) => setKind(e.target.value as RuleKind)}>
            <option value="FIXED">Fixed Weekly</option>
            <option value="FLEX">Flex In/Out</option>
            <option value="ROT">Rotation (e.g., 4 on / 3 off)</option>
          </select>

          {kind === "FIXED" && (
            <>
              <label className={s.description}>Weekdays</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} className={s.description}>
                {WEEKDAYS.map((d) => (
                  <label key={d.value} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={fixedDays.includes(d.value)}
                      onChange={() => toggleDay(d.value)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>

              <label className={s.description}>Start / End</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className={s.select} type="time" value={fixedStart} onChange={(e) => setFixedStart(e.target.value)} />
                <input className={s.select} type="time" value={fixedEnd} onChange={(e) => setFixedEnd(e.target.value)} />
              </div>

              <label className={s.description}>Break Minutes</label>
              <input
                type="number"
                min={0}
                value={fixedBreak}
                onChange={(e) => setFixedBreak(Number(e.target.value))}
              />
            </>
          )}

          {kind === "FLEX" && (
            <>
              <label className={s.description}>Flex Window (Clock-in range)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className={s.select} type="time" value={flexEarliest} onChange={(e) => setFlexEarliest(e.target.value)} />
                <input className={s.select} type="time" value={flexLatest} onChange={(e) => setFlexLatest(e.target.value)} />
              </div>

              <label className={s.description}>Core Hours (Must be present)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className={s.select} type="time" value={coreStart} onChange={(e) => setCoreStart(e.target.value)} />
                <input className={s.select} type="time" value={coreEnd} onChange={(e) => setCoreEnd(e.target.value)} />
              </div>

              <label className={s.description}>Required Daily Minutes</label>
              <input
                type="number"
                min={1}
                value={requiredMinutes}
                onChange={(e) => setRequiredMinutes(Number(e.target.value))}
              />

              <label className={s.description}>Break Minutes</label>
              <input
                type="number"
                min={0}
                value={flexBreak}
                onChange={(e) => setFlexBreak(Number(e.target.value))}
              />
            </>
          )}

          {kind === "ROT" && (
            <>
              <label className={s.description}>Cycle Start Date</label>
              <input className={s.select} type="date" value={rotStartDate} onChange={(e) => setRotStartDate(e.target.value)} />

              <label className={s.description}>Rotation Pattern</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span className={s.description}>On</span>
                <input type="number" min={1} value={rotOnDays} onChange={(e) => setRotOnDays(Number(e.target.value))} />
                <span className={s.description}>Off</span>
                <input type="number" min={0} value={rotOffDays} onChange={(e) => setRotOffDays(Number(e.target.value))} />
                <span className={s.description} style={{ opacity: 0.8 }}>
                  (Example: {`${"1".repeat(Math.max(1, rotOnDays))}${"0".repeat(Math.max(0, rotOffDays))}`})
                </span>
              </div>

              <label className={s.description}>Start / End</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className={s.select} type="time" value={rotStart} onChange={(e) => setRotStart(e.target.value)} />
                <input className={s.select} type="time" value={rotEnd} onChange={(e) => setRotEnd(e.target.value)} />
              </div>

              <label className={s.description}>Break Minutes</label>
              <input
                type="number"
                min={0}
                value={rotBreak}
                onChange={(e) => setRotBreak(Number(e.target.value))}
              />
            </>
          )}

          <label className={s.description}>Pattern (auto-generated)</label>
          <input type="text" value={pattern} readOnly />

          <label className={s.description}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active
          </label>

          {validation.length > 0 && (
            <div style={{ color: "red", marginBottom: 10 }}>
              {validation[0]}
            </div>
          )}
          {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}

          <button className={s.button} disabled={!canSubmit}>
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </form>
  );
}
