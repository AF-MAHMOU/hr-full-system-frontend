"use client";

import s from "../page.module.css";  
import EmployeeClock from "../EmployeeClock/page";
import EmployeeViewCalendar from "../components/EmployeeViewCalendar";

export default function EmployeeDashboard() {  
  return ( 
    <main className={s.container}> 
      <div className={s.dashboardLayout}>
        <section className={s.dashboardSection}>
          <EmployeeClock/>
        </section>
        
        <section className={s.dashboardSection}>
          <EmployeeViewCalendar/>
        </section>
      </div>
    </main> 
  ); 
}