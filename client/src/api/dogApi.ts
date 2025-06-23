/**
 * @file dogApi.ts
 * @description API calls for dog management:
 *              - getAllDogs
 *              - addDog
 *              - getSelectedDog
 *              - updateDog
 *              - deleteDog
 */

import { getErrorMessage, isAxiosError } from "@/lib/apiUtils";
import { DOG_ACTIONS, DogAction } from "@/reducers/dogReducer";
import { AddDogData, Dog, UpdateDogData } from "@/types/DogTypes";
import axios from "axios";

type DogDispatch = React.Dispatch<DogAction>;

/**
 * Fetches all dogs for the current user.
 * Retrieves the complete list of user's dogs sorted by creation date.
 *
 * @param dispatch - The dog dispatch function from useReducer to update global state
 * @returns A Promise that resolves to the array of dogs
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const getAllDogs = async (
  dispatch: DogDispatch // to update global state
): Promise<Dog[]> => {
  dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: null });

  try {
    const res = await axios.get<{ dogs: Dog[] }>("/api/dogs");
    dispatch({
      type: DOG_ACTIONS.GET_ALL_DOGS,
      payload: { data: { dogs: res.data.dogs } },
    });
    return res.data.dogs;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Creates a new dog for the current user.
 * Adds the dog to the user's collection and updates the global state.
 *
 * @param dispatch - The dog dispatch function from useReducer to update global state
 * @param dogData - The dog's information (name, breed, photo, etc.)
 * @returns A Promise that resolves to the newly created Dog object
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const addDog = async (
  dispatch: DogDispatch, // to update global state
  dogData: AddDogData
): Promise<Dog> => {
  dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: null });

  try {
    const res = await axios.post<{ dog: Dog }>("/api/dogs", dogData);
    dispatch({
      type: DOG_ACTIONS.ADD_DOG,
      payload: { data: { dog: res.data.dog } },
    });
    return res.data.dog;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Fetches a specific dog by ID.
 * Retrieves detailed information about a single dog.
 *
 * @param dispatch - The dog dispatch function from useReducer to update global state
 * @param dogId - The ID of the dog to retrieve
 * @returns A Promise that resolves to the Dog object
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const getSelectedDog = async (
  dispatch: DogDispatch, // to update global state
  dogId: string
): Promise<Dog> => {
  dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: null });

  try {
    const res = await axios.get<{ dog: Dog }>(`/api/dogs/${dogId}`);
    dispatch({
      type: DOG_ACTIONS.GET_SELECTED_DOG,
      payload: { data: { dog: res.data.dog } },
    });
    return res.data.dog;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Updates a specific dog's information.
 * Modifies the dog's profile and updates the global state.
 *
 * @param dispatch - The dog dispatch function from useReducer to update global state
 * @param dogId - The ID of the dog to update
 * @param dogData - The updated dog information
 * @returns A Promise that resolves to the updated Dog object
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const updateDog = async (
  dispatch: DogDispatch, // to update global state
  dogId: string,
  dogData: UpdateDogData
): Promise<Dog> => {
  dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: null });

  try {
    const res = await axios.patch<{ dog: Dog }>(`/api/dogs/${dogId}`, dogData);
    dispatch({
      type: DOG_ACTIONS.UPDATE_DOG,
      payload: { data: { dog: res.data.dog } },
    });
    return res.data.dog;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Permanently deletes a dog and all associated data.
 * Removes the dog from the database and updates the global state.
 *
 * @param dispatch - The dog dispatch function from useReducer to update global state
 * @param dogId - The ID of the dog to delete
 * @returns A Promise that resolves to the deleted dog's ID
 * @throws Will re-throw the error after dispatching SET_ERROR for component handling
 */
export const deleteDog = async (
  dispatch: DogDispatch, // to update global state
  dogId: string
): Promise<string> => {
  dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: true });
  dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: null });

  try {
    const res = await axios.delete<{ deletedDogId: string }>(
      `/api/dogs/${dogId}`
    );
    dispatch({
      type: DOG_ACTIONS.DELETE_DOG,
      payload: { data: { deletedDogId: res.data.deletedDogId } },
    });
    return res.data.deletedDogId;
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? getErrorMessage(error)
      : "An unexpected error occurred";
    dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: false });
  }
};
