/**
 * @file app/(protected)/my-dogs/[id]/page.tsx
 * @description Dog profile page
 */

"use client";

import { getSelectedDog } from "@/api/dogApi";
import { getAllBreathingLogs } from "@/api/breathingLogApi";
import LoadingSpinner from "@/app/loading";
import Button from "@/components/Button";
import { useAppContext } from "@/context/Context";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { RiArrowLeftSLine, RiAddLine, RiEditLine } from "react-icons/ri";
import { FaDog } from "react-icons/fa";
import { TbLungsFilled } from "react-icons/tb";
import Image from "next/image";
import BreathingLogChart from "@/components/breathingLogs/BreathingLogChart";
import BreathingLogCalendar from "@/components/breathingLogs/BreathingLogCalendar";
import BreathingLogNavigation from "@/components/breathingLogs/BreathingLogNavigation";

export default function DogProfilePage() {
  const params = useParams();
  const dogId = params.id as string;
  const { dogState, dogDispatch, logState, logDispatch, userState } =
    useAppContext();
  const { selectedDog, isLoading, error } = dogState;
  const { breathingLogs } = logState;

  // Load dog data on mount and when dogId changes (force refresh)
  useEffect(() => {
    getSelectedDog(dogDispatch, dogId);
  }, [dogId, dogDispatch]);

  // Load breathing logs for this specific dog
  useEffect(() => {
    if (dogId) {
      getAllBreathingLogs(logDispatch, dogId);
    }
  }, [dogId, logDispatch]);

  const dogName =
    selectedDog?.name &&
    selectedDog.name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // Calculate average BPM from breathing logs for this dog
  const calculateAverageBPM = () => {
    // Use both logState.breathingLogs (from specific dog loading) and userState.breathingLogs (from profile loading)
    // Combine both arrays and filter for this specific dog
    const allLogs = [...breathingLogs, ...(userState.breathingLogs || [])];
    const dogLogs = allLogs.filter((log) => log && log.dogId === dogId);

    // Remove duplicates based on log id
    const uniqueLogs = dogLogs.filter(
      (log, index, self) => index === self.findIndex((l) => l.id === log.id)
    );

    if (uniqueLogs.length === 0) return null;

    const totalBPM = uniqueLogs.reduce((sum, log) => sum + log.bpm, 0);
    return Math.round(totalBPM / uniqueLogs.length);
  };

  const averageBPM = calculateAverageBPM();

  // Check if veterinarian data exists (any field has a value)
  const hasVeterinarianData = () => {
    const vetData = selectedDog?.veterinarian;

    if (!vetData || vetData === null) return false;

    const hasData =
      (vetData.name && vetData.name.trim()) ||
      (vetData.clinicName && vetData.clinicName.trim()) ||
      (vetData.phoneNumber && vetData.phoneNumber.trim()) ||
      (vetData.email && vetData.email.trim()) ||
      (vetData.address && vetData.address.trim());

    return !!hasData;
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl p-4">
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-4">
            Loading your dog&apos;s profile...
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
            We cannot show your dog&apos;s profile at the moment. Try refreshing
            the page.
          </h2>
          <p className="text-accent">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl relative">
      <div className="pb-20">
        <Button
          href="/my-dogs"
          variant="ghost"
          icon={<RiArrowLeftSLine className="w-7 h-7" />}
          className="mb-4 lg:mb-8"
        >
          Back to My Dogs
        </Button>

        <div className="flex items-center justify-between mb-8 lg:mb-12">
          <h1 className="text-2xl font-bold text-foreground">
            {dogName || "Dog"}&apos;s Profile
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Dog Info Section */}
          <div className="bg-main-text-bg rounded-lg shadow-md p-6 border border-primary-light/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Dog Info
              </h2>
              <Button
                href={`/my-dogs/add-dog?edit=${dogId}&section=info`}
                variant="ghost"
                icon={<RiEditLine className="w-4 h-4" />}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Edit
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Dog Photo */}
              <div className="flex-shrink-0">
                <div className="w-full sm:w-40 h-40 rounded-lg overflow-hidden flex items-center justify-center border-2 border-primary/30 relative group">
                  {selectedDog?.photo?.url ? (
                    <Image
                      src={selectedDog.photo.url}
                      alt={`${selectedDog.name}'s photo`}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                      <FaDog className="w-12 h-12 text-primary/50 mb-2" />
                      <p className="text-xs text-primary/60 mb-3">No photo</p>
                      <Button
                        href={`/my-dogs/add-dog?edit=${dogId}&section=info`}
                        variant="secondary"
                        size="sm"
                        className="text-xs px-3 py-1"
                      >
                        Add Photo
                      </Button>
                    </div>
                  )}

                  {/* Edit Photo Overlay - only visible when photo exists */}
                  {selectedDog?.photo?.url && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        href={`/my-dogs/add-dog?edit=${dogId}&section=info`}
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                      >
                        Change Photo
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dog Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="font-semibold text-lg text-foreground">
                    {dogName}
                  </p>
                </div>

                <div className="flex flex-wrap gap-6">
                  {selectedDog?.age ? (
                    <div>
                      <p className="text-sm text-foreground/70">Age</p>
                      <p className="font-medium text-foreground">
                        {selectedDog.age} years
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-foreground/70">Age</p>
                      <p className="font-medium text-foreground/50 italic">
                        Unknown
                      </p>
                    </div>
                  )}

                  {selectedDog?.breed ? (
                    <div>
                      <p className="text-sm text-foreground/70">Breed</p>
                      <p className="font-medium text-foreground">
                        {selectedDog.breed.charAt(0).toUpperCase() +
                          selectedDog.breed.slice(1)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-foreground/70">Breed</p>
                      <p className="font-medium text-foreground/50 italic">
                        Unknown
                      </p>
                    </div>
                  )}
                  {selectedDog?.gender ? (
                    <div>
                      <p className="text-sm text-foreground/70">Gender</p>
                      <p className="font-medium text-foreground">
                        {selectedDog.gender.charAt(0).toUpperCase() +
                          selectedDog.gender.slice(1)}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-foreground/70">Gender</p>
                      <p className="font-medium text-foreground/50 italic">
                        Unknown
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Resting Respiratory Rate Section */}
          <div className="bg-main-text-bg rounded-lg shadow-md p-6 border border-primary-light/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Resting Respiratory Rate
              </h2>
              <Button
                href={`/my-dogs/add-dog?edit=${dogId}&section=breathing`}
                variant="ghost"
                icon={<RiEditLine className="w-4 h-4" />}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Edit
              </Button>
            </div>

            <div className="space-y-4">
              {/* Maximum Breath Rate */}
              <div className="bg-primary-light rounded-lg p-4 border border-primary-light/60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-dark">
                      Maximum Breath Rate
                    </p>
                    <p className="text-2xl font-bold text-primary-dark">
                      {selectedDog?.maxBreathingRate} BPM
                    </p>
                    <p className="text-xs text-primary">Set when adding dog</p>
                  </div>
                  <div className="text-primary text-3xl">📊</div>
                </div>
              </div>

              {/* Average Breath Rate */}
              <div className="bg-navbar-bg/60 rounded-lg p-4 border border-navbar-icons/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-dark">
                      Average Breath Rate
                    </p>
                    <p className="text-2xl font-bold text-primary-dark">
                      {averageBPM ? `${averageBPM} BPM` : "No data yet"}
                    </p>
                    <p className="text-xs text-navbar-icons">
                      {averageBPM
                        ? "Average of all logs"
                        : "Start monitoring to see average"}
                    </p>
                  </div>
                  <div className="text-navbar-icons text-3xl">💚</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Veterinarian Section */}
        <div className="bg-main-text-bg rounded-lg shadow-md p-6 mb-8 border border-primary-light/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Veterinarian
            </h2>
            <Button
              href={`/my-dogs/add-dog?edit=${dogId}&section=vet`}
              variant="ghost"
              icon={
                hasVeterinarianData() ? (
                  <RiEditLine className="w-4 h-4" />
                ) : (
                  <RiAddLine className="w-4 h-4" />
                )
              }
              className="text-sm text-primary hover:text-primary-dark"
            >
              {hasVeterinarianData() ? "Edit" : "Add"}
            </Button>
          </div>

          {hasVeterinarianData() ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDog?.veterinarian?.name && (
                <div>
                  <p className="text-sm text-foreground/70">
                    Veterinarian Name
                  </p>
                  <p className="font-medium text-foreground">
                    {selectedDog?.veterinarian?.name}
                  </p>
                </div>
              )}

              {selectedDog?.veterinarian?.clinicName && (
                <div>
                  <p className="text-sm text-foreground/70">Clinic Name</p>
                  <p className="font-medium text-foreground">
                    {selectedDog.veterinarian.clinicName}
                  </p>
                </div>
              )}
              {selectedDog?.veterinarian?.phoneNumber && (
                <div>
                  <p className="text-sm text-foreground/70">Phone Number</p>
                  <p className="font-medium text-foreground">
                    {selectedDog.veterinarian.phoneNumber}
                  </p>
                </div>
              )}
              {selectedDog?.veterinarian?.email && (
                <div>
                  <p className="text-sm text-foreground/70">Email</p>
                  <p className="font-medium text-foreground">
                    {selectedDog.veterinarian.email}
                  </p>
                </div>
              )}
              {selectedDog?.veterinarian?.address && (
                <div className="md:col-span-2">
                  <p className="text-sm text-foreground/70">Address</p>
                  <p className="font-medium text-foreground">
                    {selectedDog.veterinarian.address}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-foreground/70 mb-4">
                No veterinarian information added yet
              </p>
            </div>
          )}
        </div>

        {/* Share Data Section - Placeholder */}
        <div className="bg-main-text-bg rounded-lg shadow-md p-6 mb-8 border border-primary-light/20">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Share Data
          </h2>
          <div className="text-center py-8">
            <div className="text-primary/60 text-4xl mb-4">📊</div>
            <p className="text-foreground/70 mb-4">
              Coming soon: Share breathing data with your vet
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="ghost" disabled>
                Select Date Range
              </Button>
              <Button variant="ghost" disabled>
                Email Report
              </Button>
              <Button variant="ghost" disabled>
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Breathing Logs Section */}
        <div className="bg-main-text-bg rounded-lg shadow-md p-6 mb-8 border border-primary-light/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Breathing Logs
            </h2>
          </div>

          {breathingLogs.length === 0 ? (
            <div className="bg-main-text-bg rounded-lg shadow-md p-6 border border-primary-light/20">
              <div className="text-center py-8">
                <div className="text-primary/60 text-4xl mb-4">📊</div>
                <p className="text-foreground/70 mb-4">
                  No breathing logs available
                </p>
                <p className="text-sm text-foreground/50">
                  Start monitoring breathing to see data here
                </p>
              </div>
            </div>
          ) : (
            <>
              <BreathingLogNavigation
                logs={breathingLogs}
                selectedDog={selectedDog}
              />
              {logState.viewType === "chart" ? (
                <BreathingLogChart
                  logs={breathingLogs}
                  selectedDog={selectedDog}
                />
              ) : (
                <BreathingLogCalendar logs={breathingLogs} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Sticky Monitor Breathing Button */}
      <div className="fixed bottom-8 max-w-5xl mt-12 w-full">
        <Button
          href={`/my-dogs/${dogId}/monitor-breathing`}
          variant="primary"
          size="lg"
          className="w-full cursor-pointer"
        >
          <div className="flex items-center">
            <TbLungsFilled className="w-7 h-7 inline-block mr-4 text-foreground" />{" "}
            Monitor Breathing Now
          </div>
        </Button>
      </div>
    </div>
  );
}
