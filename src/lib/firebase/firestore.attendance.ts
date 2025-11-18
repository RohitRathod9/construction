import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "./firebase.config";
import { Attendance } from "@/lib/types";

const attendanceCollection = collection(db, "attendance");

// Get all attendance records
export const getAllAttendance = async (): Promise<Attendance[]> => {
  const querySnapshot = await getDocs(attendanceCollection);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: (data.date as Timestamp).toDate().toISOString(),
    } as Attendance;
  });
};

// Get all attendance records for a specific worker
export const getAttendanceByWorker = async (workerId: string): Promise<Attendance[]> => {
  const q = query(attendanceCollection, where("workerId", "==", workerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: (data.date as Timestamp).toDate().toISOString(),
    } as Attendance;
  });
};

// Add a new attendance record
export const addAttendance = async (attendanceData: Omit<Attendance, "id">): Promise<Attendance> => {
    const dataWithTimestamp = {
        ...attendanceData,
        date: Timestamp.fromDate(new Date(attendanceData.date)),
    };
  const docRef = await addDoc(attendanceCollection, dataWithTimestamp);
  return { id: docRef.id, ...attendanceData };
};
