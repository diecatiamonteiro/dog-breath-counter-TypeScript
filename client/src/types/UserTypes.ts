/**
 * @file UserTypes.ts
 * @description Types for user-related data on the client side
 */

import { BreathingLog } from "./BreathingLogTypes";
import { Dog } from "./DogTypes";

// Matches User model
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

// User initial state
export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  dogs: Dog[];
  breathingLogs: BreathingLog[];
  isLoading: boolean;
  error: string | null;
}

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface GoogleLoginUserData {
  token: string; // The ID token from Google
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}
