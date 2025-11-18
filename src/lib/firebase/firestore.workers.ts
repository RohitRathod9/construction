import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, writeBatch, getDoc } from "firebase/firestore";
import { db } from "./firebase.config";
import { Worker } from "@/lib/types";

const workersCollection = collection(db, "workers");

// Get all workers
export const getAllWorkers = async (): Promise<Worker[]> => {
  const querySnapshot = await getDocs(workersCollection);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker));
};

// Get all workers for a specific site
export const getWorkersBySite = async (siteId: string): Promise<Worker[]> => {
  const q = query(workersCollection, where("siteId", "==", siteId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Worker));
};

// Get a single worker by ID
export const getWorkerById = async (workerId: string): Promise<Worker | null> => {
  const docRef = doc(db, "workers", workerId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Worker : null;
};

// Add a new worker to a site
export const addWorker = async (workerData: Omit<Worker, "id">): Promise<Worker> => {
  const docRef = await addDoc(workersCollection, workerData);
  return { id: docRef.id, ...workerData };
};

// Update a worker's details
export const updateWorker = async (workerId: string, updates: Partial<Worker>): Promise<void> => {
  const docRef = doc(db, "workers", workerId);
  await updateDoc(docRef, updates);
};

// Delete a worker and all their associated data (attendance, payments)
export const deleteWorker = async (workerId: string): Promise<void> => {
  const batch = writeBatch(db);

  // 1. Delete the worker document
  const workerRef = doc(db, "workers", workerId);
  batch.delete(workerRef);

  // 2. Delete associated attendance records
  const attendanceQuery = query(collection(db, "attendance"), where("workerId", "==", workerId));
  const attendanceSnapshot = await getDocs(attendanceQuery);
  attendanceSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  // 3. Delete associated payment records
  const paymentsQuery = query(collection(db, "payments"), where("workerId", "==", workerId));
  const paymentsSnapshot = await getDocs(paymentsQuery);
  paymentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  // Commit the batch
  await batch.commit();
};
