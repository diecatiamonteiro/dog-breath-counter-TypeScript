/**
 * @file userApi.ts
 * @description API calls for user authentication and profile management:
 *              - registerUser
 *              - loginUser
 *              - googleLoginUser
 *              - logoutUser
 *              - getUserProfile
 *              - updateUserProfile
 *              - deleteUserAccount
 */

import { getErrorMessage, isAxiosError } from "@/lib/apiUtils";
import { USER_ACTIONS, UserAction } from "@/reducers/userReducer";
import { BreathingLog } from "@/types/BreathingLogTypes";
import { Dog } from "@/types/DogTypes";
import {
  GoogleLoginUserData,
  LoginUserData,
  RegisterUserData,
  UpdateUserData,
  User,
} from "@/types/UserTypes";
import axios from "axios";

// Type alias (type with a custom name) for the type of reducer's dispatch function
type UserDispatch = React.Dispatch<UserAction>;

/**
 * Registers a new user by sending form data to the backend.
 * Creates a new user account and automatically logs them in.
 *
 * @param dispatch - The user dispatch function from useReducer to update global state
 * @param userData - The user's registration data (firstName, lastName, email, password)
 * @returns A Promise that resolves to the newly registered User object
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const registerUser = async (
  dispatch: UserDispatch, // to update global state
  userData: RegisterUserData // form data
): Promise<User> => {
  dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: USER_ACTIONS.SET_ERROR, payload: null }); // clears prev errors

  try {
    const res = await axios.post<{ user: User }>(
      "/api/auth/register",
      userData
    );
    dispatch({
      type: USER_ACTIONS.REGISTER_SUCCESS,
      payload: { data: { user: res.data.user } },
    });
    return res.data.user;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: USER_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Logs in a user with email and password.
 * Authenticates user credentials and sets up session.
 *
 * @param dispatch - The user dispatch function from useReducer to update global state
 * @param userData - The user's login credentials (email, password)
 * @returns A Promise that resolves to the authenticated User object
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const loginUser = async (
  dispatch: UserDispatch, // to update global state
  userData: LoginUserData // form data
): Promise<User> => {
  dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: USER_ACTIONS.SET_ERROR, payload: null }); // clears prev errors

  try {
    const res = await axios.post<{ user: User }>("/api/auth/login", userData);
    dispatch({
      type: USER_ACTIONS.LOGIN_SUCCESS,
      payload: { data: { user: res.data.user } },
    });
    return res.data.user;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: USER_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Logs in a user using Google OAuth.
 * Authenticates user with Google ID token and creates account if needed.
 *
 * @param dispatch - The user dispatch function from useReducer to update global state
 * @param userData - Object containing the Google ID token
 * @returns A Promise that resolves to the authenticated User object
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const googleLoginUser = async (
  dispatch: UserDispatch, // to update global state
  userData: GoogleLoginUserData // form data
): Promise<User> => {
  dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: USER_ACTIONS.SET_ERROR, payload: null }); // clears prev errors

  try {
    const res = await axios.post<{ user: User }>(
      "/api/auth/login/google",
      userData
    );
    dispatch({
      type: USER_ACTIONS.LOGIN_SUCCESS,
      payload: { data: { user: res.data.user } },
    });
    return res.data.user;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: USER_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Logs out the current user.
 * Clears the session cookie and resets user state to initial values.
 *
 * @param dispatch - The user dispatch function from useReducer to update global state
 * @returns A Promise that resolves to void (no return value)
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const logoutUser = async (
  dispatch: UserDispatch // to update global state
): Promise<void> => {
  dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: USER_ACTIONS.SET_ERROR, payload: null }); // clears prev errors

  try {
    await axios.get("/api/auth/logout");
    dispatch({
      type: USER_ACTIONS.LOGOUT,
    });
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: USER_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Fetches the current user's profile with their dogs and breathing logs.
 * Retrieves complete user data including associated pets and health records.
 *
 * @param dispatch - The user dispatch function from useReducer to update global state
 * @returns A Promise that resolves to the user object with dogs and breathing logs
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const getUserProfile = async (
  dispatch: UserDispatch // to update global state
): Promise<User & { dogs: Dog[]; breathingLogs: BreathingLog[] }> => {
  dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: USER_ACTIONS.SET_ERROR, payload: null }); // clears prev errors

  try {
    const res = await axios.get<{
      user: User & { dogs: Dog[]; breathingLogs: BreathingLog[] };
    }>("/api/user/me");
    dispatch({
      type: USER_ACTIONS.GET_USER_DATA,
      payload: {
        data: {
          user: res.data.user, // user object includes dogs & breathing logs
        },
      },
    });
    return res.data.user;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: USER_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Updates the current user's profile information.
 * Allows users to modify their email, password, first name, or last name.
 *
 * @param dispatch - The user dispatch function from useReducer to update global state
 * @param userData - Object containing the fields to update (email, password, firstName, lastName)
 * @returns A Promise that resolves to the updated User object
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const updateUserProfile = async (
  dispatch: UserDispatch, // to update global state
  userData: UpdateUserData // form data
): Promise<User> => {
  dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: USER_ACTIONS.SET_ERROR, payload: null }); // clears prev errors

  try {
    const res = await axios.patch<{ user: User }>("/api/user/me", userData);
    dispatch({
      type: USER_ACTIONS.UPDATE_USER,
      payload: {
        data: {
          user: res.data.user,
        },
      },
    });
    return res.data.user;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: USER_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Permanently deletes the current user's account and all associated data.
 * This action is irreversible and will remove all user data, dogs, and breathing logs.
 *
 * @param dispatch - The user dispatch function from useReducer to update global state
 * @returns A Promise that resolves to the deleted user's ID
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const deleteUserAccount = async (
  dispatch: UserDispatch // to update global state
): Promise<string> => {
  dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: USER_ACTIONS.SET_ERROR, payload: null }); // clears prev errors

  try {
    const res = await axios.delete<{ deletedUserId: string }>("/api/user/me");
    dispatch({
      type: USER_ACTIONS.DELETE_USER,
      payload: {
        data: {
          deletedUserId: res.data.deletedUserId,
        },
      },
    });
    return res.data.deletedUserId;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: USER_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
  }
};
