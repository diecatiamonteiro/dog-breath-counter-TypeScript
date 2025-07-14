"use client";

import { deleteDog, getAllDogs } from "@/api/dogApi";
import LoadingSpinner from "@/app/loading";
import { useAppContext } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { MdAddCircleOutline } from "react-icons/md";
import { RiArrowRightSLine, RiDeleteBin7Line } from "react-icons/ri";
import Button from "@/components/Button";

export default function MyDogsPage() {
  const { dogState, dogDispatch, userState, authLoading } = useAppContext();
  const { isLoading, error, dogs } = dogState;

  // Load dogs only when user is authenticated and auth check is complete
  useEffect(() => {
    if (!authLoading && userState.isAuthenticated) {
      getAllDogs(dogDispatch);
    }
  }, [dogDispatch, authLoading, userState.isAuthenticated]);

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="max-w-5xl p-4">
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-4">Loading your dogs...</h2>
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
            We cannot show your dogs at the moment. Try refreshing the page.
          </h2>
          <p className="text-accent">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Loading your dogs...</h2>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const handleDeleteDog = async (dogId: string, dogName: string) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete ${dogName}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteDog(dogDispatch, dogId);
      // Dog will be automatically removed from state by the reducer
    } catch (error) {
      console.error("Failed to delete dog:", error);
      // Error is already handled by the API function and displayed in state
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-4 mb-8 lg:mb-16">
          <h1 className="text-2xl font-bold">My Dogs</h1>
          <Button
            href="/my-dogs/add-dog"
            variant="primary"
            icon={<MdAddCircleOutline className="w-5 h-5" />}
          >
            Add Dog
          </Button>
        </div>

        {/* Dogs Grid */}
        <div className="grid grid-cols-1 gap-4 lg:gap-6">
          {Array.isArray(dogs) && dogs.length > 0 ? (
            dogs
              .filter((dog) => dog && dog.id) // Filter out undefined/null dogs
              .map((dog) => (
                <div
                  key={dog.id}
                  className="bg-main-text-bg rounded-lg p-4 sm:p-6 border border-primary/20 hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-6 md:items-center">
                    {/*  Image and Info */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Dog Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full border-2 border-primary/30 overflow-hidden bg-primary/10">
                          <Image
                            src="/logos/logo-light.png"
                            alt={`${dog.name || "Dog"} photo`}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Dog Info */}
                      <div className="flex-1 text-left">
                        <h3 className="text-lg sm:text-lg md:text-lg font-semibold text-foreground mb-1">
                          {dog.name || "Unnamed Dog"}
                        </h3>

                        <div className="space-y-0.5 text-sm sm:text-sm md:text-sm text-foreground/70">
                          {dog.age && <p>Age: {dog.age}</p>}
                          {dog.breed && <p>Breed: {dog.breed}</p>}
                          <p className="font-medium">
                            Max Breaths/min:{" "}
                            {dog.maxBreathingRate || "Not set"} bpm
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 md:gap-3 mt-2 md:mt-0">
                      <Button
                        href={`/my-dogs/${dog.id}`}
                        variant="secondary"
                        size="sm"
                        icon={
                          <RiArrowRightSLine className="w-4 h-4 md:w-5 md:h-5" />
                        }
                        iconPosition="right"
                        className="shadow-md text-sm md:text-sm flex-1 md:flex-none"
                        onClick={(e) => e?.stopPropagation()} // Prevent card click
                      >
                        View Dog
                      </Button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleDeleteDog(dog.id, dog.name);
                        }}
                        className="p-2 md:p-2 text-foreground/40 hover:text-accent hover:bg-accent/10 rounded-lg transition-all duration-200 border border-transparent hover:border-accent/20 cursor-pointer flex-shrink-0"
                        title="Delete dog"
                      >
                        <RiDeleteBin7Line className="w-4 h-4 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-full text-left py-12">
              <h2 className="text-xl font-semibold mb-4">No dogs found</h2>
              <p className="text-foreground/70 mb-6">
                You haven't added any dogs yet. Start by adding your first dog!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
