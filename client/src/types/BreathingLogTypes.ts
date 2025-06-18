/**
 * @file BreathingLogTypes.ts
 * @description Types for breathing log data on the client side
 */

export interface BreathingLog {
  id: string;
  dogId: string;
  userId: string;
  breathCount: number;
  duration: 15 | 30 | 60;
  bpm: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BreathingLogState {
  breathingLogs: BreathingLog[];
  isLoading: boolean;
  error: string | null;
} 