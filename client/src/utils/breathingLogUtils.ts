import { BreathingLog } from "@/types/BreathingLogTypes";

// Types for processed data
export type ProcessedLogForCalendar = {
  id: string;
  dateLong: string;
  time: string;
  bpm: number;
  comment?: string;
};

// Helper functions for consistent date and time formatting
export const formatDateShortYear = (date: string) => {
  return new Date(date).toLocaleDateString("en-UK", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

export const formatDateLongYear = (date: string) => {
  return new Date(date).toLocaleDateString("en-UK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString("en-UK", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Process logs for chart data
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

// Process logs for calendar display
export const processLogsForCalendar = (logs: BreathingLog[]): ProcessedLogForCalendar[] => {
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

// Group logs by date
export const groupLogsByDate = (processedData: ProcessedLogForCalendar[]) => {
  return processedData.reduce((grouped, log) => {
    const date = log.dateLong;
    grouped[date] = grouped[date] || [];
    grouped[date].push(log);
    return grouped;
  }, {} as Record<string, ProcessedLogForCalendar[]>);
}; 