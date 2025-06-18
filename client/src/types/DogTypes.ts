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

export interface Dog {
  id: string;
  userId: string;
  name: string;
  photo?: CloudinaryPhoto;
  breed?: string;
  birthYear?: number;
  gender?: 'male' | 'female';
  maxBreathingRate: number;
  veterinarian?: Veterinarian;
  age?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DogState {
  dogs: Dog[];
  selectedDog: Dog | null;
  isLoading: boolean;
  error: string | null;
} 