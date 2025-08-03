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

  return (
    <div className="mb-6">
      {/* Navigation Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        {/* View Type Toggle (Chart/Calendar) */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewTypeChange("chart")}
            size="md"
            variant={viewType === "chart" ? "primary" : "ghost"}
            icon={<MdBarChart />}
            iconPosition="left"
          >
            Chart View
          </Button>
          <Button
            onClick={() => onViewTypeChange("calendar")}
            size="md"
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
      </div>

      {/* Period Navigation */}
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
        <Button
          onClick={onPreviousPeriod}
          icon={<MdChevronLeft />}
          iconPosition="left"
          variant="ghost"
          className="text-primary !bg-transparent !border-none hover:!bg-primary/10"
        >
          Previous
        </Button>

        <h3 className="font-semibold text-foreground text-lg">
          {viewMode === "month"
            ? formatMonthYear(selectedYear, selectedMonth)
            : `${selectedYear}`}
        </h3>

        <Button
          onClick={onNextPeriod}
          icon={<MdChevronRight />}
          variant="ghost"
          className="text-primary !bg-transparent !border-none hover:!bg-primary/10"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
