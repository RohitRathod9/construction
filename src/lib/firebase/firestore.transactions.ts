
import { 
  doc,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { db } from "./firebase.config";
import { calculateHours } from "../utils/dateUtils"; 

// --- Attendance --- 

export const addAttendanceAndupdatePendingAmount = async (siteId, workerId, attendanceData) => {
  const workerRef = doc(db, "sites", siteId, "workers", workerId);
  const attendanceCol = collection(db, "sites", siteId, "workers", workerId, "attendance");

  // Check for duplicate attendance on the same date
  const q = query(attendanceCol, where("date", "==", attendanceData.date));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    throw new Error(`Attendance for this date already exists.`);
  }

  await runTransaction(db, async (transaction) => {
    const workerDoc = await transaction.get(workerRef);
    if (!workerDoc.exists()) {
      throw "Worker does not exist!";
    }

    const workerData = workerDoc.data();
    const hoursWorked = calculateHours(attendanceData.checkInTime, attendanceData.checkOutTime);
    const dailyWage = workerData.wageType === 'daily' ? workerData.wageAmount : hoursWorked * workerData.wageAmount;

    const newPendingAmount = (workerData.pendingAmount || 0) + dailyWage;

    // Add new attendance record
    const newAttendanceRef = doc(attendanceCol);
    transaction.set(newAttendanceRef, { ...attendanceData, dailyWage });

    // Update worker's pending amount
    transaction.update(workerRef, { pendingAmount: newPendingAmount });
  });
};

// --- Payments ---

export const addPaymentAndUpdateBalances = async (siteId, workerId, paymentData) => {
  const workerRef = doc(db, "sites", siteId, "workers", workerId);
  
  await runTransaction(db, async (transaction) => {
    const workerDoc = await transaction.get(workerRef);
    if (!workerDoc.exists()) {
      throw "Worker does not exist!";
    }

    const workerData = workerDoc.data();
    const paymentAmount = paymentData.amount;

    if (paymentAmount > workerData.pendingAmount) {
      throw new Error("Payment amount cannot exceed the pending amount.");
    }

    const newPendingAmount = workerData.pendingAmount - paymentAmount;
    const newPaidAmount = (workerData.paidAmount || 0) + paymentAmount;
    
    // Add new payment record
    const newPaymentRef = doc(collection(db, "sites", siteId, "workers", workerId, "payments"));
    transaction.set(newPaymentRef, paymentData);

    // Update worker's pending and paid amounts
    transaction.update(workerRef, { 
      pendingAmount: newPendingAmount,
      paidAmount: newPaidAmount
    });
  });
};

