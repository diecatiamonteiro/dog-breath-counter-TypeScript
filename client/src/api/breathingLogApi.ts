/**
 * @file breathingLogApi.ts
 * @description API calls for breathing log management
 */

import { LOG_ACTIONS, BreathingLogAction } from "@/reducers/breathingLogReducer";
import { BreathingLog } from "@/types/BreathingLogTypes";
import axios from "axios";
import { getErrorMessage, isAxiosError } from "@/lib/apiUtils";

// Define dispatch type
type BreathingLogDispatch = React.Dispatch<BreathingLogAction>;

/**
 * Get all breathing logs for the current user
 */
export const getBreathingLogs = async (dispatch: BreathingLogDispatch): Promise<BreathingLog[]> => {
  dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: null });

  try {
    const res = await axios.get<{ breathingLogs: BreathingLog[]; pagination: any }>("/api/breathing-logs");
    dispatch({
      type: LOG_ACTIONS.GET_ALL_LOGS,
      payload: { 
        data: { 
          breathingLogs: res.data.breathingLogs,
          pagination: res.data.pagination
        } 
      },
    });
    return res.data.breathingLogs;
  } catch (error) {
    const errorMessage = isAxiosError(error) ? getErrorMessage(error) : "An unexpected error occurred";
    dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Create a new breathing log
 */
export const createBreathingLog = async (
  dispatch: BreathingLogDispatch,
  logData: Partial<BreathingLog>
): Promise<BreathingLog> => {
  dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: null });

  try {
    const res = await axios.post<{ breathingLog: BreathingLog }>("/api/breathing-logs", logData);
    dispatch({
      type: LOG_ACTIONS.ADD_LOG,
      payload: { data: { breathingLog: res.data.breathingLog } },
    });
    return res.data.breathingLog;
  } catch (error) {
    const errorMessage = isAxiosError(error) ? getErrorMessage(error) : "An unexpected error occurred";
    dispatch({ type: LOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: LOG_ACTIONS.SET_LOADING, payload: false });
  }
};
