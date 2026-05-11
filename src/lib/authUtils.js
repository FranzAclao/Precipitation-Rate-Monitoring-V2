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

/**
 * Get current user's display name or email
 */
export function getUserDisplayName(user) {
  return user?.displayName || user?.email?.split("@")[0] || "User";
}

/**
 * Check if user is admin (can be extended based on custom claims)
 * For now, returns false - you'll customize this later
 */
export function isUserAdmin(user) {
  // TODO: Implement custom claims verification from Firebase
  return false;
}
