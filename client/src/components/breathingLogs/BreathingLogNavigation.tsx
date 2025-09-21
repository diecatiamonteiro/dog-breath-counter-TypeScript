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
  hasDataInMonth,
  hasDataInYear,
} from "@/utils/breathingLogUtils";
import Button from "../Button";
import {
  MdChevronLeft,
  MdChevronRight,
  MdCalendarViewMonth,
  MdCalendarViewWeek,
  MdBarChart,
  MdCalendarToday,
} from "react-icons/md";

type Props = {
  logs: BreathingLog[];
};

export default function BreathingNavigation({ logs }: Props) {
  // Get navigation state from context (shared with calendar)
  const { logState, logDispatch } = useAppContext();
  const { viewMode, selectedYear, selectedMonth, viewType } = logState;

  // Process logs for chart using shared utility
  const processedData = processLogsForChart(logs);
  const dateGroups = groupLogsByDate(processedData);

  // Navigation handlers (shared with calendar)
  const onViewModeChange = (mode: "month" | "year") => {
    logDispatch({ type: LOG_ACTIONS.SET_VIEW_MODE, payload: mode });
  };

  const onViewTypeChange = (type: "chart" | "calendar") => {
    logDispatch({ type: LOG_ACTIONS.SET_VIEW_TYPE, payload: type });
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

  // Simple helper functions using existing logic
  const hasPreviousData = () => {
    if (viewMode === "month") {
      return (selectedMonth > 0 && hasDataInMonth(selectedYear, selectedMonth - 1, dateGroups)) ||
             hasDataInYear(selectedYear - 1, dateGroups);
    } else {
      return hasDataInYear(selectedYear - 1, dateGroups);
    }
  };

  const hasNextData = () => {
    if (viewMode === "month") {
      return (selectedMonth < 11 && hasDataInMonth(selectedYear, selectedMonth + 1, dateGroups)) ||
             hasDataInYear(selectedYear + 1, dateGroups);
    } else {
      return hasDataInYear(selectedYear + 1, dateGroups);
    }
  };

  return (
    <div className="mb-6">
      {/* Navigation Controls */}
      <div className="flex flex-wrap justify-between gap-2 mb-6">
        {/* View Type Toggle (Chart/Calendar) */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewTypeChange("chart")}
            size="sm"
            variant={viewType === "chart" ? "primary" : "ghost"}
            icon={<MdBarChart />}
            iconPosition="left"
          >
            Chart View
          </Button>
          <Button
            onClick={() => onViewTypeChange("calendar")}
            size="sm"
            variant={viewType === "calendar" ? "primary" : "ghost"}
            icon={<MdCalendarToday />}
            iconPosition="left"
          >
            Calendar View
          </Button>
        </div>

        {/* View Mode Toggle (Month/Year) */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewModeChange("month")}
            size="sm"
            variant={viewMode === "month" ? "primary" : "ghost"}
            icon={<MdCalendarViewMonth />}
            iconPosition="left"
          >
            Month
          </Button>
          <Button
            onClick={() => onViewModeChange("year")}
            size="sm"
            variant={viewMode === "year" ? "primary" : "ghost"}
            icon={<MdCalendarViewWeek />}
            iconPosition="left"
          >
            Year
          </Button>
        </div>
      </div>

      {/* Period Navigation */}
      <div className="flex items-center justify-between bg-secondary rounded-lg border border-foreground border-thin">
        <Button
          onClick={onPreviousPeriod}
          disabled={!hasPreviousData()}
          iconPosition="left"
          variant="ghost"
          className="text-primary !bg-transparent !border-none hover:!bg-primary/10"
        ><MdChevronLeft className="w-6 h-6 text-foreground"/>
        </Button>

        <h3 className="font-semibold text-foreground text-lg">
          {viewMode === "month"
            ? formatMonthYear(selectedYear, selectedMonth)
            : `${selectedYear}`}
        </h3>

        <Button
          onClick={onNextPeriod}
          disabled={!hasNextData()}
          variant="ghost"
          className="text-primary !bg-transparent !border-none hover:!bg-primary/10"
        ><MdChevronRight className="w-6 h-6 text-foreground"/>
        </Button>
      </div>
    </div>
  );
}
