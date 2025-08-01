"use client";

import {
  MdChevronLeft,
  MdChevronRight,
  MdCalendarViewMonth,
  MdCalendarViewWeek,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import { FaRegCalendar } from "react-icons/fa";
import { TbLungsFilled } from "react-icons/tb";
import {
  processLogsForCalendar,
  groupLogsByDate,
  formatMonthYear,
  formatMonthName,
  hasDataInYear,
  hasDataInMonth,
} from "@/utils/breathingLogUtils";
import { BreathingLog } from "@/types/BreathingLogTypes";
import { useAppContext } from "@/context/Context";
import { LOG_ACTIONS } from "@/reducers/breathingLogReducer";
import Button from "../Button";
import { useState, useEffect } from "react";

type Props = {
  logs: BreathingLog[]; // Raw breathing logs
};

export default function BreathingCalendar({ logs }: Props) {
  // Get navigation state from context
  const { logState, logDispatch } = useAppContext();
  const { viewMode, selectedYear, selectedMonth } = logState;

  // State to track which days are expanded
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set()); // new Set() means that all days are hidden by default

  // Collapse all expanded days when month or year changes
  useEffect(() => {
    setExpandedDays(new Set());
  }, [selectedYear, selectedMonth]);

  // Process and group logs using shared utilities
  const processedData = processLogsForCalendar(logs);
  const dateGroups = groupLogsByDate(processedData);

  // Helper functions
  const getLowestBpm = (dayLogs: any[]) => {
    return Math.min(...dayLogs.map((log) => log.bpm));
  };

  const getDayLogs = (date: string) => {
    return dateGroups[date];
  };

  // Toggle function for expanding/collapsing days
  const toggleDayExpansion = (date: string) => {
    setExpandedDays((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  // Navigation handlers
  const handleViewModeChange = (mode: "month" | "year") => {
    logDispatch({ type: LOG_ACTIONS.SET_VIEW_MODE, payload: mode });
  };

  const handlePreviousMonth = () => {
    // Check if previous month in current year has data
    if (
      selectedMonth > 0 &&
      hasDataInMonth(selectedYear, selectedMonth - 1, dateGroups)
    ) {
      logDispatch({
        type: LOG_ACTIONS.SET_SELECTED_MONTH,
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
          logDispatch({
            type: LOG_ACTIONS.SET_SELECTED_YEAR,
            payload: prevYear,
          });
          logDispatch({
            type: LOG_ACTIONS.SET_SELECTED_MONTH,
            payload: prevYearMonths[prevYearMonths.length - 1],
          });
        }
      }
    }
  };

  const handleNextMonth = () => {
    // Check if next month in current year has data
    if (
      selectedMonth < 11 &&
      hasDataInMonth(selectedYear, selectedMonth + 1, dateGroups)
    ) {
      logDispatch({
        type: LOG_ACTIONS.SET_SELECTED_MONTH,
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
          logDispatch({
            type: LOG_ACTIONS.SET_SELECTED_YEAR,
            payload: nextYear,
          });
          logDispatch({
            type: LOG_ACTIONS.SET_SELECTED_MONTH,
            payload: nextYearMonths[0],
          });
        }
      }
    }
  };

  const handlePreviousYear = () => {
    const prevYear = selectedYear - 1;
    if (hasDataInYear(prevYear, dateGroups)) {
      logDispatch({ type: LOG_ACTIONS.SET_SELECTED_YEAR, payload: prevYear });
      // Set to first available month of previous year
      const prevYearMonths = Array.from(
        new Set(
          Object.keys(dateGroups)
            .filter((date) => new Date(date).getFullYear() === prevYear)
            .map((date) => new Date(date).getMonth())
        )
      ).sort((a, b) => a - b);

      if (prevYearMonths.length > 0) {
        logDispatch({
          type: LOG_ACTIONS.SET_SELECTED_MONTH,
          payload: prevYearMonths[0],
        });
      }
    }
  };

  const handleNextYear = () => {
    const nextYear = selectedYear + 1;
    if (hasDataInYear(nextYear, dateGroups)) {
      logDispatch({ type: LOG_ACTIONS.SET_SELECTED_YEAR, payload: nextYear });
      // Set to first available month of next year
      const nextYearMonths = Array.from(
        new Set(
          Object.keys(dateGroups)
            .filter((date) => new Date(date).getFullYear() === nextYear)
            .map((date) => new Date(date).getMonth())
        )
      ).sort((a, b) => a - b);

      if (nextYearMonths.length > 0) {
        logDispatch({
          type: LOG_ACTIONS.SET_SELECTED_MONTH,
          payload: nextYearMonths[0],
        });
      }
    }
  };

  // Filter all logs based on selected month/year and return the logs that match the selected month/year
  const getFilteredDateGroups = () => {
    if (viewMode === "month") {
      // Create an empty object to store log that match the selected month
      const filteredGroups: any = {};
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
    } else {
      // Filter for specific year
      const filteredGroups: any = {};
      Object.keys(dateGroups).forEach((date) => {
        const dateObj = new Date(date);
        if (dateObj.getFullYear() === selectedYear) {
          filteredGroups[date] = dateGroups[date];
        }
      });
      return filteredGroups;
    }
  };

  // Get year data for year view
  const getYearData = () => {
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

  return (
    <div>
      {/* View Toggle Year/Month */}
      <div className="flex flex-col justify-between mb-4">
        <div className="flex gap-2">
          <Button
            onClick={() => handleViewModeChange("month")}
            size="lg"
            variant={viewMode === "month" ? "primary" : "ghost"}
            icon={<MdCalendarViewMonth />}
            iconPosition="left"
          >
            Month
          </Button>

          <Button
            onClick={() => handleViewModeChange("year")}
            size="lg"
            variant={viewMode === "year" ? "primary" : "ghost"}
            icon={<MdCalendarViewWeek />}
            iconPosition="left"
          >
            Year
          </Button>
        </div>
      </div>

      {viewMode === "month" ? (
        <>
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6 p-3 bg-primary/5 rounded-lg">
            <Button
              onClick={handlePreviousMonth}
              icon={<MdChevronLeft />}
              iconPosition="left"
              disabled={
                !hasDataInMonth(selectedYear, selectedMonth - 1, dateGroups) &&
                !hasDataInYear(selectedYear - 1, dateGroups)
              }
              className={`text-primary !bg-transparent !border-none`}
            >
              Previous
            </Button>

            {/* Example: August 2025 */}
            <h2 className="font-semibold text-foreground">
              {formatMonthYear(selectedYear, selectedMonth)}
            </h2>

            <Button
              onClick={handleNextMonth}
              icon={<MdChevronRight />}
              disabled={
                !hasDataInMonth(selectedYear, selectedMonth + 1, dateGroups) &&
                !hasDataInYear(selectedYear + 1, dateGroups)
              }
              className={`text-primary !bg-transparent !border-none`}
            >
              Next
            </Button>
          </div>

          {/* Date Groups with logs in Month View */}
          <div>
            {Object.keys(getFilteredDateGroups()).map((date) => {
              const dayLogs = getDayLogs(date);
              const lowestBpm = getLowestBpm(dayLogs);

              return (
                <div key={date} className="mb-4">
                  {/* The whole div is a button that toggles the expansion of the day */}
                  <div
                    className="flex items-center justify-between mb-2 p-2 bg-primary/5 rounded cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => toggleDayExpansion(date)}
                  >
                    <div className="flex items-center gap-2">
                      <FaRegCalendar className="text-primary text-sm" />
                      <span className="font-medium text-foreground">
                        {date}
                      </span>
                      <span className="text-xs text-foreground/60">
                        ({dayLogs.length})
                      </span>
                      <div
                        className="flex items-center gap-1 ml-4 px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded-full relative group transition-colors duration-200"
                        // Tooltip
                        title="Lowest BPM"
                      >
                        <TbLungsFilled className="text-primary text-sm" />
                        <span className="text-sm font-semibold text-primary">
                          {lowestBpm} BPM
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {expandedDays.has(date) ? (
                        <MdExpandLess />
                      ) : (
                        <MdExpandMore />
                      )}
                    </div>
                  </div>

                  {/* If the day is expanded, show the logs */}
                  {expandedDays.has(date) && (
                    <div className="ml-4 space-y-1">
                      {dayLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center gap-3 py-1"
                        >
                          <span className="text-sm text-foreground/60 min-w-[50px]">
                            {log.time}
                          </span>
                          <div className="flex items-center gap-1">
                            <TbLungsFilled className="text-primary text-sm" />
                            <span className="text-foreground font-medium">
                              {log.bpm} BPM
                            </span>
                          </div>
                          {log.comment && (
                            <span className="text-xs text-foreground/60 truncate max-w-[200px]">
                              {log.comment}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-6 p-3 bg-primary/5 rounded-lg">
            <Button
              onClick={handlePreviousYear}
              icon={<MdChevronLeft />}
              iconPosition="left"
              disabled={!hasDataInYear(selectedYear - 1, dateGroups)}
              className={`text-primary !bg-transparent !border-none`}
            >
              Previous
            </Button>
            <h2 className="font-semibold text-foreground">{selectedYear}</h2>
            <Button
              onClick={handleNextYear}
              icon={<MdChevronRight />}
              iconPosition="left"
              disabled={!hasDataInYear(selectedYear + 1, dateGroups)}
              className={`text-primary !bg-transparent !border-none`}
            >
              Next
            </Button>
          </div>

          {/* Year Overview */}
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const yearData = getYearData();
              const monthData = yearData[monthIndex];
              const monthName = formatMonthName(selectedYear, monthIndex);

              return (
                <div
                  key={monthIndex}
                  className={`p-4 rounded-lg border transition-colors ${
                    monthData
                      ? "bg-primary/50 border-primary/20 hover:bg-primary/60 cursor-pointer"
                      : "bg-primary/5 border-primary/20"
                  }`}
                  onClick={() => {
                    if (monthData) {
                      logDispatch({
                        type: LOG_ACTIONS.SET_SELECTED_MONTH,
                        payload: monthIndex,
                      });
                      handleViewModeChange("month");
                    }
                  }}
                >
                  <h3 className="font-semibold text-foreground mb-2">
                    {monthName}
                  </h3>
                  {monthData ? (
                    <div className="space-y-1">
                      <p className="text-sm text-foreground/70">
                        {monthData.count} reading
                        {monthData.count !== 1 ? "s" : ""}
                      </p>
                      <p className="text-sm text-foreground/70">
                        Avg: {monthData.avgBpm} BPM
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/50">No data</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
