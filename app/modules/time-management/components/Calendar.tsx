'use client';

import { Shift } from "../types";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, parseISO } from 'date-fns';

interface CalendarProps {
  shifts: Shift[];
  selectedDate?: Date;
}

export default function Calendar({ shifts = [], selectedDate = new Date() }: CalendarProps) {
  const events = shifts.map(shift => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const startDateTime = `${dateStr}T${shift.startTime}:00`;
    const endDateTime = `${dateStr}T${shift.endTime}:00`;
    
    return {
      id: shift.id,
      title: `${shift.name} - ${shift.shiftType}`,
      start: startDateTime,
      end: endDateTime,
      color: shift.active ? '#3b82f6' : '#6b7280', // Blue for active, gray for inactive
      extendedProps: {
        shiftDetails: shift
      }
    };
  });

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }}
      events={events}
      editable={true}
      selectable={true}
      height="auto"
      slotMinTime="06:00:00"
      slotMaxTime="22:00:00"
    />
  );
}