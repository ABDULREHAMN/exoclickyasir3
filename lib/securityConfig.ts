// Security Configuration for ExoClick Publisher Dashboard
// Last Updated: June 2026

export const securityConfig = {
  // Authentication Settings
  authentication: {
    active_password: "AGH$&@786",
    disable_old_passwords: true,
    old_passwords_list: ["ABR$786@"],
    username: "yasirali009",
  },

  // Security Policies
  security: {
    // Failed Login Attempt Handling
    max_failed_attempts: 3,
    failed_attempt_window: 15 * 60 * 1000, // 15 minutes in milliseconds

    // Account Protection
    action_after_limit: {
      temporary_account_protection: true,
      temporary_ip_block: true,
      account_lock_duration: 15 * 60 * 1000, // 15 minutes
    },

    // Logging
    log_failed_attempts: true,
    log_security_events: true,
    max_log_entries: 100,
  },

  // Data Preservation
  preserve: {
    dashboard_data: true,
    payment_history: true,
    reports: true,
    user_settings: true,
    all_other_sections: true,
  },

  // Security Event Types
  eventTypes: {
    SUCCESSFUL_LOGIN: "Successful login",
    FAILED_LOGIN: "Failed login attempt",
    OLD_PASSWORD_ATTEMPT: "Old password attempt",
    ACCOUNT_LOCKED: "Account locked - protection activated",
    ACCOUNT_UNLOCKED: "Account unlocked",
    MAX_ATTEMPTS_REACHED: "Max failed attempts reached",
  },
}

export type SecurityLog = {
  time: number
  attempt: string
  ip?: string
  eventType?: keyof typeof securityConfig.eventTypes
}

export type LoginLockData = {
  lockedUntil: number
  failedAttempts: number
  reason: string
}
