/**
 * User Helper Functions
 */

/**
 * Get current user from localStorage
 * @returns {Object|null} Current user object or null
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  
  try {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Failed to get current user:", error);
  }
  return null;
}

/**
 * Get user profile URL
 * @param {string} username - Username
 * @returns {string} Profile URL
 */
export function getUserProfileUrl(username) {
  return `/${username}`;
}

/**
 * Get admin URL for user
 * @param {string} username - Username
 * @returns {string} Admin URL
 */
export function getAdminUrl(username) {
  return `/${username}/admin`;
}

