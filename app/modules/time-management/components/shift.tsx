import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
}

const Shift: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch shifts from your backend
  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await axios.get<Shift[]>('/api/time-management/shifts');
      setShifts(response.data);
    } catch (err: any) {
      setError(err.message || 'Error fetching shifts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  if (loading) return <div>Loading shifts...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Shifts</h2>
      <ul>
        {shifts.map((shift) => (
          <li key={shift._id}>
            <strong>{shift.name}</strong>: {shift.startTime} - {shift.endTime}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Shift;
