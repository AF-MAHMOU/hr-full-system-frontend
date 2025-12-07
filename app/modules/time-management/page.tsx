'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Card } from '@/shared/components';
import { useAuth } from '@/shared/hooks/useAuth';
import ProtectedRoute from '@/shared/components/ProtectedRoute/ProtectedRoute';
import s from './page.module.css';
import Link from 'next/link';

export default function TimeManagementPage() {
    const pathname = usePathname();

    const attendanceCorrectionHref = `${pathname}/attendanceCorrection`;
    const attendanceRecordHref = `${pathname}/attendance`;
    const holidayHref = `${pathname}/holiday`;
    const latenessHref = `${pathname}/lateness`;
    const notificationHref = `${pathname}/notification`;
    const overtimeHref = `${pathname}/overtime`;
    const scheduleRuleHref = `${pathname}/schedule`;
    const shiftHref = `${pathname}/shifts`;
    const timeExceptionHref = `${pathname}/timeException`;
    
    return (
    <div className={s.container}>
        <div className={s.glow}></div>
        <div className={s.glow} style={{ top: "200px", right: "-100px", background: "radial-gradient(circle, rgba(165, 255, 80, 0.2), transparent 70%)" }}></div>

        <Link href={attendanceCorrectionHref} className={s.button}>Attendance Correction</Link>
        <Link href={attendanceRecordHref} className={s.button}>Attendance Record</Link>
        <Link href={holidayHref} className={s.button}>Holidays</Link>
        <Link href={latenessHref} className={s.button}>Lateness</Link>
        <Link href={notificationHref} className={s.button}>Notifications</Link>
        <Link href={overtimeHref} className={s.button}>Overtime</Link>
        <Link href={scheduleRuleHref} className={s.button}>Schedule</Link>
        <Link href={shiftHref} className={s.button}>Shifts</Link>
        <Link href={timeExceptionHref} className={s.button}>Time Exception</Link>
    </div>
    





























    );
}