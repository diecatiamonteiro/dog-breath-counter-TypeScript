/**
 * @file client/src/app/(protected)/my-dogs/add-dog/page.tsx
 * @description Add dog / Update dog page
 *              Add a new dog or edit an existing dog (when navigated from the
 *              dog profile Edit button). Supports section-focused editing via
 *              the `section` query param: "photo" | "info" | "breathing" | "vet".
 */

"use client";

import { useAppContext } from "@/context/Context";
import { useEffect, useState, useRef } from "react";
import { validateDogForm } from "../../../../utils/validateDogForm";
import { addDog, getSelectedDog, updateDog } from "@/api/dogApi";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import { PetPhotoUploader } from "@/components/PetPhotoUploader";
import { CloudinaryPhoto } from "@/types/DogTypes";
import InfoDialog from "@/components/InfoDialog";
import { RiArrowLeftSLine } from "react-icons/ri";
import { TbLungsFilled } from "react-icons/tb";
import { FaHospital, FaPaw } from "react-icons/fa";

export default function AddDogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editDogId = searchParams.get("edit");
  const focusSection = searchParams.get("section"); // 'info', 'breathing', 'vet'
  const isEditMode = !!editDogId;

  // Refs for section scrolling
  const photoRef = useRef<HTMLDivElement>(null);
  const dogInfoRef = useRef<HTMLDivElement>(null);
  const breathingRef = useRef<HTMLDivElement>(null);
  const vetRef = useRef<HTMLDivElement>(null);

  const { dogState, dogDispatch } = useAppContext();
  const { isLoading } = dogState;
  // Form state
  const [formData, setFormData] = useState({
    dogName: "",
    breed: "",
    birthYear: 0,
    gender: "",
    maxBreathingRate: 30,
    photo: undefined as CloudinaryPhoto | null | undefined,
    veterinarian: {
      vetName: "",
      vetClinicName: "",
      vetPhoneNumber: "",
      vetEmail: "",
      vetAddress: "",
    },
  });

  const formattedDogName = formData.dogName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Form validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load existing dog data when in edit mode
  useEffect(() => {
    const loadDogData = async () => {
      if (isEditMode && editDogId && !dataLoaded) {
        try {
          const dogData = await getSelectedDog(dogDispatch, editDogId);

          const birthYear = dogData.birthYear || 0;

          setFormData({
            dogName: dogData.name || "",
            breed: dogData.breed || "",
            birthYear: birthYear,
            gender: dogData.gender || "",
            maxBreathingRate: dogData.maxBreathingRate || 30,
            photo: dogData.photo || undefined,
            veterinarian: {
              vetName: dogData.veterinarian?.name || "",
              vetClinicName: dogData.veterinarian?.clinicName || "",
              vetPhoneNumber: dogData.veterinarian?.phoneNumber || "",
              vetEmail: dogData.veterinarian?.email || "",
              vetAddress: dogData.veterinarian?.address || "",
            },
          });
          setDataLoaded(true);
        } catch {
          setServerErrors("Failed to load dog data. Please try again.");
        }
      }
    };

    loadDogData();
  }, [isEditMode, editDogId, dogDispatch, dataLoaded]);

  // Scroll to focused section after data loads
  useEffect(() => {
    if (dataLoaded && focusSection) {
      const scrollToSection = () => {
        let targetRef = null;
        switch (focusSection) {
          case "photo":
            targetRef = photoRef;
            break;
          case "info":
            targetRef = dogInfoRef;
            break;
          case "breathing":
            targetRef = breathingRef;
            break;
          case "vet":
            targetRef = vetRef;
            break;
        }

        if (targetRef?.current) {
          targetRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          // Add a highlight effect
          targetRef.current.classList.add(
            "ring-2",
            "ring-primary",
            "ring-opacity-50"
          );
          // Remove highlight effect after 3 seconds
          setTimeout(() => {
            targetRef.current?.classList.remove(
              "ring-2",
              "ring-primary",
              "ring-opacity-50"
            );
          }, 3000);
        }
      };

      // Delay scroll to ensure DOM is ready
      setTimeout(scrollToSection, 100);
    }
  }, [dataLoaded, focusSection]);

  // Clear errors & form data when page refreshes if not in edit mode (only for add mode)
  useEffect(() => {
    if (!isEditMode) {
      setFormErrors({});
      setServerErrors("");
      setFormData({
        dogName: "",
        breed: "",
        birthYear: 0,
        gender: "",
        maxBreathingRate: 30,
        photo: undefined,
        veterinarian: {
          vetName: "",
          vetClinicName: "",
          vetPhoneNumber: "",
          vetEmail: "",
          vetAddress: "",
        },
      });
    }
  }, [isEditMode]);

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

  // Handle veterinarian input changes (because it's a nested object)
  const handleVetInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Update veterinarian fields
    setFormData((prev) => ({
      ...prev,
      veterinarian: {
        ...prev.veterinarian,
        [name]: value,
      },
    }));

    // Clear form errors for the field when user starts typing
    if (formErrors[`veterinarian.${name}`]) {
      setFormErrors((prev) => ({ ...prev, [`veterinarian.${name}`]: "" }));
    }

    // Clear server errors when user starts typing
    if (serverErrors) {
      setServerErrors("");
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (photo: CloudinaryPhoto) => {
    setFormData((prev) => ({ ...prev, photo }));
    // Clear any photo-related errors
    if (formErrors.photo) {
      setFormErrors((prev) => ({ ...prev, photo: "" }));
    }
    // Clear server errors when user makes changes
    if (serverErrors) {
      setServerErrors("");
    }
  };

  // Handle photo upload error
  const handlePhotoError = (error: string) => {
    setFormErrors((prev) => ({ ...prev, photo: error }));
  };

  // Handle photo removal
  const handlePhotoRemove = () => {
    setFormData((prev) => ({ ...prev, photo: null }));
    // Clear any photo-related errors
    if (formErrors.photo) {
      setFormErrors((prev) => ({ ...prev, photo: "" }));
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
      // Process veterinarian data
      const vetData = {
        name: formData.veterinarian.vetName.trim() || undefined,
        clinicName: formData.veterinarian.vetClinicName.trim() || undefined,
        phoneNumber: formData.veterinarian.vetPhoneNumber.trim() || undefined,
        email: formData.veterinarian.vetEmail.trim() || undefined,
        address: formData.veterinarian.vetAddress.trim() || undefined,
      };

      // Check if at least one field has data
      const hasAnyVetData = Object.values(vetData).some(
        (value) => value !== undefined
      );

      const dogData = {
        name: formData.dogName,
        breed: formData.breed || undefined,
        birthYear: formData.birthYear || undefined,
        gender: formData.gender || undefined,
        maxBreathingRate: formData.maxBreathingRate,
        photo: formData.photo === null ? null : formData.photo || undefined,
        // Always include veterinarian property - null when empty to signal clearing
        veterinarian: hasAnyVetData ? vetData : null,
      };

      if (isEditMode && editDogId) {
        await updateDog(dogDispatch, editDogId, dogData);
        router.push(`/my-dogs/${editDogId}`);
      } else {
        await addDog(dogDispatch, dogData);
        router.push("/my-dogs");
      }
    } catch {
      setServerErrors(
        `Failed to ${isEditMode ? "update" : "create"} dog. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the section title based on the focus section
  const getSectionTitle = () => {
    if (!isEditMode) return "Add New Dog";

    switch (focusSection) {
      case "info":
        return `Edit ${formattedDogName || "Dog"} Info`;
      case "breathing":
        return `Edit ${formattedDogName || "Dog"} Breathing Rate`;
      case "vet":
        return `Edit ${formattedDogName || "Dog"} Veterinarian`;
      default:
        return "Edit Dog Profile";
    }
  };

  return (
    <div className="max-w-5xl mb-36">
      <div className="flex flex-wrap gap-2 justify-between align-center">
        <div className="flex">
          <h1 className="text-lg md:text-2xl font-bold text-foreground">
            {getSectionTitle()}
          </h1>
        </div>
        {isEditMode ? (
          <Button
            href={`/my-dogs/${editDogId}`}
            variant="ghost"
            size="sm"
            icon={<RiArrowLeftSLine className="w-5 h-5" aria-hidden="true" />}
            className="mb-4 lg:mb-16"
          >
            Back to {formattedDogName}&apos;s Profile
          </Button>
        ) : (
          <Button
            href="/my-dogs"
            variant="ghost"
            size="sm"
            icon={<RiArrowLeftSLine className="w-5 h-5" aria-hidden="true" />}
            className="mb-4 lg:mb-16"
          >
            Back to My Dogs
          </Button>
        )}
      </div>

      {serverErrors && (
        <div className="mb-4 p-3 bg-accent/20 border border-accent rounded-lg">
          <p className="text-accent">{serverErrors}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-6 md:space-y-8"
      >
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting || isLoading}
          loadingText={isEditMode ? "Updating..." : "Saving..."}
          className="mt-4 w-full"
        >
          {isEditMode ? "Update Dog" : "Save Dog"}
        </Button>

        {/* ***************** DOG INFO SECTION ***************** */}
        <div
          ref={dogInfoRef}
          className={`transition-all duration-300 rounded-lg mt-8 ${
            focusSection === "info" ? "bg-primary/5" : ""
          }`}
        >
          <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 border border-primary-light/20">
            <div className="flex items-center mb-4">
              <FaPaw className="w-5 h-5 md:w-6 md:h-6 inline-block mr-2 md:mr-4 text-foreground" />
              <h2 className="text-base md:text-xl font-semibold text-foreground">
                Dog
              </h2>
            </div>

            <div
              ref={photoRef}
              className={`border rounded-lg p-4 mb-4 border-primary/30 focus:border-primary transition-all duration-300 ${
                focusSection === "photo" ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex justify-center">
                <PetPhotoUploader
                  currentPhoto={formData.photo ?? undefined}
                  onUpload={handlePhotoUpload}
                  onError={handlePhotoError}
                  onRemove={handlePhotoRemove}
                />
              </div>

              {formErrors.photo && (
                <p className="mt-2 text-sm text-accent text-center">
                  {formErrors.photo}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="dogName"
                  className="block text-sm font-medium mb-1 text-foreground"
                >
                  Dog Name *
                </label>
                <input
                  type="text"
                  id="dogName"
                  name="dogName"
                  value={formData.dogName}
                  onChange={handleInputChange}
                  placeholder="e.g. April"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground ${
                    formErrors.dogName
                      ? "border-accent"
                      : "border-primary/30 focus:border-primary"
                  }`}
                />
                {formErrors.dogName && (
                  <p className="mt-1 text-sm text-accent">
                    {formErrors.dogName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="birthYear"
                  className="block text-sm font-medium mb-1 text-foreground"
                >
                  Birth Year
                </label>
                <input
                  type="number"
                  id="birthYear"
                  name="birthYear"
                  value={formData.birthYear || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. 2020"
                  min="2000"
                  max={new Date().getFullYear()}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground ${
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
              <div>
                <label
                  htmlFor="breed"
                  className="block text-sm font-medium mb-1 text-foreground"
                >
                  Breed
                </label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  placeholder="e.g. Golden Retriever"
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground"
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium mb-1 text-foreground"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg transition-colors text-foreground"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div>
          </div>
        </div>

        {/* ***************** BREATHING RATE SECTION ***************** */}
        <div
          ref={breathingRef}
          className={`transition-all duration-300 rounded-lg ${
            focusSection === "breathing" ? "bg-primary/5" : ""
          }`}
        >
          <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 border border-primary-light/20">
            <div className="flex items-center mb-4">
              <TbLungsFilled
                className="w-5 h-5 md:w-6 md:h-6 inline-block mr-2 md:mr-4 text-foreground"
                aria-hidden="true"
              />
              <h2 className="text-base md:text-xl font-semibold text-foreground">
                Breathing Rate
              </h2>
              <InfoDialog title="Why a max of 30 BPM?">
                <p>
                  <span className="font-semibold">
                    Breaths per minute (BPM){" "}
                  </span>
                  show how often your dog breathes while sleeping. Tracking this
                  can help detect early heart or lung problems.
                </p>
                <p>
                  Healthy dogs usually breathe 15-30 times per minute when
                  sleeping. That’s why 30 BPM is set as the recommended maximum.
                  Rates consistently above may signal an issue and should be
                  checked with a vet.
                </p>
              </InfoDialog>
            </div>

            <div>
              <label
                htmlFor="maxBreathingRate"
                className="block text-sm font-medium mb-1 text-foreground"
              >
                Max Breaths Per Minute *
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
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground ${
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
              <p className="mt-1 text-xs md:text-sm leading-tight text-foreground/60">
                We recommend 30 BPM as the maximum normal breathing rate for
                your dog when resting.
              </p>
            </div>
          </div>
        </div>

        {/* ***************** VETERINARIAN SECTION ***************** */}
        <div
          ref={vetRef}
          className={`transition-all duration-300 rounded-lg ${
            focusSection === "vet" ? "bg-primary/5" : ""
          }`}
        >
          <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 border border-primary-light/20">
            <div className="flex items-center mb-4">
              <FaHospital
                className="w-5 h-5 md:w-6 md:h-6 inline-block mr-2 md:mr-4 text-foreground"
                aria-hidden="true"
              />
              <h2 className="text-base md:text-xl font-semibold text-foreground">
                Veterinarian (Optional)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="vetName"
                  className="block text-sm font-medium mb-1 text-foreground"
                >
                  Vet Name
                </label>
                <input
                  type="text"
                  id="vetName"
                  name="vetName"
                  value={formData.veterinarian.vetName}
                  onChange={handleVetInputChange}
                  placeholder="e.g., Dr. Smith"
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground"
                />
              </div>

              <div>
                <label
                  htmlFor="vetClinicName"
                  className="block text-sm font-medium mb-1 text-foreground"
                >
                  Clinic Name
                </label>
                <input
                  type="text"
                  id="vetClinicName"
                  name="vetClinicName"
                  value={formData.veterinarian.vetClinicName}
                  onChange={handleVetInputChange}
                  placeholder="e.g., Animal Care Clinic"
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground"
                />
              </div>

              <div>
                <label
                  htmlFor="vetPhoneNumber"
                  className="block text-sm font-medium mb-1 text-foreground"
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
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground"
                />
              </div>

              <div>
                <label
                  htmlFor="vetEmail"
                  className="block text-sm font-medium mb-1 text-foreground"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="vetEmail"
                  name="vetEmail"
                  value={formData.veterinarian.vetEmail}
                  onChange={handleVetInputChange}
                  placeholder="e.g., vet@clinic.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground ${
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

              <div className="sm:col-span-2">
                <label
                  htmlFor="vetAddress"
                  className="block text-sm font-medium mb-1 text-foreground"
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
                  className="w-full px-3 py-2 border border-primary/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting || isLoading}
          loadingText={isEditMode ? "Updating..." : "Saving..."}
          className="mt-4 w-full"
        >
          {isEditMode ? "Update Dog" : "Save Dog"}
        </Button>
      </form>
    </div>
  );
}
