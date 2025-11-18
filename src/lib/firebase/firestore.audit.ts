import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase.config';
import { AuditLog } from '@/lib/types';

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const auditCollection = collection(db, 'auditLogs');
  const q = query(auditCollection, orderBy('timestamp', 'desc'));
  const auditSnapshot = await getDocs(q);
  return auditSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }) as AuditLog);
};