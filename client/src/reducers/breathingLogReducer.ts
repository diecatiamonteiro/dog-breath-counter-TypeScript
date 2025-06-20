/**
 * @file breathingLogReducer.ts
 * @description Reducer for the breathing log state
 */

import { BreathingLog, BreathingLogState } from "@/types/BreathingLogTypes";
import { act } from "react";

export const breathingLogInitialState: BreathingLogState = {
  breathingLogs: [], // all logs from a dog
  selectedLog: null,
  pagination: null,
  isLoading: false,
  error: null,
};

export const LOG_ACTIONS = {
  GET_ALL_LOGS: "GET_ALL_LOGS",
  ADD_LOG: "ADD_LOG",
  GET_SELECTED_LOG: "GET_SELECTED_LOG",
  DELETE_LOG: "DELETE_LOG",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
} as const;

export type BreathingLogAction =
  | {
      type: typeof LOG_ACTIONS.GET_ALL_LOGS;
      payload: {
        data: {
          breathingLogs: BreathingLog[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
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
  | { type: typeof LOG_ACTIONS.SET_ERROR; payload: string | null };

export const BreathingLogReducer = (
  state: BreathingLogState,
  action: BreathingLogAction
): BreathingLogState => {
  switch (action.type) {
    case LOG_ACTIONS.GET_ALL_LOGS:
      return {
        ...state,
        breathingLogs: action.payload.data.breathingLogs,
        pagination: action.payload.data.pagination,
      };

    case LOG_ACTIONS.ADD_LOG:
      return {
        ...state,
        selectedLog: action.payload.data.breathingLog,
        // Update logs array (if state.breathingLogs already exists, create a new array with all existing logs plus the new log at the end; otherwise, just create a new array that contains new log only)
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

    default:
      return state;
  }
};
