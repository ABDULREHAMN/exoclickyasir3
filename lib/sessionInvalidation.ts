// Session Invalidation Utility
// Clears all old session data to force users to authenticate with new credentials

export function invalidateOldSessions() {
  // Clear old session tokens
  localStorage.removeItem("sessionToken")
  localStorage.removeItem("sessionStartTime")
  localStorage.removeItem("authCookie")
  localStorage.removeItem("isLoggedIn")
  localStorage.removeItem("username")
  
  // Clear legacy auth data
  localStorage.removeItem("userToken")
  localStorage.removeItem("authToken")
  
  // Log session invalidation
  const invalidationLog = {
    time: Date.now(),
    attempt: "All old sessions invalidated - users must sign in with new credentials"
  }
  
  const existingLog = localStorage.getItem("securityLog")
  const logs = existingLog ? JSON.parse(existingLog) : []
  logs.push(invalidationLog)
  localStorage.setItem("securityLog", JSON.stringify(logs.slice(-100)))
  
  return true
}

export function validateSession(): boolean {
  const authCookie = localStorage.getItem("authCookie")
  
  if (!authCookie) {
    return false
  }
  
  try {
    const cookie = JSON.parse(authCookie)
    const now = Date.now()
    
    // Check if session has expired
    if (now > cookie.expiresAt) {
      invalidateOldSessions()
      return false
    }
    
    return true
  } catch {
    invalidateOldSessions()
    return false
  }
}

export function clearAuthenticationCache() {
  // Clear browser cache-related auth data
  localStorage.removeItem("loginCache")
  localStorage.removeItem("credentialCache")
  localStorage.removeItem("rememberMe")
  
  // Clear all failed attempt tracking to reset with new credentials
  localStorage.removeItem("failedAttempts")
  localStorage.removeItem("loginLock")
  
  // Reset security logs
  const resetLog = {
    time: Date.now(),
    attempt: "Authentication cache cleared - ready for new credentials"
  }
  
  const existingLog = localStorage.getItem("securityLog")
  const logs = existingLog ? JSON.parse(existingLog) : []
  logs.push(resetLog)
  localStorage.setItem("securityLog", JSON.stringify(logs.slice(-100)))
}

export function confirmCredentialUpdate() {
  // This confirms that credentials have been successfully updated
  localStorage.setItem("credentialUpdateConfirmed", JSON.stringify({
    timestamp: Date.now(),
    newPasswordActive: true,
    oldPasswordDisabled: true,
    version: "AGH$&@786"
  }))
}
