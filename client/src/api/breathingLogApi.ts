/**
 * @file breathingLogApi.ts
 * @description API calls for breathing log management:
 *              - getAllBreathingLogs
 *              - createBreathingLog
 *              - getSelectedBreathingLog
 *              - deleteBreathingLog
 */

import { getErrorMessage, isAxiosError } from "@/lib/apiUtils";
import {
  BreathingLogAction,
  LOG_ACTIONS,
} from "@/reducers/breathingLogReducer";
import { AddBreathingLogData, BreathingLog } from "@/types/BreathingLogTypes";
import axios from "axios";

type LogDispatch = React.Dispatch<BreathingLogAction>;

/**
 * Fetches all breathing logs for a specific dog with pagination.
 * Retrieves breathing logs with pagination metadata.
 *
 * @param dispatch - The breathing log dispatch function from useReducer to update global state
 * @param dogId - The ID of the dog to get breathing logs for
 * @param page - Page number (optional, defaults to 1)
 * @param limit - Number of logs per page (optional, defaults to 10)
 * @returns A Promise that resolves to the array of breathing logs
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const getAllBreathingLogs = async (
  dispatch: LogDispatch,
  dogId: string,
  page: number = 1,
  limit: number = 10
): Promise<BreathingLog[]> => {
  dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: null });

  try {
    const res = await axios.get<{
      breathingLogs: BreathingLog[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/dogs/${dogId}/breathing-logs?page=${page}&limit=${limit}`);
    
    dispatch({
      type: LOG_ACTIONS.GET_ALL_LOGS,
      payload: { 
        data: { 
          breathingLogs: res.data.breathingLogs,
          pagination: res.data.pagination,
        } 
      },
    });
    return res.data.breathingLogs;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Creates a new breathing log for a specific dog.
 * Records breathing data and calculates BPM automatically.
 *
 * @param dispatch - The breathing log dispatch function from useReducer to update global state
 * @param dogId - The ID of the dog to create the breathing log for
 * @param logData - The breathing log data (breathCount, duration, comment)
 * @returns A Promise that resolves to the newly created BreathingLog object
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const createBreathingLog = async (
  dispatch: LogDispatch,
  dogId: string,
  logData: AddBreathingLogData
): Promise<BreathingLog> => {
  dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: null });

  try {
    const res = await axios.post<{ breathingLog: BreathingLog }>(
      `/api/dogs/${dogId}/breathing-logs`,
      logData
    );
    dispatch({
      type: LOG_ACTIONS.ADD_LOG,
      payload: { data: { breathingLog: res.data.breathingLog } },
    });
    return res.data.breathingLog;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Fetches a specific breathing log by ID.
 * Retrieves detailed information about a single breathing log.
 *
 * @param dispatch - The breathing log dispatch function from useReducer to update global state
 * @param dogId - The ID of the dog the breathing log belongs to
 * @param logId - The ID of the breathing log to retrieve
 * @returns A Promise that resolves to the BreathingLog object
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const getSelectedBreathingLog = async (
  dispatch: LogDispatch,
  dogId: string,
  logId: string
): Promise<BreathingLog> => {
  dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: null });

  try {
    const res = await axios.get<{ breathingLog: BreathingLog }>(
      `/api/dogs/${dogId}/breathing-logs/${logId}`
    );
    dispatch({
      type: LOG_ACTIONS.GET_SELECTED_LOG,
      payload: { data: { breathingLog: res.data.breathingLog } },
    });
    return res.data.breathingLog;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Permanently deletes a breathing log.
 * Removes the breathing log from the database and updates the global state.
 *
 * @param dispatch - The breathing log dispatch function from useReducer to update global state
 * @param dogId - The ID of the dog the breathing log belongs to
 * @param logId - The ID of the breathing log to delete
 * @returns A Promise that resolves to the deleted breathing log's ID
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const deleteBreathingLog = async (
  dispatch: LogDispatch,
  dogId: string,
  logId: string
): Promise<string> => {
  dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: null });

  try {
    const res = await axios.delete<{ deletedBreathingLogId: string }>(
      `/api/dogs/${dogId}/breathing-logs/${logId}`
    );
    dispatch({
      type: LOG_ACTIONS.DELETE_LOG,
      payload: { data: { deletedBreathingLogId: res.data.deletedBreathingLogId } },
    });
    return res.data.deletedBreathingLogId;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: false });
  }
};