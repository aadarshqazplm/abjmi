import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

import { auth } from "./firebase";

/**
 * Login using Email & Password
 */
export const login = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return userCredential.user;
};

/**
 * Logout Current User
 */
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Listen to Authentication Changes
 */
export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};