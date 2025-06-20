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
import { createContext, useContext, useReducer } from "react";
import { UserState } from "@/types/UserTypes";
import { DogState } from "@/types/DogTypes";
import { BreathingLogAction, breathingLogInitialState, BreathingLogReducer } from "@/reducers/breathingLogReducer";
import { BreathingLogState } from "@/types/BreathingLogTypes";

type AppContextType = {
  userState: UserState;
  userDispatch: React.Dispatch<UserAction>;
  dogState: DogState;
  dogDispatch: React.Dispatch<DogAction>;
  logState: BreathingLogState;
  logDispatch: React.Dispatch<BreathingLogAction>
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [userState, userDispatch] = useReducer(userReducer, userInitialState);
  const [dogState, dogDispatch] = useReducer(dogReducer, dogInitialState);
  const [logState, logDispatch] = useReducer(BreathingLogReducer, breathingLogInitialState)

  return (
    <AppContext.Provider value={{ userState, userDispatch, dogState, dogDispatch, logState, logDispatch }}>
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
