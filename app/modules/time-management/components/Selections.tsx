"use client";  

import { useEffect, useState } from "react"; // Added useState for loading state  
import s from "../page.module.css";  
import { EmployeeProfile, getAllEmployees } from "../../hr/api/hrApi";  

interface Props {  
  employeeId: string;  
  setEmployeeId: (id: string) => void;  
}  

export default function Selections({  
  employeeId,  
  setEmployeeId,  
}: Props) {  
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);  
  const [loading, setLoading] = useState<boolean>(true); // Loading state to track if data is being fetched  
  const [error, setError] = useState<string | null>(null); // Error state for handling failures  

  useEffect(() => {  
    getAllEmployees() // Fetch the employee data  
      .then((data) => {  
        setEmployees(data);  
        setLoading(false);  

        // Set employeeId to the first employee if available
        if (data.length > 0 && !employeeId) { // Only set employeeId if it's not already set
          setEmployeeId(data[0]._id); // Default to the first employee's ID  
        }  
      })  
      .catch((err) => {  
        console.error("Error fetching employees:", err);  
        setError("Failed to load employees");  
        setLoading(false);  
      });  
  }, [setEmployeeId, employeeId]); // Dependency array includes employeeId to ensure it doesn't overwrite after being set  

  if (loading) {  
    return <div>Loading...</div>; // Display loading text while fetching  
  }  

  if (error) {  
    return <div>{error}</div>; // Display error message if fetching fails  
  }  

  // Render the selection dropdown once data is loaded 
  return (  
    <select  
      className={s.select}  
      value={employeeId}  
      onChange={(e) => setEmployeeId(e.target.value)}  
      required  
    >  
      <option value="" disabled>  
        Select an Employee  
      </option>  
      {employees.map((em) => (  
        <option key={em._id} value={em._id}>  
          {em.firstName} {em.lastName}  
        </option>  
      ))}  
    </select>  
  );  
}
