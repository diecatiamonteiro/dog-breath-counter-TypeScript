import { MdAccessTime, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { FaRegCalendar, FaRegComment } from "react-icons/fa";
import { TbLungsFilled } from "react-icons/tb";
import {
  processLogsForCalendar,
  groupLogsByDate,
} from "@/utils/breathingLogUtils";
import { BreathingLog } from "@/types/BreathingLogTypes";

type Props = {
  logs: BreathingLog[]; // Raw breathing logs
};

export default function Calendar({ logs }: Props) {
  // Process and group logs using shared utilities
  const processedData = processLogsForCalendar(logs);
  const dateGroups = groupLogsByDate(processedData);

  // Get current month/year for navigation
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Helper functions
  const getMonthDisplay = () => {
    return new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getLowestBpm = (dayLogs: any[]) => {
    return Math.min(...dayLogs.map(log => log.bpm));
  };

  const getDateKeys = () => {
    return Object.keys(dateGroups);
  };

  const getDayLogs = (date: string) => {
    return dateGroups[date];
  };

  // Single return with all JSX
  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 p-3 bg-primary/5 rounded-lg">
        <button className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors">
          <MdChevronLeft />
          <span>Previous</span>
        </button>
        <h2 className="font-semibold text-foreground">{getMonthDisplay()}</h2>
        <button className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors">
          <span>Next</span>
          <MdChevronRight />
        </button>
      </div>

      {/* Date Groups */}
      <div>
        {getDateKeys().map((date) => {
          const dayLogs = getDayLogs(date);
          const lowestBpm = getLowestBpm(dayLogs);

          return (
            <div key={date} className="mb-4">
              <div className="flex items-center gap-2 mb-2 p-2 bg-primary/5 rounded">
                <FaRegCalendar className="text-primary text-sm" />
                <span className="font-medium text-foreground">{date}</span>
                <span className="text-xs text-foreground/60">({dayLogs.length})</span>
                <span className="text-xs text-foreground/60">Lowest: {lowestBpm} BPM</span>
              </div>

              <div className="ml-4 space-y-1">
                {dayLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 py-1">
                    <span className="text-sm text-foreground/60 min-w-[50px]">{log.time}</span>
                    <div className="flex items-center gap-1">
                      <TbLungsFilled className="text-primary text-sm" />
                      <span className="font-medium text-foreground">{log.bpm} BPM</span>
                    </div>
                    {log.comment && (
                      <span className="text-xs text-foreground/60 truncate max-w-[200px]">
                        {log.comment}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
