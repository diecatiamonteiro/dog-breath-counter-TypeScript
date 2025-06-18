/**
 * @file userReducer.ts
 * @description Reducer for the user state
 */

import { UserState, User } from "@/types/UserTypes";
import { Dog } from "@/types/DogTypes";
import { BreathingLog } from "@/types/BreathingLogTypes";

// initial state of the user reducer
export const userInitialState: UserState = {
  user: null,
  isAuthenticated: false,
  dogs: [],
  breathingLogs: [],
  isLoading: false, // means currently not fetching data
  error: null,
};

// actions that can be dispatched to the user reducer
export const USER_ACTIONS = {
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  GET_USER_DATA: "GET_USER_DATA",
  DELETE_USER: "DELETE_USER",
  UPDATE_USER: "UPDATE_USER",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
} as const;

// types for the actions that can be dispatched to the user reducer
export type UserAction =
  | {
      type:
        | typeof USER_ACTIONS.LOGIN_SUCCESS
        | typeof USER_ACTIONS.REGISTER_SUCCESS
        | typeof USER_ACTIONS.UPDATE_USER;
      payload: { data: { user: User } };
    }
  | {
      type: typeof USER_ACTIONS.GET_USER_DATA;
      payload: {
        data: {
          user: User & {
            dogs: Dog[];
            breathingLogs: BreathingLog[];
          };
        };
      };
    }
  | { type: typeof USER_ACTIONS.LOGOUT }
  | {
      type: typeof USER_ACTIONS.DELETE_USER;
      payload: { data: { deletedUserId: string } };
    }
  | { type: typeof USER_ACTIONS.SET_LOADING; payload: boolean }
  | { type: typeof USER_ACTIONS.SET_ERROR; payload: string | null };

// reducer function that updates the state based on the action
export const userReducer = (
  state: UserState,
  action: UserAction
): UserState => {
  switch (action.type) {
    case USER_ACTIONS.REGISTER_SUCCESS:
    case USER_ACTIONS.LOGIN_SUCCESS:
    case USER_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload.data.user,
        isAuthenticated: true,
      };
    case USER_ACTIONS.GET_USER_DATA:
      return {
        ...state,
        user: action.payload.data.user,
        isAuthenticated: true,
        dogs: action.payload.data?.user.dogs,
        breathingLogs: action.payload.data?.user.breathingLogs,
      };
    case USER_ACTIONS.LOGOUT:
      return {
        ...userInitialState,
      };
    case USER_ACTIONS.DELETE_USER:
      if (action.payload.data.deletedUserId === state.user?.id) {
        return {
          ...userInitialState,
        };
      }
      return state; // If IDs don't match, no change
    case USER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case USER_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};
