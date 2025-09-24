/**
 * @file client/src/utils/validateDogForm.ts
 * @description Validation utility for the dog profile form.
 *              Checks required fields (dog name, max breathing rate),
 *              validates birth year range (2000–current year),
 *              and ensures veterinarian email format.
 *              Returns { isValid, errors } for form handling.
 */

interface DogFormData {
  dogName: string;
  breed: string;
  birthYear: number;
  gender: string;
  maxBreathingRate: number;
  veterinarian: {
    vetName: string;
    vetClinicName: string;
    vetPhoneNumber: string;
    vetEmail: string;
    vetAddress: string;
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateDogForm = (formData: DogFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Required: dog name
  if (!formData.dogName.trim()) {
    errors.dogName = "Dog name is required";
  }

  // Required: max breathing rate
  const maxRate = formData.maxBreathingRate;
  if (maxRate === null || maxRate === undefined) {
    errors.maxBreathingRate = "Breathing rate is required";
  } else if (maxRate < 1) {
    errors.maxBreathingRate = "Breathing rate must be at least 1";
  } else if (maxRate > 60) {
    errors.maxBreathingRate = "Breathing rate cannot exceed 60";
  }

  // Birth year - validate only if filled (greater than 0)
  const currentYear = new Date().getFullYear();
  if (formData.birthYear && formData.birthYear > 0) {
    if (!Number.isInteger(formData.birthYear)) {
      errors.birthYear = "Birth year must be a whole number";
    } else if (formData.birthYear < 2000 || formData.birthYear > currentYear) {
      errors.birthYear = `Enter a year between 2000 and ${currentYear}`;
    }
  }

  if (formData.veterinarian.vetEmail) {
    if (!formData.veterinarian.vetEmail.trim()) {
      errors["veterinarian.vetEmail"] = "Email can't be blank";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.veterinarian.vetEmail)
    ) {
      errors["veterinarian.vetEmail"] = "Invalid email format";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
