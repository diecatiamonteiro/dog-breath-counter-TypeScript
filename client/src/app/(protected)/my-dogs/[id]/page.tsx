/**
 * @file app/(protected)/my-dogs/[id]/page.tsx
 * @description Dog profile page
 */

"use client";

import { getSelectedDog } from "@/api/dogApi";
import LoadingSpinner from "@/app/loading";
import Button from "@/components/Button";
import { useAppContext } from "@/context/Context";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { RiArrowLeftSLine } from "react-icons/ri";

export default function DogProfilePage() {
  const params = useParams();
  const dogId = params.id as string;
  const { dogState, dogDispatch } = useAppContext();
  const { selectedDog, isLoading, error } = dogState;

  // Load dog data if not already loaded
  useEffect(() => {
    if (!selectedDog) {
      getSelectedDog(dogDispatch, dogId);
    }
  }, [selectedDog, dogId, dogDispatch]);

  const dogName =
    selectedDog?.name &&
    selectedDog.name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  if (isLoading) {
    return (
      <div className="max-w-5xl p-4">
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-4">
            Loading your dog`s profile...
          </h2>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">
            We cannot show your dog`s profile at the moment. Try refreshing the
            page.
          </h2>
          <p className="text-accent">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div>
        <Button
          href="/my-dogs"
          variant="ghost"
          icon={<RiArrowLeftSLine className="w-7 h-7" />}
          className="mb-4 lg:mb-16"
        >
          Back to My Dogs
        </Button>

        <h1 className="text-2xl font-bold mb-8 lg:mb-16">
          {`${dogName || "Dog"}'s`} Profile
        </h1>

        <h2 className="text-lg font-semibold mb-4">
          {selectedDog?.age ? `Age: ${selectedDog.age}` : ""}
        </h2>

        <h2 className="text-lg font-semibold mb-4">
          Max Breathing Rate: {selectedDog?.maxBreathingRate}
        </h2>

        {selectedDog?.veterinarian?.name && (
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Veterinarian Info</h2>
            <p className="">{selectedDog.veterinarian.name}</p>
            <p className="">{selectedDog.veterinarian.clinicName}</p>
          </div>
        )}

        <Button
          href={`/my-dogs/${dogId}/monitor-breathing`}
          variant="primary"
          className="mt-4"
        >
          Monitor Breathing Now
        </Button>
      </div>
    </div>
  );
}
