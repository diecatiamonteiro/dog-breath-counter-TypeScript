"use client";

import { deleteDog, getAllDogs } from "@/api/dogApi";
import LoadingSpinner from "@/app/loading";
import { useAppContext } from "@/context/Context";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { MdAddCircleOutline } from "react-icons/md";
import { RiArrowRightSLine, RiDeleteBin7Line } from "react-icons/ri";

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
        <div className="bg-navbar-bg/70 rounded-lg shadow-lg border border-primary/20 p-8 text-left">
          <h2 className="text-xl font-semibold mb-4">Loading your dogs...</h2>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto p-4">
        <div className="bg-navbar-bg/70 rounded-lg shadow-lg border border-primary/20 p-8 text-center">
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
      <div className="mx-auto p-4">
        <div className="bg-navbar-bg/70 rounded-lg shadow-lg border border-primary/20 p-8 text-center">
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
    <div className="max-w-5xl p-4">
      <div className="bg-navbar-bg/70 rounded-lg shadow-lg border border-primary/20 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold">My Dogs</h1>
          <Link
            href="/my-dogs/add-dog"
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <MdAddCircleOutline className="w-5 h-5" />
            Add Dog
          </Link>
        </div>

        {/* Dogs Grid */}
        <div className="grid grid-cols-1 gap-4">
          {Array.isArray(dogs) && dogs.length > 0 ? (
            dogs
              .filter((dog) => dog && dog.id) // Filter out undefined/null dogs
              .map((dog) => (
                <div
                  key={dog.id}
                  className="bg-navbar-items-bg rounded-lg p-6 border border-primary/20 hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left side - Image and Info */}
                    <div className="flex items-center gap-4">
                      {/* Dog Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full border-2 border-primary/30 overflow-hidden bg-primary/10">
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
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {dog.name || "Unnamed Dog"}
                        </h3>

                        <div className="space-y-1 text-sm text-foreground/70">
                          {dog.age && <p>Age: {dog.age}</p>}
                          {dog.breed && <p>Breed: {dog.breed}</p>}
                          <p className="font-medium">
                            Max Breathing Rate:{" "}
                            {dog.maxBreathingRate || "Not set"} bpm
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Action Buttons */}
                    <div className="flex-shrink-0 ml-4 flex items-center gap-8">
                      <Link
                        href={`/my-dogs/${dog.id}`}
                        onClick={(e) => e.stopPropagation()} // Prevent card click
                        className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200 text-sm font-medium shadow-md"
                      >
                        View Dog <RiArrowRightSLine className="w-6 h-6" />
                      </Link>

                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleDeleteDog(dog.id, dog.name);
                        }}
                        className="p-2 text-foreground/40 hover:text-accent hover:bg-accent/10 rounded-lg transition-all duration-200 border border-transparent hover:border-accent/20 cursor-pointer"
                        title="Delete dog"
                      >
                        <RiDeleteBin7Line className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <div className="col-span-full text-left py-12">
              <h2 className="text-xl font-semibold mb-4">No dogs found</h2>
              <p className="text-foreground/70 mb-6">
                You haven’t added any dogs yet. Start by adding your first dog!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
