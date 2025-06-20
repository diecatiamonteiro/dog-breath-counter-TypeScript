/**
 * @file BreathingLogTypes.ts
 * @description Types for breathing log data on the client side
 */

// Matches Breathing Log model
export interface BreathingLog {
  id: string;
  dogId: string;
  userId: string;
  breathCount: number;
  duration: number;
  bpm: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

// Breathing log initial state
export interface BreathingLogState {
  breathingLogs: BreathingLog[];
  selectedLog: BreathingLog | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}
