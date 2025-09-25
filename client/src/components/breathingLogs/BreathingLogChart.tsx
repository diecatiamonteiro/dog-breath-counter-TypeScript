/**
 * @file client/src/components/breathingLogs/BreathingLogChart.tsx
 * @description Chart view for breathing logs.
 *                - Uses Recharts to display breaths per minute as bars.
 *                - Colour bars relative to the selected dog's max breathing rate
 *                  (green = below set BPM, yellow = at set BPM, red = above set BPM).
 *                - Supports month/year filtering via context.
 *                - Accessible: ARIA labels, hidden table fallback, and key.
 *                - Responsive: adjusts bar size and data density based on screen size.
 *                - Currently there is no limit for monthly entries, and a 100 limit for
 *                  year view (set on client/src/utils/breathingLogUtils.ts)
 */

"use client";

import { useAppContext } from "@/context/Context";
import { BreathingLog } from "@/types/BreathingLogTypes";
import { Dog } from "@/types/DogTypes";
import { useMemo, useState, useEffect } from "react";
import {
  formatDateChartLabel,
  processLogsForChart,
  getFilteredDataForChart,
} from "@/utils/breathingLogUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LabelList,
} from "recharts";
import { GoDotFill } from "react-icons/go";

type Props = {
  logs: BreathingLog[];
  selectedDog: Dog | null;
};

