"use client";

import { BreathingLog } from "@/types/BreathingLogTypes";
import { Dog } from "@/types/DogTypes";
import { processLogsForChart } from "@/utils/breathingLogUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

type Props = {
  logs: BreathingLog[];
  selectedDog: Dog | null;
};

export default function BreathingChart({ logs, selectedDog }: Props) {
  // Process logs for chart using shared utility
  const data = processLogsForChart(logs);

  // Make Y-axis adaptable to any BPM value
  const allBpmValues = logs.map((log) => log.bpm); // create new array of all BPM values
  const maxBpm = Math.max(...allBpmValues, selectedDog?.maxBreathingRate || 0); // find the highest BPM value
  const yAxisMax = maxBpm + 10; // add padding of 10 to the highest BPM value to ensure bars don't go off the chart

  // Group logs by date (reduce returns an object with the date as the key and the logs as the value)
  const dateGroups = data.reduce((grouped, log) => {
    const date = log.dateLong; // get the date from the log
    grouped[date] = grouped[date] || []; // initialize the date as an empty array if it doesn't exist
    grouped[date].push(log); // add the log to the date
    return grouped;
  }, {} as Record<string, typeof data>);

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
    <div className="bg-main-text-bg rounded-lg shadow-md p-6 border border-primary-light/20">
      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
            barGap={0}
            barCategoryGap={0}
          >
            <XAxis
              dataKey="index"
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: "#6b7280" }}
              tickFormatter={(value, index) => data[index]?.dateShort || ""}
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

            {/* 3. Reference line for max breathing rate */}
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
              {data.map((entry, index) => (
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
