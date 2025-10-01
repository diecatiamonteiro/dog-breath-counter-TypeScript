/**
 * @file client/src/components/shareData/DateRangePicker.tsx
 * @description Reusable date range picker for filtering data.
 *              Manages start/end dates, validates ranges, allows clearing,
 *              and notifies parent via onDateRangeChange. Defaults to showing
 *              last 30 days if no range is selected.
 */

"use client";

import { useState } from "react";
import Button from "../Button";
import { MdClear } from "react-icons/md";

interface DateRangePickerProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  className?: string;
}

export default function DateRangePicker({
  onDateRangeChange,
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    onDateRangeChange(date, endDate);
  };

  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    onDateRangeChange(startDate, date);
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
    onDateRangeChange(null, null);
  };

  const hasDates = startDate || endDate;

  return (
    <div className="flex flex-col items-start gap-4 mb-8">
      <p className="text-sm font-medium text-foreground">
        Select a date range or leave empty to see the last 30 days
      </p>

      <div className="flex flex-wrap gap-2 sm:gap-6">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="startDate"
              className="text-xs text-foreground/70 whitespace-nowrap"
            >
              From:
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              max={endDate || new Date().toISOString().split("T")[0]}
              className="px-3 py-1 text-sm border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="endDate"
              className="text-xs text-foreground/70 whitespace-nowrap"
            >
              To:
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              min={startDate || undefined}
              max={new Date().toISOString().split("T")[0]}
              className="px-3 py-1 text-sm border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
        {hasDates && (
          <Button
            onClick={clearDates}
            variant="ghost"
            size="xs"
            ariaLabel="Clear date range"
            icon={<MdClear className="w-3 h-3" aria-hidden="true" />}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
