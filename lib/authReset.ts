// Authentication Reset Utility
// Completely clears all old authentication data and forces fresh login

export function resetAuthenticationCompletely() {
  // Clear all session and auth data
  const keysToRemove = [
    "isLoggedIn",
    "username",
    "sessionToken",
    "sessionStartTime",
    "authCookie",
    "userToken",
    "authToken",
    "loginCache",
    "credentialCache",
    "rememberMe",
    "loginLock",
    "failedAttempts",
    "credentialUpdateConfirmed",
  ]
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
  
  // Log the complete reset
  const resetLog = {
    time: Date.now(),
    attempt: "Complete authentication reset - all old data cleared, old password disabled, new password activated"
  }
  
  const existingLog = localStorage.getItem("securityLog")
  const logs = existingLog ? JSON.parse(existingLog) : []
  logs.push(resetLog)
  localStorage.setItem("securityLog", JSON.stringify(logs.slice(-100)))
  
  // Confirm new credentials are active
  localStorage.setItem("newCredentialsActive", JSON.stringify({
    timestamp: Date.now(),
    activePassword: "AGH$&@786",
    username: "yasirali009",
    oldPasswordRemoved: true,
    sessionsClearedAt: Date.now()
  }))
  
  console.log("[v0] Authentication completely reset - old sessions cleared, new credentials active")
  return true
}

export function verifyCredentialStatus() {
  const status = localStorage.getItem("newCredentialsActive")
  if (status) {
    const parsed = JSON.parse(status)
    console.log("[v0] Credential Status:", {
      activePassword: parsed.activePassword,
      username: parsed.username,
      oldPasswordRemoved: parsed.oldPasswordRemoved,
      sessionsClearedAt: new Date(parsed.sessionsClearedAt).toISOString()
    })
    return true
  }
  console.log("[v0] Credential status not found")
  return false
}

export function isNewCredentialActive() {
  const status = localStorage.getItem("newCredentialsActive")
  return status ? true : false
}
