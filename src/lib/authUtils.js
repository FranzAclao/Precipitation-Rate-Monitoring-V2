import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Auth utility functions for common operations
 */

/**
 * Logout current user
 */
export async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function getUserDisplayName(user) {
  return user?.displayName || user?.email?.split("@")[0] || "User";
}


export function isUserAdmin(user) {
  // TODO: Implement custom claims verification from Firebase
  return false;
}
