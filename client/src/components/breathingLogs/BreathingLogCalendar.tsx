"use client";

import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { FaRegCalendar } from "react-icons/fa";
import { TbLungsFilled } from "react-icons/tb";
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
import { RiDeleteBin7Line } from "react-icons/ri";

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.keys(getLogsForCurrentPeriod()).map((date) => {
              const dayLogs = getDayLogs(date);
              const lowestBpm = getLowestBpm(dayLogs);

              return (
                <div key={date} className="mb-4">
                  {/* The whole div is a button that toggles the expansion of the day */}
                  <div
                    className="flex items-center justify-between mb-2 p-2  bg-primary/5 border border-primary/20 rounded cursor-pointer hover:bg-primary/10 transition-colors"
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
                          className="flex items-center p-1.5 justify-between group rounded transition-all duration-200 has-[button:hover]:bg-accent/5"
                          >
                          <div className="flex items-center">
                            <span className="text-sm text-foreground/60 min-w-[50px]">
                              {log.time}
                            </span>
                            <div className="flex items-center mr-2">
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

                          {onDeleteLog && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteLog(log.id);
                              }}
                              className="p-1 text-accent/50 hover:text-accent hover:bg-accent/10 rounded-lg transition-all duration-200 border border-transparent hover:border-accent/20 cursor-pointer flex-shrink-0 group-hover:bg-accent/20 group-hover:text-accent"

                              title="Delete log"
                            >
                              <RiDeleteBin7Line className="w-4 h-4" />
                            </button>
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
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const yearData = getMonthlySummaryForYear();
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
                      logDispatch({
                        type: LOG_ACTIONS.SET_VIEW_MODE,
                        payload: "month",
                      });
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
                        Average: {monthData.avgBpm} BPM
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
