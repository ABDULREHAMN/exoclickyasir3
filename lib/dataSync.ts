import { mockDashboardData } from "./mockData"

export interface ReportEntry {
  date: string
  revenue: number
  impressions: number
  clicks: number
  ecpm: number
}

export interface FilteredReportData {
  entries: ReportEntry[]
  totals: {
    revenue: number
    impressions: number
    clicks: number
    averageEcpm: number
  }
}

// Parse date string "2026-07-03" to Date object
const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number)
  return new Date(year, month - 1, day)
}

// Get current date (using last report date as reference)
const getCurrentDate = (): Date => {
  if (mockDashboardData.reports.length === 0) return new Date()
  const lastReport = mockDashboardData.reports[mockDashboardData.reports.length - 1]
  return parseDate(lastReport.date)
}

// Filter reports by time period
export const getReportsByFilter = (filter: string): FilteredReportData => {
  const currentDate = getCurrentDate()
  let filtered: ReportEntry[] = []

  switch (filter) {
    case "last_7_days": {
      const sevenDaysAgo = new Date(currentDate)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      filtered = mockDashboardData.reports.filter((r) => {
        const reportDate = parseDate(r.date)
        return reportDate >= sevenDaysAgo && reportDate <= currentDate
      })
      break
    }

    case "last_30_days": {
      const thirtyDaysAgo = new Date(currentDate)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      filtered = mockDashboardData.reports.filter((r) => {
        const reportDate = parseDate(r.date)
        return reportDate >= thirtyDaysAgo && reportDate <= currentDate
      })
      break
    }

    case "last_3_months": {
      const threeMonthsAgo = new Date(currentDate)
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      filtered = mockDashboardData.reports.filter((r) => {
        const reportDate = parseDate(r.date)
        return reportDate >= threeMonthsAgo && reportDate <= currentDate
      })
      break
    }

    case "last_6_months": {
      const sixMonthsAgo = new Date(currentDate)
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      filtered = mockDashboardData.reports.filter((r) => {
        const reportDate = parseDate(r.date)
        return reportDate >= sixMonthsAgo && reportDate <= currentDate
      })
      break
    }

    case "current_month": {
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()
      filtered = mockDashboardData.reports.filter((r) => {
        const reportDate = parseDate(r.date)
        return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear
      })
      break
    }

    case "previous_month": {
      const previousMonth = new Date(currentDate)
      previousMonth.setMonth(previousMonth.getMonth() - 1)
      const month = previousMonth.getMonth()
      const year = previousMonth.getFullYear()
      filtered = mockDashboardData.reports.filter((r) => {
        const reportDate = parseDate(r.date)
        return reportDate.getMonth() === month && reportDate.getFullYear() === year
      })
      break
    }

    default:
      // Return all reports sorted by date ascending
      filtered = [...mockDashboardData.reports]
  }

  // Calculate totals
  const totals = {
    revenue: parseFloat(filtered.reduce((sum, r) => sum + r.revenue, 0).toFixed(2)),
    impressions: filtered.reduce((sum, r) => sum + r.impressions, 0),
    clicks: filtered.reduce((sum, r) => sum + r.clicks, 0),
    averageEcpm:
      filtered.length > 0 ? parseFloat((filtered.reduce((sum, r) => sum + r.ecpm, 0) / filtered.length).toFixed(2)) : 0,
  }

  return {
    entries: filtered.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()),
    totals,
  }
}

// Get all reports (no filter)
export const getAllReports = (): FilteredReportData => {
  return getReportsByFilter("all")
}

// Get current month reports
export const getCurrentMonthReports = (): FilteredReportData => {
  return getReportsByFilter("current_month")
}

// Get previous month reports
export const getPreviousMonthReports = (): FilteredReportData => {
  return getReportsByFilter("previous_month")
}

// Get recent activity (current month only, newest first)
export const getRecentActivity = (): ReportEntry[] => {
  const currentMonthData = getCurrentMonthReports()
  return currentMonthData.entries.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime())
}

// Format report for display (add CTR and formatted strings)
export const formatReportForDisplay = (report: ReportEntry): Record<string, string | number> => {
  const ctr = report.impressions > 0 ? ((report.clicks / report.impressions) * 100).toFixed(2) : "0.00"
  return {
    date: new Date(report.date).toLocaleDateString("en-US", {
      year: "2-digit",
      month: "short",
      day: "numeric",
    }),
    impressions: report.impressions.toLocaleString(),
    clicks: report.clicks.toLocaleString(),
    ctr: `${ctr}%`,
    ecpm: `$${report.ecpm.toFixed(2)}`,
    revenue: `$${report.revenue.toFixed(2)}`,
  }
}
