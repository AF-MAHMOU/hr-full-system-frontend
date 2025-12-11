import axios from 'axios';
import { PunchPolicy, Shift, ShiftType } from '../types';

const BASE_URL = 'http://localhost:3000/time-management';

// ============================================================
// Shift
// ============================================================


export const getAllShifts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/shifts`, { 
      withCredentials: true 
    });
    
    let rawData: any[] = [];
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      rawData = response.data.data;
    } else if (response.data && response.data.shifts) {
      rawData = response.data.shifts;
    } else if (response.data && response.data.items) {
      rawData = response.data.items;
    }
    
    // Map raw data to Shift interface
    return rawData.map((item: Shift): Shift => ({
      id: item.id || "",
      name: item.name || "",
      shiftType: item.shiftType || "",
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      punchPolicy: item.punchPolicy || PunchPolicy.FIRST_LAST,
      graceInMinutes: item.graceInMinutes || 0,
      graceOutMinutes: item.graceOutMinutes || 0,
      requiresApprovalForOvertime: item.requiresApprovalForOvertime !== undefined 
        ? item.requiresApprovalForOvertime 
        : false,
      active: item.active !== undefined ? item.active : true
    }));
    
  } catch (error: any) {
    console.error("Error fetching shifts:", error.message);
    return [];
  }
};

export const getShift = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/shifts/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createShift = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/shifts`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateShift = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/shifts/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteShift = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/shifts/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// Shift Type
// ============================================================

export const getAllShiftsType = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/shift-type`, { 
      withCredentials: true 
    });
    let shiftTypesData: any[] = [];

    if (Array.isArray(response.data)) {
      shiftTypesData = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      shiftTypesData = response.data.data;
    } else if (response.data && response.data.shiftTypes) {
      shiftTypesData = response.data.shiftTypes;
    } else if (response.data && response.data.items) {
      shiftTypesData = response.data.items;
    }

    return shiftTypesData.map((item) => ({
      id: item.id || item._id || item.shiftTypeId || item.typeId || "",
      name: item.name || item.shiftName || "",
      active: item.active !== undefined ? item.active : true,
    }));

  } catch (error: any) {
    console.error("Error fetching shift types:", error.message);
    return [];
  }
};

export const getShiftType = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/shift-type/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createShiftType = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/shift-type`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateShiftType = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/shift-type/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteShiftType = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/shift-type/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// Attendance Correction
// ============================================================

export const getAllAttendanceCorrections = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/attendanceCorrection`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const getAttendanceCorrection = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/attendanceCorrection/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createAttendanceCorrection = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/attendanceCorrection`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateAttendanceCorrection = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/attendanceCorrection/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteAttendanceCorrection = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/attendanceCorrection/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// Attendance Record
// ============================================================

export const getAllAttendanceRecord = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/attendance`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const getAttendanceRecord = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/attendance/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createAttendanceRecord = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/attendance`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateAttendanceRecord = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/attendance/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteAttendanceRecord = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/attendance/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// TimeException
// ============================================================

export const getAllTimeExceptions = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/timeException`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const getTimeException = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/timeException/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createTimeException = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/timeException`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateTimeException = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/timeException/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteTimeException = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/timeException/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// ShiftAssignment
// ============================================================

export const getShiftAssignmentsByEmployee = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/shift-assignments/employee/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const createShiftAssignmentByEmployee = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/shift-assignments/employee`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateShiftAssignmentByEmployee = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/shift-assignments/employee/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteShiftAssignmentByEmployee = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/shift-assignments/employee/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const getShiftAssignmentsByPosition = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/shift-assignments/position/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const createShiftAssignmentByPosition = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/shift-assignments/position`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateShiftAssignmentByPosition = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/shift-assignments/position/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteShiftAssignmentByPosition = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/shift-assignments/position/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const getShiftAssignmentsByDepartment = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/shift-assignments/department/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const createShiftAssignmentByDepartment = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/shift-assignments/department`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateShiftAssignmentByDepartment = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/shift-assignments/department/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteShiftAssignmentByDepartment = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/shift-assignments/department/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// Overtime
// ============================================================

export const getOvertime = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/overtime`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const createOvertime = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/overtime`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateOvertime = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/overtime/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteOvertime = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/overtime/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// Schedule
// ============================================================

export const getAllSchedule = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/schedule`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const getSchedule = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/schedule/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createSchedule = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/schedule`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateSchedule = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/schedule/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteSchedule = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/schedule/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// Lateness
// ============================================================

export const getAllLatenessRule = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/lateness`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const getLatenessRule = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/lateness/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createLatenessRule = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/lateness`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateLatenessRule = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/lateness/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteLatenessRule = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/lateness/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// Holiday
// ============================================================

export const getAllHolidays = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/holidays`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const getHoliday = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/holidays/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createHoliday = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/holidays`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateHoliday = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/holidays/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteHoliday = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/holidays/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

// ============================================================
// Notification
// ============================================================

export const getAllNotification = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/notification`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return [];
  }
};

export const getNotification = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/notification/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const createNotification = async (payload: any) => {
  try {
    const { data } = await axios.post(`${BASE_URL}/notification`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const updateNotification = async (id: string, payload: any) => {
  try {
    const { data } = await axios.put(`${BASE_URL}/notification/${id}`, payload, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};

export const deleteNotification = async (id: string) => {
  try {
    const { data } = await axios.delete(`${BASE_URL}/notification/${id}`, { withCredentials: true });
    return data;
  } catch (error: any) {
    console.error("Error:", error.message);
    return null;
  }
};