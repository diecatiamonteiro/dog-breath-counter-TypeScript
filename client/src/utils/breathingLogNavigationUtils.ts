/**
 * @file breathingLogNavigationUtils.ts
 * @description Shared navigation utilities for breathing log components
 *              Used by both BreathingCalendar and BreathingChart components
 */

import {
  ProcessedLogForCalendar,
  hasDataInMonth,
  hasDataInYear,
} from "./breathingLogUtils";

// ============================================================================
// NAVIGATION HANDLERS
// ============================================================================

/**
 * Smart navigation to previous month
 * Handles year transitions when no data exists in current year
 */
export const navigateToPreviousMonth = (
  selectedYear: number,
  selectedMonth: number,
  dateGroups: Record<string, ProcessedLogForCalendar[]>,
  dispatch: (action: any) => void // generic dispatch function (any action can be handled)
) => {
  // Check if previous month in current year has data
  if (
    selectedMonth > 0 &&
    hasDataInMonth(selectedYear, selectedMonth - 1, dateGroups)
  ) {
    dispatch({
      type: "SET_SELECTED_MONTH",
      payload: selectedMonth - 1,
    });
  } else {
    // Check if previous year has data
    const prevYear = selectedYear - 1;
    if (hasDataInYear(prevYear, dateGroups)) {
      // Find the last month with data in previous year
      const prevYearMonths = Array.from(
        new Set(
          Object.keys(dateGroups)
            .filter((date) => new Date(date).getFullYear() === prevYear)
            .map((date) => new Date(date).getMonth())
        )
      ).sort((a, b) => a - b);

      if (prevYearMonths.length > 0) {
        dispatch({
          type: "SET_SELECTED_YEAR",
          payload: prevYear,
        });
        dispatch({
          type: "SET_SELECTED_MONTH",
          payload: prevYearMonths[prevYearMonths.length - 1],
        });
      }
    }
  }
};

/**
 * Smart navigation to next month
 * Handles year transitions when no data exists in current year
 */
export const navigateToNextMonth = (
  selectedYear: number,
  selectedMonth: number,
  dateGroups: Record<string, ProcessedLogForCalendar[]>,
  dispatch: (action: any) => void
) => {
  // Check if next month in current year has data
  if (
    selectedMonth < 11 &&
    hasDataInMonth(selectedYear, selectedMonth + 1, dateGroups)
  ) {
    dispatch({
      type: "SET_SELECTED_MONTH",
      payload: selectedMonth + 1,
    });
  } else {
    // Check if next year has data
    const nextYear = selectedYear + 1;
    if (hasDataInYear(nextYear, dateGroups)) {
      // Find the first month with data in next year
      const nextYearMonths = Array.from(
        new Set(
          Object.keys(dateGroups)
            .filter((date) => new Date(date).getFullYear() === nextYear)
            .map((date) => new Date(date).getMonth())
        )
      ).sort((a, b) => a - b);

      if (nextYearMonths.length > 0) {
        dispatch({
          type: "SET_SELECTED_YEAR",
          payload: nextYear,
        });
        dispatch({
          type: "SET_SELECTED_MONTH",
          payload: nextYearMonths[0],
        });
      }
    }
  }
};

/**
 * Smart navigation to previous year
 * Sets to first available month of previous year
 */
export const navigateToPreviousYear = (
  selectedYear: number,
  dateGroups: Record<string, ProcessedLogForCalendar[]>,
  dispatch: (action: any) => void
) => {
  const prevYear = selectedYear - 1;
  if (hasDataInYear(prevYear, dateGroups)) {
    dispatch({ type: "SET_SELECTED_YEAR", payload: prevYear });
    // Set to first available month of previous year
    const prevYearMonths = Array.from(
      new Set(
        Object.keys(dateGroups)
          .filter((date) => new Date(date).getFullYear() === prevYear)
          .map((date) => new Date(date).getMonth())
      )
    ).sort((a, b) => a - b);

    if (prevYearMonths.length > 0) {
      dispatch({
        type: "SET_SELECTED_MONTH",
        payload: prevYearMonths[0],
      });
    }
  }
};

