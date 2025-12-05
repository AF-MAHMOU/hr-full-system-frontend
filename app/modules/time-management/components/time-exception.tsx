'use client';

import { useEffect, useState } from 'react';
import { deleteTimeException, getAllTimeExceptions } from '../api/time-exception';

export default function TimeExceptionsPage({ token }: { token: string }) {
  const [exceptions, setExceptions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const data = await getAllTimeExceptions(token);
      setExceptions(data);
    }
    fetchData();
  }, [token]);

  const handleDelete = async (id: string) => {
    await deleteTimeException(id, token);
    setExceptions(exceptions.filter(e => e._id !== id));
  };

  return (
    <div>
      <h1>Time Exceptions</h1>
      <ul>
        {exceptions.map(e => (
          <li key={e._id}>
            {e.reason} — {e.date}
            <button onClick={() => handleDelete(e._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
