// components/Calendar.tsx
'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { addDays, format } from 'date-fns';
import { ShiftAssignmentWithType, Holiday } from '../types';

interface CalendarProps {
  shiftassignments?: ShiftAssignmentWithType[];
  holidays?: Holiday[];
}

export default function Calendar({
  shiftassignments = [],
  holidays = [],
}: CalendarProps) {
  const shiftEvents = shiftassignments.map((sa) => ({
    id: `shift-${sa.id}`,
    title: `Shift ${sa.shiftId}`,
    start: sa.startDate,
    end: sa.endDate ?? sa.startDate,
    color:
      sa.type === 1 ? '#2563eb' : // Department
      sa.type === 2 ? '#10b981' : // Employee
                     '#f59e0b',   // Position
    allDay: false,
  }));

  const holidayEvents = holidays.map((holiday) => ({
    id: `holiday-${holiday.id}`,
    title: `🎉 ${holiday.name ?? holiday.type}`,
    start: holiday.startDate,
    end: holiday.endDate ? addDays(holiday.endDate, 1) : undefined,
    color: '#f87171',
    allDay: true,
  }));

  const events = [...shiftEvents, ...holidayEvents];

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      events={events}
      selectable
      editable
      height="auto"
    />
  );
}