export default function BreathingChart({ logs, selectedDog }: Props) {
  // Get navigation state from context (shared with calendar)
  const { logState } = useAppContext();
  const { viewMode, selectedYear, selectedMonth } = logState;

  // Process logs for chart using shared utility
  const processedData = processLogsForChart(logs);

  // Filter data for chart display using shared utility
  const filteredData = getFilteredDataForChart(
    processedData,
    viewMode,
    selectedYear,
    selectedMonth
  );

  // Responsive bar size state
  const [windowWidth, setWindowWidth] = useState(0);

  // Update window width on mount and resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    // Set initial width
    handleResize();
    // Listen for resize
    window.addEventListener("resize", handleResize);
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate bar size based on screen width and data count
  const barSize = useMemo(() => {
    if (windowWidth === 0) return 6; // Default while loading
    const dataCount = filteredData.length;
    let baseSize = windowWidth < 640 ? 4 : windowWidth < 1024 ? 6 : 8;
    // Reduce size if too many data points
    if (dataCount > 50) baseSize = Math.max(baseSize - 2, 2);
    return baseSize;
  }, [windowWidth, filteredData.length]);

  // Make Y-axis adaptable to any BPM value
  const allBpmValues = filteredData.map((log) => log.bpm);
  const maxBpm = Math.max(...allBpmValues, selectedDog?.maxBreathingRate || 0);
  const yAxisMax = maxBpm + 10;

  // Color bars based on BPM vs max breathing rate
  const getBarColor = (bpm: number) => {
    if (!selectedDog) return "#8884d8";
    if (bpm < selectedDog.maxBreathingRate) {
      return "#10b981"; // Green - normal
    } else if (bpm === selectedDog.maxBreathingRate) {
      return "#f59e0b"; // Yellow - caution
    } else {
      return "#ef4444"; // Red - alert
    }
  };

  // Format date labels to show only day number
  const formatDateLabel = formatDateChartLabel;

  // Create a stable mapping of which indices should show date labels
  const dateLabelsToShow = useMemo(() => {
    const seenDates = new Set<string>();
    const indicesToShow = new Set<number>();
    filteredData.forEach((entry, index) => {
      const date = entry.dateLong;
      if (!seenDates.has(date)) {
        seenDates.add(date);
        indicesToShow.add(index);
      }
    });

    return indicesToShow;
  }, [filteredData]);

  // ARIA identifiers
  const chartTitleId = "breathing-chart-title"; // [ARIA] id used by aria-labelledby
  const chartDescId = "breathing-chart-desc"; // [ARIA] id used by aria-describedby
  const dogName = selectedDog?.name ?? "your dog";

  return (
    <div className="bg-main-text-bg rounded-lg border border-primary-light/20">
      {/* [ARIA] wrap chart in a figure */}
      <figure aria-labelledby={chartTitleId} aria-describedby={chartDescId}>
        {/* [ARIA] screen-reader-only title, ie visually hidden but screen readers can still read it */}
        <h2 id={chartTitleId} className="sr-only">
          Breathing rate chart for {dogName}
        </h2>
        {/* [ARIA] screen-reader-only */}
        <p id={chartDescId} className="sr-only">
          Bar chart of breaths per minute over time
          {selectedDog
            ? ` with a reference line at ${selectedDog.maxBreathingRate} BPM.`
            : "."}
        </p>

        {/* Chart */}
        <div className="h-72 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              barGap={0}
              barCategoryGap={0}
              role="img"
              aria-label={`Breathing rates for ${dogName}`}
            >
              <XAxis
                dataKey="index"
                stroke="#6b7280"
                fontSize={9}
                tick={{ fill: "#6b7280" }}
                tickFormatter={(value, index) => {
                  // Only show the date if this is the first occurrence of this date
                  if (dateLabelsToShow.has(index)) {
                    const currentDate = filteredData[index]?.dateLong || "";
                    return formatDateLabel(currentDate);
                  }
                  return ""; // Return empty string for duplicate dates
                }}
                height={40}
                interval={0}
                label={{
                  value: "Days",
                  position: "insideBottom",
                  fill: "#6b7280",
                  fontSize: 10,
                }}
              />
              <YAxis
                domain={[0, yAxisMax]}
                stroke="#6b7280"
                fontSize={10}
                tick={{ fill: "#6b7280" }}
                allowDataOverflow={false}
                width={25}
                label={{
                  value: "BPM",
                  position: "top",
                  offset: 10,
                  fill: "#6b7280",
                  fontSize: 10,
                }}
              />

              {/* Bars - one per reading */}
              <Bar
                dataKey="bpm"
                radius={[2, 2, 0, 0]}
                barSize={barSize}
                fill="#8884d8"
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.bpm)} />
                ))}
                <LabelList dataKey="bpm" position="top" fontSize={9} />
              </Bar>

              {/* Reference line for max breathing rate - placed after bars to appear on top on them */}
              {selectedDog && (
                <ReferenceLine
                  y={selectedDog.maxBreathingRate}
                  stroke="var(--foreground)"
                  strokeDasharray="1 1"
                  fontSize={10}
                  label={{
                    value: `Max: ${selectedDog.maxBreathingRate} BPM`,
                    position: "top",
                    fill: "var(--foreground)",
                  }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* [ARIA] screen-reader-only table as non-visual fallback */}
        {filteredData.length > 0 && (
          <table className="sr-only">
            <caption>{`Breathing logs for ${dogName}`}</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">BPM</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((d, i) => (
                <tr key={i}>
                  <td>{d.dateLong}</td>
                  <td>{d.bpm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </figure>

      {/* Key (below, at or above max BPM) */}
      {selectedDog && (
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-4 md:gap-8">
          <div className="flex items-center">
            <GoDotFill className="w-5 h-5 text-green-500" aria-hidden="true" />
            <span className="text-xs sm:text-sm">
              Below {selectedDog.maxBreathingRate} BPM
            </span>
          </div>
          <div className="flex items-center">
            <GoDotFill className="w-5 h-5 text-yellow-500" aria-hidden="true" />
            <span className="text-xs sm:text-sm">
              At {selectedDog.maxBreathingRate} BPM
            </span>
          </div>
          <div className="flex items-center">
            <GoDotFill className="w-5 h-5 text-red-500" aria-hidden="true" />
            <span className="text-xs sm:text-sm">
              Above {selectedDog.maxBreathingRate} BPM
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
