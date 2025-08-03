import { useAppContext } from "@/context/Context";
import { LOG_ACTIONS } from "@/reducers/breathingLogReducer";
import { BreathingLog } from "@/types/BreathingLogTypes";
import {
  navigateToNextMonth,
  navigateToNextYear,
  navigateToPreviousMonth,
  navigateToPreviousYear,
} from "@/utils/breathingLogNavigationUtils";
import {
  groupLogsByDate,
  processLogsForChart,
  formatMonthYear,
} from "@/utils/breathingLogUtils";
import Button from "../Button";
import {
  MdChevronLeft,
  MdChevronRight,
  MdCalendarViewMonth,
  MdCalendarViewWeek,
} from "react-icons/md";

type Props = {
  logs: BreathingLog[];
};

export default function BreathingNavigation({ logs }: Props) {
  // Get navigation state from context (shared with calendar)
  const { logState, logDispatch } = useAppContext();
  const { viewMode, selectedYear, selectedMonth } = logState;

  // Process logs for chart using shared utility
  const processedData = processLogsForChart(logs);
  const dateGroups = groupLogsByDate(processedData);

  // Navigation handlers (shared with calendar)
  const onViewModeChange = (mode: "month" | "year") => {
    logDispatch({ type: LOG_ACTIONS.SET_VIEW_MODE, payload: mode });
  };

  const onPreviousPeriod = () => {
    if (viewMode === "month") {
      navigateToPreviousMonth(
        selectedYear,
        selectedMonth,
        dateGroups,
        logDispatch
      );
    } else {
      navigateToPreviousYear(selectedYear, dateGroups, logDispatch);
    }
  };

  const onNextPeriod = () => {
    if (viewMode === "month") {
      navigateToNextMonth(selectedYear, selectedMonth, dateGroups, logDispatch);
    } else {
      navigateToNextYear(selectedYear, dateGroups, logDispatch);
    }
  };

  return (
    <div className="mb-6">
      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => onViewModeChange("month")}
          size="md"
          variant={viewMode === "month" ? "primary" : "ghost"}
          icon={<MdCalendarViewMonth />}
          iconPosition="left"
        >
          Month
        </Button>
        <Button
          onClick={() => onViewModeChange("year")}
          size="md"
          variant={viewMode === "year" ? "primary" : "ghost"}
          icon={<MdCalendarViewWeek />}
          iconPosition="left"
        >
          Year
        </Button>
      </div>

      {/* Period Navigation */}
      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
        <Button
          onClick={onPreviousPeriod}
          icon={<MdChevronLeft />}
          iconPosition="left"
          variant="ghost"
          className="text-primary !bg-transparent !border-none"
        >
          Previous
        </Button>

        <h3 className="font-semibold text-foreground">
          {viewMode === "month"
            ? formatMonthYear(selectedYear, selectedMonth)
            : `${selectedYear}`}
        </h3>

        <Button
          onClick={onNextPeriod}
          icon={<MdChevronRight />}
          variant="ghost"
          className="text-primary !bg-transparent !border-none"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
