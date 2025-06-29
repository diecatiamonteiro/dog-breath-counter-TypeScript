/**
 * @file app/(protected)/my-dogs/add-dog/page.tsx
 * @description Add a new dog
 */

"use client";

import { useAppContext } from "@/context/Context";
import { useEffect, useState } from "react";
import { validateDogForm } from "./util/validateDogForm";
import LoadingSpinner from "@/app/loading";
import { addDog } from "@/api/dogApi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RiArrowLeftSLine } from "react-icons/ri";

export default function AddDogPage() {
  const router = useRouter();

  // Context state
  const { dogState, dogDispatch } = useAppContext();
  const { isLoading, error, selectedDog } = dogState;

  // Form state
  const [formData, setFormData] = useState({
    dogName: "",
    breed: "",
    birthYear: 0,
    gender: "",
    maxBreathingRate: 30,
    veterinarian: {
      vetName: "",
      vetClinicName: "",
      vetPhoneNumber: "",
      vetEmail: "",
      vetAddress: "",
    },
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors & form data when page refreshes
  useEffect(() => {
    setFormErrors({});
    setServerErrors("");
    setFormData({
      dogName: "",
      breed: "",
      birthYear: 0,
      gender: "",
      maxBreathingRate: 30,
      veterinarian: {
        vetName: "",
        vetClinicName: "",
        vetPhoneNumber: "",
        vetEmail: "",
        vetAddress: "",
      },
    });
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Convert value based on input type
    let processedValue: string | number = value;
    if (type === "number") {
      processedValue = value === "" ? 0 : parseInt(value);
    }

    // Update changed fields
    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear form errors for the field when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear server errors when user starts typing
    if (serverErrors) {
      setServerErrors("");
    }
  };

  // Handle veterinarian input changes
  const handleVetInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      veterinarian: {
        ...prev.veterinarian,
        [name]: value,
      },
    }));

    // Clear errors
    if (formErrors[`veterinarian.${name}`]) {
      setFormErrors((prev) => ({ ...prev, [`veterinarian.${name}`]: "" }));
    }

    // Clear server errors when user starts typing
    if (serverErrors) {
      setServerErrors("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validation = validateDogForm(formData);
    setFormErrors(validation.errors);

    if (!validation.isValid) return;

    setIsSubmitting(true);

    try {
      const dogData = {
        name: formData.dogName,
        breed: formData.breed || undefined,
        birthYear: formData.birthYear || undefined,
        gender: formData.gender || undefined,
        maxBreathingRate: formData.maxBreathingRate,
        veterinarian:
          formData.veterinarian.vetName ||
          formData.veterinarian.vetClinicName ||
          formData.veterinarian.vetPhoneNumber ||
          formData.veterinarian.vetEmail ||
          formData.veterinarian.vetAddress
            ? {
                name: formData.veterinarian.vetName,
                clinicName: formData.veterinarian.vetClinicName,
                phoneNumber: formData.veterinarian.vetPhoneNumber,
                email: formData.veterinarian.vetEmail,
                address: formData.veterinarian.vetAddress,
              }
            : undefined,
      };

      await addDog(dogDispatch, dogData);
      router.push("/my-dogs");
    } catch (error) {
      setServerErrors("Failed to create dog. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl p-4">
      <div className="bg-navbar-bg/70 rounded-lg shadow-lg border border-primary/20 p-8">
        <Link href={"/my-dogs"}>
          <span className="w-fit flex items-center mb-12 pl-2 pr-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200 text-sm font-medium shadow-md">
            <RiArrowLeftSLine className="w-6 h-6" />
            Back to My Dogs
          </span>
        </Link>

        <h1 className="text-2xl font-bold mb-6">Add New Dog</h1>

        {serverErrors && (
          <div className="mb-4 p-3 bg-accent/20 border border-accent rounded-lg">
            <p className="text-accent">{serverErrors}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dog Name and Breed - Grouped */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dog Name */}
            <div>
              <label
                htmlFor="dogName"
                className="block text-sm font-medium mb-1"
              >
                Dog Name *
              </label>
              <input
                type="text"
                id="dogName"
                name="dogName"
                value={formData.dogName}
                onChange={handleInputChange}
                placeholder="Enter dog's name"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors ${
                  formErrors.dogName
                    ? "border-accent"
                    : "border-primary/30 focus:border-primary"
                }`}
              />
              {formErrors.dogName && (
                <p className="mt-1 text-sm text-accent">{formErrors.dogName}</p>
              )}
            </div>

            {/* Max Breathing Rate */}
            <div>
              <label
                htmlFor="maxBreathingRate"
                className="block text-sm font-medium mb-1"
              >
                Max Breathing Rate *
              </label>
              <input
                type="number"
                id="maxBreathingRate"
                name="maxBreathingRate"
                value={formData.maxBreathingRate}
                onChange={handleInputChange}
                placeholder="30"
                min="1"
                max="60"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors ${
                  formErrors.maxBreathingRate
                    ? "border-accent"
                    : "border-primary/30 focus:border-primary"
                }`}
              />
              {formErrors.maxBreathingRate && (
                <p className="mt-1 text-sm text-accent">
                  {formErrors.maxBreathingRate}
                </p>
              )}
            </div>
          </div>

          {/* Birth Year, Gender, and Max Breathing Rate - Grouped */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Birth Year */}
            <div>
              <label
                htmlFor="birthYear"
                className="block text-sm font-medium mb-1"
              >
                Birth Year
              </label>
              <input
                type="number"
                id="birthYear"
                name="birthYear"
                value={formData.birthYear || ""}
                onChange={handleInputChange}
                placeholder="e.g., 2020"
                min="2000"
                max={new Date().getFullYear()}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors ${
                  formErrors.birthYear
                    ? "border-accent"
                    : "border-primary/30 focus:border-primary"
                }`}
              />
              {formErrors.birthYear && (
                <p className="mt-1 text-sm text-accent">
                  {formErrors.birthYear}
                </p>
              )}
            </div>

            {/* Breed */}
            <div>
              <label htmlFor="breed" className="block text-sm font-medium mb-1">
                Breed
              </label>
              <input
                type="text"
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                placeholder="e.g., Golden Retriever"
                className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors"
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium mb-1"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg transition-colors"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Veterinarian Section */}
          <div className="border-t border-primary/20 pt-6">
            <h3 className="text-lg font-medium mb-4">
              Veterinarian Information (Optional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vet Name */}
              <div>
                <label
                  htmlFor="vetName"
                  className="block text-sm font-medium mb-1"
                >
                  Vet Name
                </label>
                <input
                  type="text"
                  id="vetName"
                  name="vetName"
                  value={formData.veterinarian.vetName}
                  onChange={handleVetInputChange}
                  placeholder="Dr. Smith"
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors"
                />
              </div>

              {/* Clinic Name */}
              <div>
                <label
                  htmlFor="vetClinicName"
                  className="block text-sm font-medium mb-1"
                >
                  Clinic Name
                </label>
                <input
                  type="text"
                  id="vetClinicName"
                  name="vetClinicName"
                  value={formData.veterinarian.vetClinicName}
                  onChange={handleVetInputChange}
                  placeholder="Animal Care Clinic"
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="vetPhoneNumber"
                  className="block text-sm font-medium mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="vetPhoneNumber"
                  name="vetPhoneNumber"
                  value={formData.veterinarian.vetPhoneNumber}
                  onChange={handleVetInputChange}
                  placeholder="Enter vet's phone number"
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="vetEmail"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="vetEmail"
                  name="vetEmail"
                  value={formData.veterinarian.vetEmail}
                  onChange={handleVetInputChange}
                  placeholder="vet@clinic.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors ${
                    formErrors["veterinarian.vetEmail"]
                      ? "border-accent"
                      : "border-primary/30 focus:border-primary"
                  }`}
                />
                {formErrors["veterinarian.vetEmail"] && (
                  <p className="mt-1 text-sm text-accent">
                    {formErrors["veterinarian.vetEmail"]}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label
                  htmlFor="vetAddress"
                  className="block text-sm font-medium mb-1"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="vetAddress"
                  name="vetAddress"
                  value={formData.veterinarian.vetAddress}
                  onChange={handleVetInputChange}
                  placeholder="Enter vet's address"
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-navbar-items-bg placeholder-foreground/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full bg-primary text-white py-3 px-4 mt-8 rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting || isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" color="white" /> Saving...
              </span>
            ) : (
              "Save Dog"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
