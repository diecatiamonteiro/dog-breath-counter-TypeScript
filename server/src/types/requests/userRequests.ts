/**
 * @file userRequests.ts
 * @description Types for user requests
 */

export interface RegisterRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface GoogleLoginRequestBody {
  token: string; // The ID token from Google
}

export interface UpdateUserRequestBody {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateDogRequestBody {
  name: string;
  photo?: string;
  breed?: string;
  birthYear?: number;
  gender?: string;
  maxBreathingRate: number;
  veterinarian?: {
    name?: string;
    clinicName?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
  };
}

export interface UpdateDogRequestBody {
  name?: string;
  photo?: string;
  breed?: string;
  birthYear?: number;
  gender?: string;
  maxBreathingRate?: number;
  veterinarian?: {
    name?: string;
    clinicName?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
  }
} 
