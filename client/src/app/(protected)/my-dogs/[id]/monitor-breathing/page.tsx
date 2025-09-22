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
  const { selectedDog } = dogState;

  const [selectedDuration, setSelectedDuration] = useState(15);
  const [isMonitorOpen, setIsMonitorOpen] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasStartedMonitoring, setHasStartedMonitoring] = useState(false);
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
    setIsMonitoring(true);
    setBreathCount((prev) => prev + 1);
    setHasStartedMonitoring(true);

    setIsComplete(false);
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
    setHasStartedMonitoring(false);
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
      <div className="mb-36">
        {/* Dog name & "Back to dog profile" button */}
        <div className="flex flex-wrap gap-2 justify-between align-center">
          <div className="space-y-2">
            <h1 className="text-lg md:text-2xl font-bold text-foreground">
              {dogName || "Dog"}`s Breathing Tracker
            </h1>
          </div>
          <Button
            href={`/my-dogs/${dogId}`}
            variant="secondary"
            size="sm"
            icon={<RiArrowLeftSLine className="w-5 h-5" />}
          >
            Back to {dogName || "Dog"}`s Profile
          </Button>
        </div>

        {/* Target */}
        <div className="flex flex-col mt-2">
          {!isMonitorOpen && (
            <div className="my-6 md:my-12 border border-accent text-accent p-1 text-center rounded-xl">
              <p className="text-sm">
                <span className="font-bold">Target:</span> Under{" "}
                {selectedDog?.maxBreathingRate || 30} breaths per minute
              </p>
            </div>
          )}

          {/* 1- DURATION SELECTION */}
          {!isComplete && (
            <div className="w-full space-y-8 md:space-y-12">
              <div className="text-center">
                {!isMonitorOpen && (
                  <div>
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
                          }`}
                        >
                          <div className="text-2xl font-bold">{duration}</div>
                          <div className="text-sm opacity-80">seconds</div>
                        </button>
                      ))}
                    </div>
                    <Button
                      onClick={() => {
                        setIsMonitoring(false);
                        setHasStartedMonitoring(false);
                        setBreathCount(0);
                        setTimeRemaining(selectedDuration);
                        setIsComplete(false);
                        setIsMonitorOpen(true);
                      }}
                      variant="primary"
                      size="md"
                      className="w-full mt-3"
                      disabled={!selectedDuration}
                    >
                      Start Tracking
                    </Button>
                  </div>
                )}
              </div>

              {/* 2- BREATH COUNTER */}
              {isMonitorOpen && (
                <>
                  <p className="text-sm sm:text-base text-foreground text-center font-bold">
                    Tap the heart to start and for each breath.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center items-center mb-16 lg:mb-24">
                    <div className="flex flex-col items-right">
                      <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary tabular-nums">
                        {timeRemaining}
                      </div>
                      <p className="text-sm sm:text-lg text-primary">
                        seconds left
                      </p>
                    </div>

                    <div className="flex flex-col items-center space-y-4">
                      <button
                        onClick={handleBreathTap}
                        className="relative w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full flex items-center justify-center transition-all duration-200 bg-accent hover:bg-accent/90 hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
                        aria-label="Tap for each breath"
                      >
                        <FaHeart className="w-16 h-16 md:w-20 md:h-20 text-white" />
                        {!hasStartedMonitoring ? (
                          <span className="absolute text-base text-accent font-bold">
                            Start
                          </span>
                        ) : (
                          <span className="absolute text-base text-accent font-bold">
                            Tap
                          </span>
                        )}
                      </button>
                    </div>

                    <div>
                      <div className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground">
                        {breathCount}
                      </div>
                      <p className="text-sm sm:text-lg text-foreground">
                        breaths
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <Button
                      onClick={() => {
                        setIsMonitoring(false);
                        setIsMonitorOpen(false);
                        setHasStartedMonitoring(false);
                        setBreathCount(0);
                        setTimeRemaining(selectedDuration);
                        setIsComplete(false);
                      }}
                      variant="primary"
                      size="md"
                      className="w-full"
                    >
                      Stop Tracking
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* 3- RESULTS */}
          {isComplete && (
            <div className="max-w-lg w-full text-center space-y-4 mt-8">
              <div className="bg-main-text-bg rounded-2xl p-2 md:p-6 shadow-lg space-y-4">
                <div className="text-center">
                  <div className="text-3xl md:text-5xl font-bold text-primary">
                    {calculateBPM()}
                  </div>
                  <p className="text-base md:text-lg text-foreground/70">
                    breaths per minute
                  </p>
                </div>

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
                      : `⚠ Above target rate (${selectedDog?.maxBreathingRate} BPM)`}
                  </p>
                </div>

                <div>
                  <form action="">
                    <textarea
                      name="comment"
                      placeholder="Add a comment"
                      className="w-full p-3 rounded-lg border border-primary bg-main-text-bg"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </form>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <Button
                  onClick={handleSave}
                  href={`/my-dogs/${dogId}`}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Save
                </Button>
                <Button
                  onClick={handleReset}
                  variant="primary"
                  size="md"
                  className="w-full"
                >
                  Track Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
