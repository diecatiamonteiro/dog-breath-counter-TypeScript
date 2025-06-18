/**
 * @file Context.tsx
 * @description Context provider for the app. Imported in layout.tsx.
 */

import {
  UserAction,
  userInitialState,
  userReducer,
} from "@/reducers/userReducer";
import { createContext, useContext, useReducer } from "react";
import { UserState } from "@/types/UserTypes";

type AppContextType = {
  userState: UserState;
  userDispatch: React.Dispatch<UserAction>;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [userState, userDispatch] = useReducer(userReducer, userInitialState);

  return (
    <AppContext.Provider value={{ userState, userDispatch }}>
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
