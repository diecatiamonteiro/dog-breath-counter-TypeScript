/**
 * @file DogTypes.ts
 * @description Types for dog-related data on the client side
 */

export interface CloudinaryPhoto {
  url: string;
  publicId: string;
}

export interface Veterinarian {
  name?: string;
  clinicName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
}

// Matches Dog model
export interface Dog {
  id: string;
  userId: string;
  name: string;
  photo?: CloudinaryPhoto; // see above
  breed?: string;
  birthYear?: number;
  gender?: string;
  maxBreathingRate: number;
  veterinarian?: Veterinarian; // see above
  age?: number;
  createdAt: string;
  updatedAt: string;
}

// Dog initial state
export interface DogState {
  dogs: Dog[]; // all dogs from user
  selectedDog: Dog | null; // one dog profile
  isLoading: boolean;
  error: string | null;
}

export interface AddDogData {
  name: string;
  photo?: CloudinaryPhoto; // see above
  breed?: string;
  birthYear?: number;
  gender?: string;
  maxBreathingRate: number;
  veterinarian?: Veterinarian; // see above
  age?: number;
}

export interface UpdateDogData {
  name: string;
  photo?: CloudinaryPhoto; // see above
  breed?: string;
  birthYear?: number;
  gender?: string;
  maxBreathingRate: number;
  veterinarian?: Veterinarian; // see above
  age?: number;
}
