"use client";

import { useState } from "react";
import Button from "../Button";
import { MdCalendarToday, MdClear } from "react-icons/md";

interface DateRangePickerProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  className?: string;
}

export default function DateRangePicker({ onDateRangeChange, className = "" }: DateRangePickerProps) {
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
    <div className={`flex flex-col sm:flex-row gap-3 items-start sm:items-center ${className}`}>
      <div className="flex items-center gap-2">
        <MdCalendarToday className="text-primary text-lg" />
        <span className="text-sm font-medium text-foreground">Date Range:</span>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="startDate" className="text-xs text-foreground/70 whitespace-nowrap">
            From:
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            max={endDate || undefined}
            className="px-3 py-1 text-sm border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="endDate" className="text-xs text-foreground/70 whitespace-nowrap">
            To:
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            min={startDate || undefined}
            max={new Date().toISOString().split('T')[0]}
            className="px-3 py-1 text-sm border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {hasDates && (
        <Button
          onClick={clearDates}
          variant="ghost"
          size="sm"
          className="text-xs text-foreground/60 hover:text-foreground"
          icon={<MdClear className="w-3 h-3" />}
        >
          Clear
        </Button>
      )}
    </div>
  );
} 