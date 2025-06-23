/**
 * @file dogApi.ts
 * @description API calls for dog management
 */

import { DOG_ACTIONS, DogAction } from "@/reducers/dogReducer";
import { Dog } from "@/types/DogTypes";
import axios from "axios";
import { getErrorMessage, isAxiosError } from "@/lib/apiUtils";

// Define dispatch type
type DogDispatch = React.Dispatch<DogAction>;

/**
 * Get all dogs for the current user
 */
export const getDogs = async (dispatch: DogDispatch): Promise<Dog[]> => {
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
    const errorMessage = isAxiosError(error) ? getErrorMessage(error) : "An unexpected error occurred";
    dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: false });
  }
};

/**
 * Create a new dog
 */
export const createDog = async (
  dispatch: DogDispatch,
  dogData: Partial<Dog>
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
    const errorMessage = isAxiosError(error) ? getErrorMessage(error) : "An unexpected error occurred";
    dispatch({ type: DOG_ACTIONS.SET_ERROR, payload: errorMessage });
    throw error;
  } finally {
    dispatch({ type: DOG_ACTIONS.SET_LOADING, payload: false });
  }
};
