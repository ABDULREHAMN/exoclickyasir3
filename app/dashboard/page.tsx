"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Dashboard } from "@/components/dashboard"

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Comprehensive session and authentication check
    const validateSession = () => {
      // Check if user is logged in
      const isLoggedIn = localStorage.getItem("isLoggedIn")
      const sessionToken = localStorage.getItem("sessionToken")
      const authCookie = localStorage.getItem("authCookie")
      
      // If any required auth data is missing, redirect to login
      if (isLoggedIn !== "true" || !sessionToken || !authCookie) {
        // Clear stale auth data
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("sessionToken")
        localStorage.removeItem("username")
        localStorage.removeItem("authCookie")
        localStorage.removeItem("sessionStartTime")
        
        router.push("/login")
        return false
      }
      
      // Validate auth cookie structure and expiration
      try {
        const cookie = JSON.parse(authCookie)
        if (!cookie.token || !cookie.expiresAt) {
          throw new Error("Invalid cookie structure")
        }
        
        // Check if session has expired
        if (Date.now() > cookie.expiresAt) {
          // Session expired - clear all auth data
          localStorage.removeItem("isLoggedIn")
          localStorage.removeItem("sessionToken")
          localStorage.removeItem("username")
          localStorage.removeItem("authCookie")
          localStorage.removeItem("sessionStartTime")
          
          router.push("/login")
          return false
        }
        
        // Verify session token matches cookie token
        if (sessionToken !== cookie.token) {
          throw new Error("Session token mismatch")
        }
      } catch (error) {
        // Invalid cookie - clear all auth data and redirect
        localStorage.removeItem("isLoggedIn")
        localStorage.removeItem("sessionToken")
        localStorage.removeItem("username")
        localStorage.removeItem("authCookie")
        localStorage.removeItem("sessionStartTime")
        
        router.push("/login")
        return false
      }
      
      return true
    }
    
    // Perform initial validation
    const isValid = validateSession()
    if (isValid) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
    
    // Setup periodic session validation
    const interval = setInterval(() => {
      validateSession()
    }, 60000) // Check every minute
    
    return () => clearInterval(interval)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-[#0088cc] border-t-transparent rounded-full" />
          </div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return <Dashboard />
}
