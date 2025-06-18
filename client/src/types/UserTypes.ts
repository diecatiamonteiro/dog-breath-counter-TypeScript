/**
 * @file UserTypes.ts
 * @description Types for user-related data on the client side
 */

import { BreathingLog } from "./BreathingLogTypes";
import { Dog } from "./DogTypes";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  dogs: Dog[];
  breathingLogs: BreathingLog[];
  isLoading: boolean;
  error: string | null;
}
