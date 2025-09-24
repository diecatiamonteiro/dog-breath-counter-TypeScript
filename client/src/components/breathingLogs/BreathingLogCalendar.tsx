/**
 * @file client/src/components/breathingLogs/BreathingLogCalendar.tsx
 * @description Calendar view for breathing logs.
 *              Includes:
 *                - Month view: groups logs by date, expandable to show daily entries
 *                  with time, BPM, and optional comments (with delete support).
 *                - Year view: shows per-month summaries (count, avg BPM) and allows
 *                  navigation into a month.
 */

"use client";

import {
  processLogsForCalendar,
  groupLogsByDate,
  formatMonthName,
  ProcessedLogForCalendar,
} from "@/utils/breathingLogUtils";
import {
  filterLogsByMonth,
  filterLogsByYear,
  calculateYearlySummary,
} from "@/utils/breathingLogNavigationUtils";
import { BreathingLog } from "@/types/BreathingLogTypes";
import { useAppContext } from "@/context/Context";
import { LOG_ACTIONS } from "@/reducers/breathingLogReducer";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { RiDeleteBin7Line } from "react-icons/ri";
import { MdExpandMore, MdExpandLess } from "react-icons/md";

type Props = {
  logs: BreathingLog[]; // Raw breathing logs
  onDeleteLog?: (logId: string) => void;
};

export default function BreathingCalendar({ logs, onDeleteLog }: Props) {
  // Get navigation state from context (shared with chart)
  const { logState, logDispatch } = useAppContext();
  const { viewMode, selectedYear, selectedMonth } = logState;

  // State to track which days are expanded
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set()); // new Set() means that all days are hidden by default

  // Collapse all expanded days when user navigates to a new month or year
  useEffect(() => {
    setExpandedDays(new Set());
  }, [selectedYear, selectedMonth]);

  // Process and group logs using shared utilities
  const processedData = processLogsForCalendar(logs);
  const dateGroups = groupLogsByDate(processedData);

  // Helper functions
  const getLowestBpm = (dayLogs: ProcessedLogForCalendar[]) => {
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

  // Filter all logs based on selected month/year and return the logs that match the selected month/year
  const getLogsForCurrentPeriod = () => {
    if (viewMode === "month") {
      return filterLogsByMonth(dateGroups, selectedYear, selectedMonth);
    } else {
      return filterLogsByYear(dateGroups, selectedYear);
    }
  };

  // Get year data for year view
  const getMonthlySummaryForYear = () => {
    return calculateYearlySummary(dateGroups, selectedYear);
  };

  return (
    <div>
      {viewMode === "month" ? (
        <>
          {/* Date Groups with logs in Month View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2 xl:gap-3">
            {Object.keys(getLogsForCurrentPeriod()).map((date) => {
              const dayLogs = getDayLogs(date);
              const lowestBpm = getLowestBpm(dayLogs);
              const isExpanded = expandedDays.has(date);

              return (
                <div key={date} className="">
                  {/* The whole div is a button that toggles the expansion of the day */}
                  <div
                    className="flex items-center justify-between p-2 bg-primary/5 border border-primary/20 rounded cursor-pointer hover:bg-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-main-text-bg"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-controls={`day-panel-${date}`}
                    onClick={() => toggleDayExpansion(date)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleDayExpansion(date);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm md:text-base font-medium text-foreground">
                        {date}
                      </span>
                      <span className="text-xs text-foreground/60">
                        {dayLogs.length} log
                        {dayLogs.length !== 1 ? "s " : ""}
                      </span>
                      <div
                        className="flex items-center gap-1 ml-1 md:ml-2 px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded-full relative group transition-colors duration-200"
                        // Tooltip
                        title="Lowest BPM"
                      >
                        <span className="text-xs md:text-sm font-semibold text-primary">
                          {lowestBpm} BPM (min)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {expandedDays.has(date) ? (
                        <MdExpandLess aria-hidden="true" />
                      ) : (
                        <MdExpandMore aria-hidden="true" />
                      )}
                    </div>
                  </div>

                  {/* If the day is expanded, show the logs */}
                  {expandedDays.has(date) && (
                    <div id={`day-panel-${date}`} className="ml-3 md:ml-4">
                      {dayLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-center py-1 justify-between group rounded transition-all duration-200 has-[button:hover]:bg-accent/5"
                        >
                          <div className="flex items-center">
                            <span className="text-xs text-foreground/60 min-w-[40px]">
                              {log.time}
                            </span>
                            <div className="flex items-center mr-2">
                              <span className="text-foreground font-medium">
                                {log.bpm} BPM
                              </span>
                            </div>
                            {log.comment && (
                              <span className="text-xs text-foreground/60 truncate max-w-[120px]">
                                {log.comment}
                              </span>
                            )}
                          </div>

                          {onDeleteLog && (
                            <Button
                              iconOnly
                              onClick={(e) => {
                                e?.stopPropagation();
                                onDeleteLog(log.id);
                              }}
                              icon={
                                <RiDeleteBin7Line
                                  className="w-4 h-4"
                                  aria-hidden="true"
                                />
                              }
                              ariaLabel="Delete breathing log"
                              title="Delete log"
                              variant="dangerGhost"
                              size="xs"
                              shape="square"
                              className="group-hover:bg-accent/20 group-hover:text-accent"
                            />
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
          {/* Year Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2  xl:grid-cols-3 2xl:grid-cols-4 gap-2 lg:gap-3">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const yearData = getMonthlySummaryForYear();
              const monthData = yearData[monthIndex];
              const monthName = formatMonthName(selectedYear, monthIndex);

              return (
                <div
                  key={monthIndex}
                  className={`py-1.5 px-3 md:p-4 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-main-text-bg ${
                    monthData
                      ? "bg-primary/50 border-primary/20 hover:bg-primary/60 cursor-pointer"
                      : "bg-primary/5 border-primary/20"
                  }`}
                  role={monthData ? "button" : undefined}
                  tabIndex={monthData ? 0 : -1}
                  aria-disabled={!monthData}
                  aria-label={
                    monthData
                      ? `View ${monthName} logs`
                      : `No logs for ${monthName}`
                  }
                  onClick={() => {
                    if (monthData) {
                      logDispatch({
                        type: LOG_ACTIONS.SET_SELECTED_MONTH,
                        payload: monthIndex,
                      });
                      logDispatch({
                        type: LOG_ACTIONS.SET_VIEW_MODE,
                        payload: "month",
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (!monthData) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      logDispatch({
                        type: LOG_ACTIONS.SET_SELECTED_MONTH,
                        payload: monthIndex,
                      });
                      logDispatch({
                        type: LOG_ACTIONS.SET_VIEW_MODE,
                        payload: "month",
                      });
                    }
                  }}
                >
                  {monthData ? (
                    <div className="flex flex-row items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        {monthName}
                      </h3>
                      <div className="flex flex-wrap gap-1 items-center">
                        <p className="text-sm text-foreground/70">
                          {monthData.count} Log
                          {monthData.count !== 1 ? "s " : ""}
                        </p>
                        <p className="text-sm text-foreground/70">|</p>
                        <p className="text-sm text-foreground/70">
                          {monthData.avgBpm}{" "}
                          <span className="text-xs">BPM (avg)</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-row items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        {monthName}
                      </h3>
                      <p className="text-sm text-foreground/50">No logs</p>
                    </div>
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
