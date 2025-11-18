import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "./firebase.config";
import { Payment } from "@/lib/types";

const paymentsCollection = collection(db, "payments");

// Get all payment records
export const getAllPayments = async (): Promise<Payment[]> => {
  const querySnapshot = await getDocs(paymentsCollection);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: (data.date as Timestamp).toDate().toISOString(),
    } as Payment;
  });
};

// Get all payment records for a specific worker
export const getPaymentsByWorker = async (workerId: string): Promise<Payment[]> => {
  const q = query(paymentsCollection, where("workerId", "==", workerId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: (data.date as Timestamp).toDate().toISOString(),
    } as Payment;
  });
};

// Add a new payment record
export const addPayment = async (paymentData: Omit<Payment, "id">): Promise<Payment> => {
    const dataWithTimestamp = {
        ...paymentData,
        date: Timestamp.fromDate(new Date(paymentData.date)),
    };
  const docRef = await addDoc(paymentsCollection, dataWithTimestamp);
  return { id: docRef.id, ...paymentData };
};
