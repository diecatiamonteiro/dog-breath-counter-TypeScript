/**
 * @file Context.tsx
 * @description Context provider for the app. Imported in layout.tsx.
 */

"use client";

import {
  UserAction,
  userInitialState,
  userReducer,
} from "@/reducers/userReducer";
import {
  DogAction,
  dogInitialState,
  dogReducer,
} from "@/reducers/dogReducer";
import { createContext, useContext, useReducer, useEffect, useState } from "react";
import { UserState } from "@/types/UserTypes";
import { DogState } from "@/types/DogTypes";
import { BreathingLogAction, breathingLogInitialState, BreathingLogReducer } from "@/reducers/breathingLogReducer";
import { BreathingLogState } from "@/types/BreathingLogTypes";
import { getUserProfile } from "@/api/userApi";

type AppContextType = {
  userState: UserState;
  userDispatch: React.Dispatch<UserAction>;
  dogState: DogState;
  dogDispatch: React.Dispatch<DogAction>;
  logState: BreathingLogState;
  logDispatch: React.Dispatch<BreathingLogAction>
  authLoading: boolean;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [userState, userDispatch] = useReducer(userReducer, userInitialState);
  const [dogState, dogDispatch] = useReducer(dogReducer, dogInitialState);
  const [logState, logDispatch] = useReducer(BreathingLogReducer, breathingLogInitialState)
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Small delay to ensure cookies are loaded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        await getUserProfile(userDispatch);
      } catch {
        // User is not authenticated, which is fine
        console.log("Authentication check failed - user not logged in");
      } finally {
        setAuthLoading(false);
      }
    };

    fetchUserProfile();
  }, [userDispatch]);

  return (
    <AppContext.Provider value={{ userState, userDispatch, dogState, dogDispatch, logState, logDispatch, authLoading }}>
      {children}
    </AppContext.Provider>
  );
};

// Helper hook
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
