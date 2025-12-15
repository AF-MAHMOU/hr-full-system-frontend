'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '@/shared/hooks'; // Add this import
import { getAllHolidays, getShift, getShiftAssignmentsByEmployee } from '../api/index';
import '../../../../app/global.css';

const getHolidayColor = (type: string) => {
  switch (type) {
    case 'NATIONAL':
      return '#584d4dff';
    case 'ORGANIZATIONAL':
      return '#00ff2fff';
    case 'WEEKLY_REST':
      return '#ff0000ff';
    default:
      return '#383875ff';
  }
};

const getShiftAssignmentColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return '#10b981'; // Green
    case 'PENDING':
      return '#f59e0b'; // Yellow
    case 'REJECTED':
      return '#ef4444'; // Red
    case 'CANCELLED':
      return '#6b7280'; // Gray
    default:
      return '#3b82f6'; // Blue
  }
};

export default function EmployeeViewCalendar() {
  const { user } = useAuth(); // Get the logged-in user
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState<'holidays' | 'shifts'>('shifts');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (calendarView === 'holidays') {
          // Fetch holidays
          const holidays = await getAllHolidays();
          const holidayEvents = holidays
            .filter(h => h.active)
            .map(h => ({
              id: `holiday-${h.id}`,
              title: h.name,
              start: h.startDate,
              end: h.endDate ?? h.startDate,
              allDay: true,
              color: getHolidayColor(h.type),
              extendedProps: { type: 'holiday' }
            }));
          setEvents(holidayEvents);
        } else {
          // Fetch shift assignments for the current employee
          if (user?.userid) {
            const shiftAssignments = await getShiftAssignmentsByEmployee(user.userid);
            
            // Transform shift assignments into calendar events
            const shiftEvents = await Promise.all(
              shiftAssignments.map(async (assignment: any) => {
                // Fetch shift details to get name and times
                const shift = await getShift(assignment.shiftId);
                
                const startDate = new Date(assignment.startDate);
                const endDate = assignment.endDate ? new Date(assignment.endDate) : null;
                
                // Create recurring events for each day in the date range
                const events = [];
                const currentDate = new Date(startDate);
                
                while (!endDate || currentDate <= endDate) {
                  if (shift) {
                    // Create event with shift timing
                    const eventDate = new Date(currentDate);
                    const eventStart = new Date(eventDate);
                    const eventEnd = new Date(eventDate);
                    
                    // Parse shift start/end times
                    if (shift.startTime && shift.endTime) {
                      const [startHour, startMinute] = shift.startTime.split(':').map(Number);
                      const [endHour, endMinute] = shift.endTime.split(':').map(Number);
                      
                      eventStart.setHours(startHour, startMinute, 0);
                      eventEnd.setHours(endHour, endMinute, 0);
                    }
                    
                    events.push({
                      id: `shift-${assignment._id}-${eventDate.toISOString().split('T')[0]}`,
                      title: `${shift.name} (${assignment.status})`,
                      start: eventStart.toISOString(),
                      end: eventEnd.toISOString(),
                      allDay: false,
                      color: getShiftAssignmentColor(assignment.status),
                      extendedProps: {
                        type: 'shift',
                        shiftName: shift.name,
                        status: assignment.status,
                        startTime: shift.startTime,
                        endTime: shift.endTime,
                        assignmentId: assignment._id
                      }
                    });
                  }
                  
                  // Move to next day
                  currentDate.setDate(currentDate.getDate() + 1);
                  
                  // If no end date, only show one day
                  if (!endDate) break;
                }
                
                return events;
              })
            );
            
            // Flatten the array of arrays
            const flattenedEvents = shiftEvents.flat();
            setEvents(flattenedEvents);
          }
        }
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.userid, calendarView]);

  if (loading) return <p>Loading calendar data...</p>;

  return (
    <div>
      {/* View Toggle Buttons */}
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setCalendarView('shifts')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            backgroundColor: calendarView === 'shifts' ? '#3b82f6' : '#6b7280',
            color: 'white',
            cursor: 'pointer',
            fontWeight: calendarView === 'shifts' ? 'bold' : 'normal'
          }}
        >
          My Shifts
        </button>
        <button
          onClick={() => setCalendarView('holidays')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            backgroundColor: calendarView === 'holidays' ? '#10b981' : '#6b7280',
            color: 'white',
            cursor: 'pointer',
            fontWeight: calendarView === 'holidays' ? 'bold' : 'normal'
          }}
        >
          Holidays
        </button>
      </div>

      {/* Legend */}
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center',
        fontSize: '0.875rem'
      }}>
        {calendarView === 'shifts' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
              <span>Approved</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }}></div>
              <span>Pending</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
              <span>Rejected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#6b7280', borderRadius: '2px' }}></div>
              <span>Cancelled</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#584d4dff', borderRadius: '2px' }}></div>
              <span>National Holiday</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#00ff2fff', borderRadius: '2px' }}></div>
              <span>Organizational Holiday</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#ff0000ff', borderRadius: '2px' }}></div>
              <span>Weekly Rest</span>
            </div>
          </>
        )}
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        eventClick={(info) => {
          const event = info.event;
          const extendedProps = event.extendedProps;
          
          if (extendedProps.type === 'shift') {
            alert(
              `Shift: ${extendedProps.shiftName}\n` +
              `Status: ${extendedProps.status}\n` +
              `Time: ${extendedProps.startTime} - ${extendedProps.endTime}\n` +
              `Date: ${event.start?.toLocaleDateString()}`
            );
          } else {
            alert(
              `Holiday: ${event.title}\n` +
              `Date: ${event.start?.toLocaleDateString()}`
            );
          }
        }}
        eventContent={(eventInfo) => {
          const timeText = eventInfo.event.allDay 
            ? '' 
            : eventInfo.timeText;
          
          return (
            <div style={{ padding: '2px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.85em' }}>
                {eventInfo.event.title}
              </div>
              {timeText && (
                <div style={{ fontSize: '0.75em', opacity: 0.8 }}>
                  {timeText}
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}