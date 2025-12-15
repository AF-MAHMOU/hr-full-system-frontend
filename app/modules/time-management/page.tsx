'use client';

import React, { useEffect, useState } from 'react';
import s from '../../page.module.css';
import { getAllLatenessRule, getAllSchedule, getAllShifts, getAllShiftsType } from './api/index';
import { LatenessRule, ScheduleRule, Shift, ShiftType } from './types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button, Card } from '@/shared/components';
import { useAuth } from '@/shared/hooks';
import { SystemRole } from '@/shared/types';

export default function TimeManagementPage() {
    const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [latenessRules, setLatenessRules] = useState<LatenessRule[]>([]);
    const [scheduleRules, setScheduleRules] = useState<ScheduleRule[]>([]);
    const [loading, setLoading] = useState(true);

    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const roles = user?.roles;

    const shiftTypeHref = `${pathname}/shift-type`;
    const shiftsHref = `${pathname}/shifts`;
    const latenessHref = `${pathname}/lateness`;
    const scheduleHref = `${pathname}/schedule`;

    useEffect(() => {
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
        if (user) {
            fetchThem();
        }
    }, [user]);

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
        <div className={s.container}>
        <section className={s.welcomeSection}>
          <div className={s.welcomeContent}>
            <h1 className={s.welcomeTitle}>Time Management</h1>
            <p className={s.welcomeSubtitle}>
              Manage attendance, shifts, and policies in one place.
            </p>
          </div>
        </section>

            {!roles?.includes(SystemRole.SYSTEM_ADMIN) && !roles?.includes(SystemRole.HR_ADMIN) ? (
              /* NON ADMIN VIEW*/
              <section className={s.quickActionsSection}>
                <h2 className={s.sectionTitle}>Quick actions</h2>

                <div className={s.actionsGrid}>
                  <div
                    className={s.actionCard}
                    onClick={() => router.push('/modules/time-management/attendance-record')}
                  >
                    <span className={s.actionIcon}>📅</span>
                    <span className={s.actionLabel}>Attendance</span>
                  </div>

                  <div
                    className={s.actionCard}
                    onClick={() => router.push('/modules/time-management/shifts')}
                  >
                    <span className={s.actionIcon}>⏱</span>
                    <span className={s.actionLabel}>My shifts</span>
                  </div>

                  <div
                    className={s.actionCard}
                    onClick={() => router.push('/modules/time-management/holiday')}
                  >
                    <span className={s.actionIcon}>🏖</span>
                    <span className={s.actionLabel}>Holidays</span>
                  </div>
                </div>
              </section>
                ) : (
                    /* ADMIN VIEW */
                  <section className={s.quickActionsSection}>
                    <h2 className={s.sectionTitle}>Admin actions</h2>
                
                    <div className={s.actionsGrid}>
                      <div
                        className={s.actionCard}
                        onClick={() => router.push('/modules/time-management/shift-type')}
                      >
                        <span className={s.actionIcon}>🧩</span>
                        <span className={s.actionLabel}>Shift types</span>
                      </div>

                      <div
                        className={s.actionCard}
                        onClick={() => router.push('/modules/time-management/overtime')}
                      >
                        <span className={s.actionIcon}> ⏱ </span>
                        <span className={s.actionLabel}>Overtime Rules</span>
                      </div>
                
                      <div
                        className={s.actionCard}
                        onClick={() => router.push('/modules/time-management/shifts')}
                      >
                        <span className={s.actionIcon}>⏱</span>
                        <span className={s.actionLabel}>Shifts</span>
                      </div>
                
                      <div
                        className={s.actionCard}
                        onClick={() => router.push('/modules/time-management/shift-assignment')}
                      >
                        <span className={s.actionIcon}>👥</span>
                        <span className={s.actionLabel}>Assign shifts</span>
                      </div>
                
                      <div
                        className={s.actionCard}
                        onClick={() => router.push('/modules/time-management/lateness')}
                      >
                        <span className={s.actionIcon}>⚠️</span>
                        <span className={s.actionLabel}>Lateness rules</span>
                      </div>
                
                      <div
                        className={s.actionCard}
                        onClick={() => router.push('/modules/time-management/overtime')}
                      >
                        <span className={s.actionIcon}>💰</span>
                        <span className={s.actionLabel}>Overtime</span>
                      </div>
                    </div>
                  </section>
                )}

        </div>
    );
}