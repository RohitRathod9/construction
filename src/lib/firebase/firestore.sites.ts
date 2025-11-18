
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDoc
} from "firebase/firestore";
import { db } from "./firebase.config";

const SITES_COLLECTION = "sites";

// Get all sites
export const getSites = async () => {
  const sitesCol = collection(db, SITES_COLLECTION);
  const siteSnapshot = await getDocs(sitesCol);
  return siteSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get a single site by its ID
export const getSiteById = async (siteId) => {
  const siteRef = doc(db, SITES_COLLECTION, siteId);
  const siteSnap = await getDoc(siteRef);
  if (siteSnap.exists()) {
    return { id: siteSnap.id, ...siteSnap.data() };
  } else {
    return null;
  }
};

// Add a new site
export const addSite = async (siteData) => {
  const sitesCol = collection(db, SITES_COLLECTION);
  const docRef = await addDoc(sitesCol, siteData);
  return { id: docRef.id, ...siteData };
};

// Update an existing site
export const updateSite = async (siteId, updatedData) => {
  const siteRef = doc(db, SITES_COLLECTION, siteId);
  await updateDoc(siteRef, updatedData);
};

// Delete a site
export const deleteSite = async (siteId) => {
  // Note: This does not delete subcollections like workers.
  // A Cloud Function is required for recursive deletes.
  await deleteDoc(doc(db, SITES_COLLECTION, siteId));
};

