/**
 * @file dogReducer.ts
 * @description Reducer for the dog state
 */

import { Dog, DogState } from "@/types/DogTypes";

// Uses DogState interface set in types/ DogTypes.ts
export const dogInitialState: DogState = {
  dogs: [], // all dogs from user
  selectedDog: null, // one dog profile
  isLoading: false,
  error: null,
};

export const DOG_ACTIONS = {
  GET_ALL_DOGS: "GET_ALL_DOGS",
  ADD_DOG: "ADD_DOG",
  GET_SELECTED_DOG: "GET_SELECTED_DOG",
  UPDATE_DOG: "UPDATE_DOG",
  DELETE_DOG: "DELETE_DOG",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
} as const;

export type DogAction =
  | {
      type: typeof DOG_ACTIONS.GET_ALL_DOGS;
      payload: { data: { dogs: Dog[] } };
    }
  | {
      type:
        | typeof DOG_ACTIONS.ADD_DOG
        | typeof DOG_ACTIONS.GET_SELECTED_DOG
        | typeof DOG_ACTIONS.UPDATE_DOG;
      payload: { data: { dog: Dog } };
    }
  | {
      type: typeof DOG_ACTIONS.DELETE_DOG;
      payload: { data: { deletedDogId: string } };
    }
  | { type: typeof DOG_ACTIONS.SET_LOADING; payload: boolean }
  | { type: typeof DOG_ACTIONS.SET_ERROR; payload: string | null };

export const dogReducer = (state: DogState, action: DogAction): DogState => {
  switch (action.type) {
    case DOG_ACTIONS.GET_ALL_DOGS:
      return {
        ...state,
        dogs: action.payload.data.dogs,
      };

    case DOG_ACTIONS.ADD_DOG:
      return {
        ...state,
        selectedDog: action.payload.data.dog,
        // Update dogs array (if state.dogs already exists,create a
        // new array with all existing dogs, plus the new dog at the end;
        // otherwise, just create a new array that contains new dog only)
        dogs: state.dogs
          ? [...state.dogs, action.payload.data.dog]
          : [action.payload.data.dog],
      };

    case DOG_ACTIONS.GET_SELECTED_DOG:
      return {
        ...state,
        selectedDog: action.payload.data.dog,
      };

    case DOG_ACTIONS.UPDATE_DOG:
      return {
        ...state,
        selectedDog: action.payload.data.dog,
        // Update dog in dogs array if it exists
        dogs: state.dogs.map((dog) =>
          dog.id === action.payload.data.dog.id ? action.payload.data.dog : dog
        ),
      };

    case DOG_ACTIONS.DELETE_DOG:
      return {
        ...state,
        dogs: state.dogs.filter(
          (dog) => dog.id !== action.payload.data.deletedDogId
        ),
        selectedDog:
          state.selectedDog?.id === action.payload.data.deletedDogId
            ? null
            : state.selectedDog,
      };

    case DOG_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case DOG_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};
