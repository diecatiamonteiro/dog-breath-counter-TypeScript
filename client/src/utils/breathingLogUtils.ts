/**
 * @file breathingLogUtils.ts
 * @description Utility functions for processing breathing logs
 *              Used in the breathingChart and breathingCalendar components
 */

import { BreathingLog } from "@/types/BreathingLogTypes";

export type ProcessedLogForCalendar = {
  id: string;
  dateLong: string;
  time: string;
  bpm: number;
  comment?: string;
};

// ============================================================================
// DATE FORMATTING UTILITIES
// ============================================================================

// Format date as "DD MMM YY" (e.g., "15 Jan 25")
export const formatDateShortYear = (date: string) => {
  return new Date(date).toLocaleDateString("en-UK", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

// Format date as "DD MMM YYYY" (e.g., "15 Jan 2025"
export const formatDateLongYear = (date: string) => {
  return new Date(date).toLocaleDateString("en-UK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format month and year as "Month YYYY" (e.g., "January 2025")
export const formatMonthYear = (year: number, month: number) => {
  return new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

// Format month name only as "MMM" (e.g., "Jan")
export const formatMonthName = (year: number, monthIndex: number) => {
  return new Date(year, monthIndex).toLocaleDateString("en-US", {
    month: "short",
  });
};

  // Format date labels to show only day number
export const formatDateChartLabel = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.getDate().toString(); // Just the day number
}

// Format time as "HH:MM" (e.g., "14:30")
export const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("en-UK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============================================================================
// DATA PROCESSING UTILITIES
// ============================================================================

/**
 * Process raw breathing logs for chart display
 * Returns sorted, filtered logs with formatted dates and chart-specific data
 */
export const processLogsForChart = (logs: BreathingLog[]) => {
  const sortedLogs = logs.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return sortedLogs
    .filter((log) => log.bpm > 0)
    .map((log, index) => ({
      id: log.id,
      dateShort: formatDateShortYear(log.createdAt),
      dateLong: formatDateLongYear(log.createdAt),
      time: formatTime(log.createdAt),
      bpm: log.bpm,
      comment: log.comment,
      log: log,
      index: index,
    }));
};

/**
 * Process raw breathing logs for calendar display
 * Returns filtered logs with formatted dates for calendar view
 */
export const processLogsForCalendar = (
  logs: BreathingLog[]
): ProcessedLogForCalendar[] => {
  return logs
    .filter((log) => log.bpm > 0)
    .map((log) => ({
      id: log.id,
      dateLong: formatDateLongYear(log.createdAt),
      time: formatTime(log.createdAt),
      bpm: log.bpm,
      comment: log.comment,
    }));
};

/**
 * Group processed logs by date for calendar display
 * Returns object with dates as keys and arrays of logs as values
 */
export const groupLogsByDate = (processedData: ProcessedLogForCalendar[]) => {
  return processedData.reduce((grouped, log) => {
    const date = log.dateLong;
    grouped[date] = grouped[date] || [];
    grouped[date].push(log);
    return grouped;
  }, {} as Record<string, ProcessedLogForCalendar[]>);
};

// ============================================================================
// NAVIGATION UTILITIES
// ============================================================================

/**
 * Check if data exists for a specific year
 * Returns true if any logs exist for the given year
 */
export const hasDataInYear = (year: number, dateGroups: Record<string, ProcessedLogForCalendar[]>) => {
  return Object.keys(dateGroups).some(date => new Date(date).getFullYear() === year);
};

/**
 * Check if data exists for a specific month and year
 * Returns true if any logs exist for the given month/year combination
 */
export const hasDataInMonth = (year: number, month: number, dateGroups: Record<string, ProcessedLogForCalendar[]>) => {
  return Object.keys(dateGroups).some(date => {
    const dateObj = new Date(date);
    return dateObj.getFullYear() === year && dateObj.getMonth() === month;
  });
};

// ============================================================================
// CHART DATA FILTERING UTILITIES
// ============================================================================

/**
 * Filter data for chart display based on view mode and selected period
 * Returns filtered data with appropriate limits for chart visualization
 */
export const getFilteredDataForChart = (
  processedData: ReturnType<typeof processLogsForChart>,
  viewMode: "month" | "year",
  selectedYear: number,
  selectedMonth: number
) => {
  if (viewMode === "month") {
    // For month view, show all data for the selected month
    const monthData = processedData.filter((log) => {
      const logDate = new Date(log.log.createdAt);
      return (
        logDate.getFullYear() === selectedYear &&
        logDate.getMonth() === selectedMonth
      );
    });
    // Limit to last 30 entries to prevent overcrowding
    return monthData.slice(-30);
  } else {
    // For year view, show all data for the selected year
    const yearData = processedData.filter((log) => {
      const logDate = new Date(log.log.createdAt);
      return logDate.getFullYear() === selectedYear;
    });
    // Limit to last 50 entries for year view
    return yearData.slice(-50);
  }
};
