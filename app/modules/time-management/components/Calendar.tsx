/*import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Calendar({ shifts, onEventClick, onDateClick }) {
  const events = shifts.map(shift => ({
    id: shift.id,
    title: `${shift.employee?.name || 'Unassigned'} - ${shift.role || ''}`,
    start: shift.start,
    end: shift.end,
    color: shift.color || '#3b82f6',
    extendedProps: { ...shift }
  }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      }}
      events={events}
      eventClick={onEventClick}
      dateClick={onDateClick} // Opens create form for that date
      editable={true}
      selectable={true}
      height="auto"
    />
  );
}*/