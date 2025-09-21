"use client";

import { useAppContext } from "@/context/Context";
import { BreathingLog } from "@/types/BreathingLogTypes";
import { Dog } from "@/types/DogTypes";
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

  return (
    <div className="bg-main-text-bg rounded-lg border border-primary-light/20">
      {/* Chart */}
      <div className="h-70 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} barGap={0} barCategoryGap={0}>
            <XAxis
              dataKey="index"
              stroke="#6b7280"
              fontSize={10}
              tick={{ fill: "#6b7280" }}
              tickFormatter={(value, index) =>
                formatDateLabel(filteredData[index]?.dateLong || "")
              }
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

            {/* Bars - one for each reading */}
            <Bar
              dataKey="bpm"
              radius={[2, 2, 0, 0]}
              barSize={12}
              fill="#8884d8"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.bpm)} />
              ))}
            </Bar>

            {/* Reference line for max breathing rate - placed after bars to appear on top */}
            {selectedDog && (
              <ReferenceLine
                y={selectedDog.maxBreathingRate}
                stroke="#f59e0b"
                strokeDasharray="1 1"
                fontSize={10}
                label={{
                  value: `Max: ${selectedDog.maxBreathingRate} BPM`,
                  position: "top",
                  fill: "#f59e0b",
                }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend (below, at or above max BPM) */}
      {selectedDog && (
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-4 md:gap-8">
          <div className="flex items-center">
            <GoDotFill className="w-5 h-5 text-green-500 " />
            <span className="text-xs sm:text-sm">
              Below {selectedDog.maxBreathingRate} BPM
            </span>
          </div>
          <div className="flex items-center">
            <GoDotFill className="w-5 h-5 text-yellow-500 " />
            <span className="text-xs sm:text-sm">
              At {selectedDog.maxBreathingRate} BPM
            </span>
          </div>
          <div className="flex items-center">
            <GoDotFill className="w-5 h-5 text-red-500 " />
            <span className="text-xs sm:text-sm">
              Above {selectedDog.maxBreathingRate} BPM
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
