/**
 * @file breathingLogReducer.ts
 * @description Reducer for the breathing log state
 */

import { BreathingLog, BreathingLogState } from "@/types/BreathingLogTypes";

export const breathingLogInitialState: BreathingLogState = {
  breathingLogs: [], // all logs from a dog
  selectedLog: null,
  pagination: null,
  isLoading: false,
  error: null,
  // Navigation state
  viewMode: "month",
  viewType: "chart",
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth(),
  selectedWeek: new Date().getDay(),
};

export const LOG_ACTIONS = {
  GET_ALL_LOGS: "GET_ALL_LOGS",
  ADD_LOG: "ADD_LOG",
  GET_SELECTED_LOG: "GET_SELECTED_LOG",
  DELETE_LOG: "DELETE_LOG",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  // Navigation actions
  SET_VIEW_MODE: "SET_VIEW_MODE",
  SET_VIEW_TYPE: "SET_VIEW_TYPE",
  SET_SELECTED_YEAR: "SET_SELECTED_YEAR",
  SET_SELECTED_MONTH: "SET_SELECTED_MONTH",
} as const;

export type BreathingLogAction =
  | {
      type: typeof LOG_ACTIONS.GET_ALL_LOGS;
      payload: {
        data: {
          breathingLogs: BreathingLog[];
        };
      };
    }
  | {
      type: typeof LOG_ACTIONS.ADD_LOG | typeof LOG_ACTIONS.GET_SELECTED_LOG;
      payload: { data: { breathingLog: BreathingLog } };
    }
  | {
      type: typeof LOG_ACTIONS.DELETE_LOG;
      payload: { data: { deletedBreathingLogId: string } };
    }
  | { type: typeof LOG_ACTIONS.SET_LOADING; payload: boolean }
  | { type: typeof LOG_ACTIONS.SET_ERROR; payload: string | null }
  // Navigation actions
  | { type: typeof LOG_ACTIONS.SET_VIEW_MODE; payload: "month" | "year" }
  | { type: typeof LOG_ACTIONS.SET_VIEW_TYPE; payload: "chart" | "calendar" }
  | { type: typeof LOG_ACTIONS.SET_SELECTED_YEAR; payload: number }
  | { type: typeof LOG_ACTIONS.SET_SELECTED_MONTH; payload: number };

export const BreathingLogReducer = (
  state: BreathingLogState,
  action: BreathingLogAction
): BreathingLogState => {
  switch (action.type) {
    case LOG_ACTIONS.GET_ALL_LOGS:
      return {
        ...state,
        breathingLogs: action.payload.data.breathingLogs,
        pagination: null, // No pagination needed
      };

    case LOG_ACTIONS.ADD_LOG:
      return {
        ...state,
        selectedLog: action.payload.data.breathingLog,
        // Update logs array (if state.breathingLogs already exists,
        // create a new array with all existing logs, plus the new log at the end;
        // otherwise, just create a new array that contains new log only).
        breathingLogs: state.breathingLogs
          ? [...state.breathingLogs, action.payload.data.breathingLog]
          : [action.payload.data.breathingLog],
      };

    case LOG_ACTIONS.GET_SELECTED_LOG:
      return {
        ...state,
        selectedLog: action.payload.data.breathingLog,
      };

    case LOG_ACTIONS.DELETE_LOG:
      return {
        ...state,
        selectedLog:
          state.selectedLog?.id === action.payload.data.deletedBreathingLogId
            ? null
            : state.selectedLog,
        breathingLogs: state.breathingLogs.filter(
          (log) => log.id !== action.payload.data.deletedBreathingLogId
        ),
      };

    case LOG_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case LOG_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    // Navigation cases
    case LOG_ACTIONS.SET_VIEW_MODE:
      return {
        ...state,
        viewMode: action.payload,
      };

    case LOG_ACTIONS.SET_VIEW_TYPE:
      return {
        ...state,
        viewType: action.payload,
      };

    case LOG_ACTIONS.SET_SELECTED_YEAR:
      return {
        ...state,
        selectedYear: action.payload,
      };

    case LOG_ACTIONS.SET_SELECTED_MONTH:
      return {
        ...state,
        selectedMonth: action.payload,
      };

    default:
      return state;
  }
};
