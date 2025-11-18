
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { auth } from "./firebase.config";

// Sign in an admin user
export const signInAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

// Sign out the current user
export const signOutAdmin = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

// Listen for auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

