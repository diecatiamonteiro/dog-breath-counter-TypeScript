"use client";

import { useAppContext } from "@/context/Context";
import { BreathingLog } from "@/types/BreathingLogTypes";
import { Dog } from "@/types/DogTypes";
import {
  groupLogsByDate,
  processLogsForChart,
} from "@/utils/breathingLogUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import BreathingNavigation from "./BreathingLogNavigation";

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
  const dateGroups = groupLogsByDate(processedData);

  // Filter data based on selected period and limit for chart display
  const getFilteredData = () => {
    if (viewMode === "month") {
      // For month view, show all data for the selected month
      const monthData = processedData.filter((log) => {
        const logDate = new Date(log.log.createdAt);
        return (
          logDate.getFullYear() === selectedYear &&
          logDate.getMonth() === selectedMonth
        );
      });
      // Limit to last 30 entries to prevent overcrowding
      return monthData.slice(-30);
    } else {
      // For year view, show all data for the selected year
      const yearData = processedData.filter((log) => {
        const logDate = new Date(log.log.createdAt);
        return logDate.getFullYear() === selectedYear;
      });
      // Limit to last 50 entries for year view
      return yearData.slice(-50);
    }
  };

  const filteredData = getFilteredData();

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

  return (
    <div className="bg-main-text-bg rounded-lg shadow-md border border-primary-light/20">
      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
            barGap={0}
            barCategoryGap={0}
          >
            <XAxis
              dataKey="index"
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: "#6b7280" }}
              tickFormatter={(value, index) =>
                filteredData[index]?.dateLong || ""
              }
            />
            <YAxis
              domain={[0, yAxisMax]}
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: "#6b7280" }}
              label={{
                value: "BPM",
                angle: -90,
                position: "insideLeft",
                fill: "#6b7280",
              }}
              allowDataOverflow={false}
            />

            {/* Reference line for max breathing rate */}
            {selectedDog && (
              <ReferenceLine
                y={selectedDog.maxBreathingRate}
                stroke="#f59e0b"
                strokeDasharray="1 1"
                label={{
                  value: `Max: ${selectedDog.maxBreathingRate} BPM`,
                  position: "top",
                  fill: "#f59e0b",
                }}
              />
            )}

            {/* Bars - one for each reading */}
            <Bar
              dataKey="bpm"
              radius={[4, 4, 0, 0]}
              barSize={30}
              fill="#8884d8"
              label={({ value, x, y, width, height }) => {
                if (value === null || value === undefined) return <></>;
                return (
                  <text
                    x={x + width / 2}
                    y={y - 3}
                    fill="#8884d8"
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight="500"
                  >
                    {value}
                  </text>
                );
              }}
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.bpm)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend (below, at or above max BPM) */}
      {selectedDog && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Below {selectedDog.maxBreathingRate} BPM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>At {selectedDog.maxBreathingRate} BPM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Above {selectedDog.maxBreathingRate} BPM</span>
          </div>
        </div>
      )}
    </div>
  );
}
