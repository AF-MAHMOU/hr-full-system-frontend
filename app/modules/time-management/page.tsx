'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/shared/components';
import s from './page.module.css';
import { getAllLatenessRule, getAllSchedule, getAllShifts, getAllShiftsType } from './api/index';
import { LatenessRule, ScheduleRule, Shift, ShiftType } from './types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { set } from 'zod';
import { useAuth } from '@/shared/hooks';
import { SystemRole } from '@/shared/types';

export default function TimeManagementPage() {
    const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [latenessRules, setLatenessRules] = useState<LatenessRule[]>([]);
    const [scheduleRules, setScheduleRules] = useState<ScheduleRule[]>([]);

    const [loading, setLoading] = useState(true);

    const pathname = usePathname();

    const shiftTypeHref = `${pathname}/shift-type`;
    const shiftsHref = `${pathname}/shifts`;
    const latenessHref = `${pathname}/lateness`;
    const scheduleHref = `${pathname}/schedule`;

    const router = useRouter();
    const { user } = useAuth();

    const roles = user?.roles;

    useEffect(() => {
    console.log("hello");
    console.log(user?.roles);

    async function fetchThem() {
        try {
            const st = await getAllShiftsType();
            const s = await getAllShifts();
            const l = await getAllLatenessRule();
            const sr = await getAllSchedule();

            setShiftTypes(st);
            setShifts(s);
            setLatenessRules(l);
            setScheduleRules(sr);
        } catch (err) {
            console.error('Failed to fetch', err);
        } finally {
            setLoading(false);
        }
    }
    fetchThem();
}, [user, router]); // Include `user` in dependencies to re-run if it changes


    const nextStep = (() => {
        const label = 'Get started';
        if (shiftTypes.length === 0) {
            return {
                label: label,
                href: shiftTypeHref,
            };
        }

        if (shifts.length === 0) {
            return {
                label: label,
                href: shiftsHref,
            };
        }

        if (latenessRules.length === 0) {
            return {
                label: label,
                href: latenessHref,
            };
        }

        if (scheduleRules.length === 0) {
            return {
                label: label,
                href: scheduleHref,
            };
        }

        return null;
    })();

return (
    <div className={s.wrapper}>
        <div className={s.container}>
            <p>hi</p> {/*THis navbar really needs to be studied */}
            
            <header className={s.header}>Welcome to Time Management!</header>

            {loading && roles?.includes(SystemRole.SYSTEM_ADMIN) || roles?.includes(SystemRole.HR_ADMIN) ? (
                <p>Loading...</p>
            ) : nextStep ? (
                <>
                    <header className={s.header}>
                        <h2 className={s.header2}>Get Started with Time Management</h2>
                    </header>

                    <p className={s.description}>
                        Complete the required setup steps to start using attendance and payroll features.
                    </p>

                    <div className={s.actions}>
                        <Link href={nextStep.href} className={s.button}>
                            {nextStep.label}
                        </Link>
                    </div>
                </>
            ) : (
                <></>
            )}
            <>
            {roles?.includes(SystemRole.SYSTEM_ADMIN) || roles?.includes(SystemRole.HR_ADMIN) ? ( 
                <>
                <p className={s.header2}>Time Management is fully set up!</p>
                <Link href="/modules/time-management/attendance-record" className={s.button}>Attendance Record</Link>
                <Link href="/modules/time-management/holiday" className={s.button}>Holiday Setup</Link>
                <Link href="/modules/time-management/lateness" className={s.button}>Define Lateness Rules</Link>
                <Link href="/modules/time-management/notification" className={s.button}>Notification Log</Link>
                <Link href="/modules/time-management/overtime" className={s.button}>Overtime Rule</Link>
                <Link href="/modules/time-management/shift-assignment" className={s.button}>Assign Shifts</Link>
                <Link href="/modules/time-management/shift-type" className={s.button}>Define Shift Types</Link>
                <Link href="/modules/time-management/shifts" className={s.button}>Define Shifts</Link>
                <Link href="/modules/time-management/attendance-correction" className={s.button}>Attendance Correction</Link>
                <Link href="/modules/time-management/time-exception" className={s.button}>Time Exceptions</Link>
                </>
            ) : ( 
                <h2 className={s.header}>Who gave you Authority to come over here? :)</h2> 
            )}
            </>
        </div>
    </div>
);}
