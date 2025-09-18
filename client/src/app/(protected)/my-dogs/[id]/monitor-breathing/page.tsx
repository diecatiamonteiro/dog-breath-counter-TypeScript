/**
 * @file app/(protected)/my-dogs/[id]/monitor-breathing/page.tsx
 * @description Count breaths per minute
 */

"use client";

import { createBreathingLog } from "@/api/breathingLogApi";
import { getSelectedDog } from "@/api/dogApi";
import Button from "@/components/Button";
import { useAppContext } from "@/context/Context";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { RiArrowLeftSLine } from "react-icons/ri";

export default function MonitorBreathingPage() {
  const params = useParams();
  const dogId = params.id as string;
  const { dogState, dogDispatch, logDispatch } = useAppContext();
  const {
    selectedDog
  } = dogState;


  const [selectedDuration, setSelectedDuration] = useState(15);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(selectedDuration);
  const [breathCount, setBreathCount] = useState(0);
  const [comment, setComment] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  // Load dog data if not already loaded so dog data persists on page refresh
  useEffect(() => {
    if (!selectedDog) {
      getSelectedDog(dogDispatch, dogId);
    }
  }, [selectedDog, dogId, dogDispatch]);

  // Format dog name
  const dogName =
    selectedDog?.name &&
    selectedDog.name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const handleSetDuration = (duration: number) => {
    setSelectedDuration(duration);
    setTimeRemaining(duration);
  };

  // Set time remaining to selected duration
  useEffect(() => {
    setTimeRemaining(selectedDuration);
  }, [selectedDuration]);

  // Handle timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isMonitoring && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isMonitoring) {
      // Stop timer
      setIsMonitoring(false);
      setIsComplete(true);
    }

    // Clear timer on unmount
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isMonitoring, timeRemaining]);

  // Handle breath tap
  const handleBreathTap = () => {
    if (isMonitoring) {
      setBreathCount((prev) => prev + 1);
    }
  };

  // Save breathing log
  const handleSave = async () => {
    try {
      const logData = {
        breathCount,
        duration: selectedDuration as 15 | 30 | 60,
        comment: comment.trim() || undefined,
      };
      await createBreathingLog(logDispatch, dogId, logData);
      // Success - the redirect happens via the href in the Button component
    } catch (error) {
      console.error("Failed to save breathing log:", error);
      // Error handling is managed by the createBreathingLog function and reducer
    }
  };

  // Reset state
  const handleReset = () => {
    setIsMonitoring(false);
    setIsComplete(false);
    setBreathCount(0);
    setTimeRemaining(selectedDuration);
  };

  // Calculate breaths per minute
  const calculateBPM = () => {
    return Math.round((breathCount / selectedDuration) * 60);
  };

  return (
    <div className="max-w-5xl">
      {/* Back to dog profile button */}
      <div>
        <Button
          href={`/my-dogs/${dogId}`}
          variant="ghost"
          icon={<RiArrowLeftSLine className="w-7 h-7" />}
          className="mb-4 lg:mb-16"
        >
          Back to {dogName || "Dog"}`s Profile
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-col">
        {!isComplete && (
          <div className="w-full space-y-12">
            {/* h1 and target */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                {dogName || "Dog"}`s Breathing Monitor
              </h1>
              <div>
                <p className="text-accent">
                  <span className="font-bold">Target:</span> Under{" "}
                  {selectedDog?.maxBreathingRate || 30} breaths per minute
                </p>
              </div>
            </div>

            {/* 1- DURATION SELECTION */}
            <div className="space-y-4 text-center">
              <h2 className="lg:text-lg font-semibold text-foreground">
                Choose Duration
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[15, 30, 60].map((duration) => (
                  <button 
                    key={duration}
                    onClick={() => handleSetDuration(duration)}
                    disabled={isMonitoring}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedDuration === duration
                        ? "border-primary bg-primary text-white shadow-lg"
                        : "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    } ${
                      isMonitoring
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <div className="text-2xl font-bold">{duration}</div>
                    <div className="text-sm opacity-80">seconds</div>
                  </button>
                ))}
              </div>

              {/* Start monitoring button shown when NOT monitoring */}
              {!isMonitoring && (
                <div className="space-y-4 text-center">
                  <Button
                    onClick={() => {
                      setIsMonitoring(true);
                      setBreathCount(0);
                      setTimeRemaining(selectedDuration);
                      setIsComplete(false);
                    }}
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={!selectedDuration}
                  >
                    Start Monitoring
                  </Button>
                </div>
              )}

              {/* Stop monitoring button shown when monitoring */}
              {isMonitoring && (
                <div className="text-center">
                  <Button
                    onClick={() => {
                      setIsMonitoring(false);
                      setBreathCount(0);
                      setTimeRemaining(selectedDuration);
                      setIsComplete(false);
                    }}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Stop Monitoring
                  </Button>
                </div>
              )}
            </div>

            {/* 2- BREATH COUNTER */}
            {isMonitoring && (
              <div className="grid grid-cols-3 gap-8 text-center items-center">
                {/* Timer */}
                <div>
                  <div className="text-6xl lg:text-7xl font-bold text-primary tabular-nums">
                    {timeRemaining}
                  </div>
                  <p className="text-lg text-foreground/70">seconds left</p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-xs lg:text-sm text-foreground/70 text-center">
                    Tap the heart for each breath you observe
                  </p>
                  <button
                    onClick={handleBreathTap}
                    className="w-32 h-32 lg:w-36 lg:h-36 rounded-full flex items-center justify-center transition-all duration-200 bg-accent hover:bg-accent/90 hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
                    aria-label="Tap for each breath"
                  >
                    <FaHeart className="w-16 h-16 lg:w-18 lg:h-18 text-white" />
                  </button>
                </div>
                {/* Breath Count */}
                <div>
                  <div className="text-6xl lg:text-7xl font-bold text-foreground">
                    {breathCount}
                  </div>
                  <p className="text-lg text-foreground/70">breaths</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3- RESULTS */}
        {isComplete && (
          <div className="max-w-lg w-full text-center space-y-6">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl lg:text-3xl font-bold text-foreground">
                Monitoring Complete!
              </h2>
              <p className="text-lg text-foreground/70">
                {dogName || "your dog"}`s breathing results
              </p>
            </div>

            {/* Results */}
            <div className="bg-main-text-bg rounded-2xl p-6 shadow-lg space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {calculateBPM()}
                </div>
                <p className="text-lg text-foreground/70">breaths per minute</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {selectedDuration}s
                  </div>
                  <p className="text-sm text-foreground/70">monitoring time</p>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {breathCount}
                  </div>
                  <p className="text-sm text-foreground/70">total breaths</p>
                </div>
              </div>

              {/* Health indicator */}
              <div
                className={`rounded-lg p-4 ${
                  calculateBPM() <= (selectedDog?.maxBreathingRate || 30)
                    ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
                    : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                }`}
              >
                <p
                  className={`font-semibold ${
                    calculateBPM() <= (selectedDog?.maxBreathingRate || 30)
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {calculateBPM() <= (selectedDog?.maxBreathingRate || 30)
                    ? "✓ Normal breathing rate"
                    : "⚠ Above target rate"}
                </p>
              </div>

              <div>
                <form action="">
                  <textarea
                    name="comment"
                    placeholder="Add a comment"
                    className="w-full p-2 rounded-lg border border-primary/20 bg-main-text-bg"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </form>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleSave}
                href={`/my-dogs/${dogId}`}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Save
              </Button>
              <Button
                onClick={handleReset}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                Monitor Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
