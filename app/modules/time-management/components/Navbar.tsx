"use client";

import { useState } from "react";
import Link from "next/link";
import s from "../page.module.css";

const navItems = [
  {
    name: "Time Management",
    sub: [
      { name: "Attendance Correction", href: "/modules/time-management/attendance-correction" },
      { name: "Attendance Record", href: "/modules/time-management/attendance-record" },
      { name: "Holiday", href: "/modules/time-management/holiday" },
      { name: "Lateness", href: "/modules/time-management/lateness" },
      { name: "Notification", href: "/modules/time-management/notification" },
      { name: "Overtime", href: "/modules/time-management/overtime" },
      { name: "Schedule", href: "/modules/time-management/schedule" },
      { name: "Shifts", href: "/modules/time-management/shifts" },
      { name: "TimeException", href: "/modules/time-management/time-exception" },
    ],
  },
];

export default function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav className={s.navbar}>
        <div className={s.header} style={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        HR System
      </div>
      {navItems.map((item) => (
        <div
          key={item.name}
          onMouseEnter={() => setHovered(item.name)}
          onMouseLeave={() => setHovered(null)}
          className="relative"
        >
          <span className={s.header2}>{item.name}</span>
          {hovered === item.name && (
            <div className={s.dropdown}>
                {item.sub.map((subItem) => (
                    <div key={subItem.name}>
                        <Link href={subItem.href} className={s.dropdownItem}>
                        {subItem.name}
                        </Link>
                        </div>
                    ))}</div>
                    )}
                    </div>
                ))}
                </nav>
                );
            }