/**
 * Smart navigation to next year
 * Sets to first available month of next year
 */
export const navigateToNextYear = (
  selectedYear: number,
  dateGroups: Record<string, ProcessedLogForCalendar[]>,
  dispatch: (action: any) => void
) => {
  const nextYear = selectedYear + 1;
  if (hasDataInYear(nextYear, dateGroups)) {
    dispatch({ type: "SET_SELECTED_YEAR", payload: nextYear });
    // Set to first available month of next year
    const nextYearMonths = Array.from(
      new Set(
        Object.keys(dateGroups)
          .filter((date) => new Date(date).getFullYear() === nextYear)
          .map((date) => new Date(date).getMonth())
      )
    ).sort((a, b) => a - b);

    if (nextYearMonths.length > 0) {
      dispatch({
        type: "SET_SELECTED_MONTH",
        payload: nextYearMonths[0],
      });
    }
  }
};

// ============================================================================
// DATA FILTERING UTILITIES
// ============================================================================

/**
 * Filter date groups based on selected month for calendar view
 */
export const filterLogsByMonth = (
  dateGroups: Record<string, ProcessedLogForCalendar[]>,
  selectedYear: number,
  selectedMonth: number
) => {
  // Create an empty object to store logs that match the selected month
  const filteredGroups: Record<string, ProcessedLogForCalendar[]> = {};
  // Loop through each key date in the dateGroups object (each key is a date string, eg "2025-08-01")
  Object.keys(dateGroups).forEach((date) => {
    // Convert the date string to a date object so we can use the getFullYear and getMonth methods
    const dateObj = new Date(date);
    if (
      dateObj.getFullYear() === selectedYear &&
      dateObj.getMonth() === selectedMonth
    ) {
      // If yes, copy log(s) of this date into the filteredGroups object
      filteredGroups[date] = dateGroups[date];
    }
  });
  return filteredGroups; // logs that match the selected month
};

/**
 * Filter date groups based on selected year for year view
 */
export const filterLogsByYear = (
  dateGroups: Record<string, ProcessedLogForCalendar[]>,
  selectedYear: number
) => {
  const filteredGroups: Record<string, ProcessedLogForCalendar[]> = {};
  Object.keys(dateGroups).forEach((date) => {
    const dateObj = new Date(date);
    if (dateObj.getFullYear() === selectedYear) {
      filteredGroups[date] = dateGroups[date];
    }
  });
  return filteredGroups;
};

/**
 * Get year data for year view (monthly summaries)
 */
export const calculateYearlySummary = (
  dateGroups: Record<string, ProcessedLogForCalendar[]>,
  selectedYear: number
) => {
  // Create an empty object to store the year data. Each key is a month (0-11) and the value is an object with count and avgBpm properties
  const yearData: { [key: number]: { count: number; avgBpm: number } } = {};

  Object.keys(dateGroups).forEach((date) => {
    const dateObj = new Date(date);
    // Only continue if the year of the date is the same as the selected year
    if (dateObj.getFullYear() === selectedYear) {
      // Get the month of the date (0 = Jan, 1 = Feb, ..., 11 = Dec).
      const month = dateObj.getMonth();
      // Get the logs for the date (an array of logs for the date)
      const dayLogs = dateGroups[date];

      // If we haven’t added anything yet for this month, initialize it with count 0 and avgBpm 0.
      if (!yearData[month]) {
        yearData[month] = { count: 0, avgBpm: 0 };
      }

      // Increase the count for this month by the number of logs on that day
      yearData[month].count += dayLogs.length;
      // Calculate the average BPM for the month and store it in avgBpm
      yearData[month].avgBpm = Math.round(
        dayLogs.reduce((sum, log) => sum + log.bpm, 0) / dayLogs.length
      );
    }
  });

  return yearData;
};
