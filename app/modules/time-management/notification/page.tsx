"use client";

import { useEffect, useState } from "react";
import s from "../page.module.css";
import { deleteNotification, getAllNotification } from '../api/index';
import NotificationLogList from "../components/NotificationLogList";
import { NotificationLog } from "../types";
import CreateNotificationLogForm from "../components/CreateNotificationLogForm";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllNotification();
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    load();
  };

  return (
    <div className={s.container}>
      <h1 className={s.header}>Notifications</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <NotificationLogList notifications={notifications} onDelete={handleDelete} />
          <CreateNotificationLogForm onCreated={load} />
        </>
      )}
    </div>
  );
}
