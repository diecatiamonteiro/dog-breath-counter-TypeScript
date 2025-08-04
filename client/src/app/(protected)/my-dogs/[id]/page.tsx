/**
 * @file app/(protected)/my-dogs/[id]/page.tsx
 * @description Dog profile page
 *              Includes: dog info, veterinarian info, resting respiratory rate, breathing logs, and share data
 */

"use client";

import { useAppContext } from "@/context/Context";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import BreathingLogChart from "@/components/breathingLogs/BreathingLogChart";
import BreathingLogCalendar from "@/components/breathingLogs/BreathingLogCalendar";
import BreathingLogNavigation from "@/components/breathingLogs/BreathingLogNavigation";
import { getAllBreathingLogs } from "@/api/breathingLogApi";
import { getSelectedDog } from "@/api/dogApi";
import Image from "next/image";
import DateRangePicker from "@/components/shareData/DateRangePicker";
import {
  generateBreathingLogPdf,
  sendBreathingLogEmail,
} from "@/api/breathingLogApi";
import LoadingSpinner from "@/app/loading";
import { RiArrowLeftSLine, RiAddLine, RiEditLine } from "react-icons/ri";
import EmailReportFormModal from "@/components/shareData/EmailReportFormModal";
import { FaDog } from "react-icons/fa";
import { TbLungsFilled } from "react-icons/tb";
import { PiHeartbeatBold } from "react-icons/pi";
import { GrDocumentDownload } from "react-icons/gr";
import { LuTriangleAlert } from "react-icons/lu";
import { TfiEmail } from "react-icons/tfi";
import { FaLightbulb } from "react-icons/fa";

export default function DogProfilePage() {
  const params = useParams();
  const dogId = params.id as string;
  const { dogState, dogDispatch, logState, logDispatch } = useAppContext();
  const { selectedDog } = dogState;
  const { breathingLogs } = logState;

  // State for Share Data functionality
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  // Load breathing logs on mount and when dogId changes
  useEffect(() => {
    getAllBreathingLogs(logDispatch, dogId);
  }, [dogId, logDispatch]);

  // Load dog data on mount and when dogId changes (force refresh)
  useEffect(() => {
    getSelectedDog(dogDispatch, dogId);
  }, [dogId, dogDispatch]);

  // Handle date range changes
  const handleDateRangeChange = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Handle PDF download
  const handleDownloadPdf = async () => {
    if (!selectedDog) return;

    setIsLoadingPdf(true);
    try {
      const pdfUrl = await generateBreathingLogPdf(
        logDispatch,
        dogId,
        startDate || undefined,
        endDate || undefined
      );

      // Create download link
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `breathing-report_${selectedDog.name}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL because it's no longer needed until the next time the user downloads a PDF
      window.URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Handle email sending
  const handleSendEmail = async (recipientEmail: string) => {
    if (!selectedDog) return;

    setIsLoadingEmail(true);
    try {
      await sendBreathingLogEmail(
        logDispatch,
        dogId,
        recipientEmail,
        startDate || undefined,
        endDate || undefined
      );
      setShowEmailForm(false);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error; // Re-throw to let the form handle the error
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const dogName =
    selectedDog?.name &&
    selectedDog.name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  // Calculate average BPM from breathing logs for this dog
  const calculateAverageBPM = () => {
    if (breathingLogs.length === 0) return null;

    const totalBPM = breathingLogs.reduce((sum, log) => sum + log.bpm, 0);
    return Math.round(totalBPM / breathingLogs.length);
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

  if (!selectedDog) {
    return (
      <div className="max-w-5xl p-4">
        <div className="text-left">
          <h2 className="text-xl font-semibold mb-2">
            Loading your dog&apos;s profile
          </h2>
          <p className="text-sm text-foreground/70 mb-4 text-left">
            If this takes too long, try refreshing the page
          </p>
          <LoadingSpinner />
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
          <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 border border-primary-light/20">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dog Photo */}
              <div className="flex-shrink-0">
                <div className="w-full lg:w-48 h-48 rounded-xl overflow-hidden flex items-center justify-center border-2 border-primary/20 relative group shadow-lg">
                  {selectedDog?.photo?.url ? (
                    <Image
                      src={selectedDog.photo.url}
                      alt={`${selectedDog.name}'s photo`}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <FaDog className="w-16 h-16 text-primary/40 mb-3" />
                      <p className="text-sm text-primary/60 mb-4 font-medium">
                        No photo
                      </p>
                      <Button
                        href={`/my-dogs/add-dog?edit=${dogId}&section=info`}
                        variant="secondary"
                        size="sm"
                        className="text-xs px-4 py-2 bg-primary/10 hover:bg-primary/20 border-primary/20"
                      >
                        Add Photo
                      </Button>
                    </div>
                  )}

                  {/* Edit Photo Overlay - only visible when photo exists */}
                  {selectedDog?.photo?.url && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                      <Button
                        href={`/my-dogs/add-dog?edit=${dogId}&section=info`}
                        variant="secondary"
                        size="sm"
                        className="text-xs bg-white/90 hover:bg-white text-gray-800 border-0"
                      >
                        Change Photo
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dog Details */}
              <div className="flex-1 space-y-6">
                {/* Dog Name and Stats */}
                <div className="space-y-4">
                  <h3 className="font-bold text-2xl text-foreground">
                    {dogName}
                  </h3>

                  {/* Dog Stats - Simple format like vet info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Age */}
                    {selectedDog?.age && (
                      <div>
                        <p className="text-sm text-foreground/70">Age</p>
                        <p className="font-medium text-foreground">
                          {selectedDog.age} years
                        </p>
                      </div>
                    )}

                    {/* Breed */}
                    {selectedDog?.breed && (
                      <div>
                        <p className="text-sm text-foreground/70">Breed</p>
                        <p className="font-medium text-foreground">
                          {selectedDog.breed.charAt(0).toUpperCase() +
                            selectedDog.breed.slice(1)}
                        </p>
                      </div>
                    )}

                    {/* Gender */}
                    {selectedDog?.gender && (
                      <div>
                        <p className="text-sm text-foreground/70">Gender</p>
                        <p className="font-medium text-foreground">
                          {selectedDog.gender.charAt(0).toUpperCase() +
                            selectedDog.gender.slice(1)}
                        </p>
                      </div>
                    )}

                    {/* Show message if no info available */}
                    {!selectedDog?.age &&
                      !selectedDog?.breed &&
                      !selectedDog?.gender && (
                        <div className="md:col-span-2 text-left py-4">
                          <p className="text-foreground/70">
                            No dog information added yet.
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ***************** VETERINARIAN SECTION ***************** */}
          <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 border border-primary-light/20">
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
              <div className="text-left py-8">
                <p className="text-foreground/70 mb-4">
                  No veterinarian information added yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ***************** RESTING RESPIRATORY RATE SECTION ***************** */}
        <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 mb-8 border border-primary-light/20">
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

          <div className="flex flex-row gap-4">
            {/* Maximum Breath Rate */}
            <div className="rounded-lg p-4 border border-navbar-icons flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary/80">
                    Maximum Breath Rate
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {selectedDog?.maxBreathingRate} BPM
                  </p>
                  <p className="text-xs text-primary-dark">
                    Set when adding dog
                  </p>
                </div>
                <div className="text-primary text-3xl">
                  <LuTriangleAlert />
                </div>
              </div>
            </div>

            {/* Average Breath Rate */}
            <div className="rounded-lg p-4 border border-navbar-icons flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary/80">
                    Average Breath Rate
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {averageBPM ? `${averageBPM} BPM` : "No data yet"}
                  </p>
                  <p className="text-xs text-primary-dark">
                    {averageBPM
                      ? "Average of all logs"
                      : "Start monitoring to see average"}
                  </p>
                </div>
                <div className="text-primary text-3xl">
                  <PiHeartbeatBold />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ***************** BREATHING LOGS SECTION ***************** */}
        <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 mb-8 border border-primary-light/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Breathing Logs
            </h2>
          </div>

          {breathingLogs.length === 0 ? (
            <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 border border-primary-light/20">
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
              <BreathingLogNavigation logs={breathingLogs} />
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

        {/* ***************** SHARE DATA SECTION ***************** */}
        <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 mb-8 border border-primary-light/20">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Share Data
          </h2>

          {breathingLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-primary/60 text-4xl mb-4">📊</div>
              <p className="text-foreground/70 mb-4">
                No breathing logs available to share
              </p>
              <p className="text-sm text-foreground/50">
                Start monitoring breathing to generate reports
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Date Range Picker */}
              <DateRangePicker
                onDateRangeChange={handleDateRangeChange}
                className="mb-4"
              />

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleDownloadPdf}
                  variant="primary"
                  disabled={isLoadingPdf}
                  className="flex items-center gap-2"
                  icon={<GrDocumentDownload className="w-5 h-5" />}
                >
                  {isLoadingPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating PDF...
                    </>
                  ) : (
                    <> Download PDF Report</>
                  )}
                </Button>

                <Button
                  onClick={() => setShowEmailForm(true)}
                  variant="primary"
                  disabled={isLoadingEmail}
                  className="flex items-center gap-2"
                  icon={<TfiEmail className="w-5 h-5" />}
                >
                  Email Report
                </Button>
              </div>

              {/* Info Text */}
              <div className="text-sm text-foreground/60 bg-primary/5 p-3 rounded-md">
                <p className="mb-1">
                  <strong>PDF Report includes:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Dog information and breathing rate summary</li>
                  <li>Detailed breathing logs for the selected date range</li>
                  <li>Average, lowest, and highest BPM values</li>
                </ul>
                {!startDate && !endDate && (
                  <div className="flex items-center mt-4">
                    <FaLightbulb className="w-4 h-4 inline-block mr-2 text-primary" />
                    <p className="text-primary font-semibold">
                      Select a date range to customize your report, or leave
                      empty for the last 30 days.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ***************** STICKY MONITOR BREATHING BUTTON ***************** */}
      <div className="fixed bottom-8 lg:max-w-5xl mb-16 lg:mb-0 mt-12 w-full">
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

      {/* Email Report Form Modal */}
      <EmailReportFormModal
        onSendEmail={handleSendEmail}
        onCancel={() => setShowEmailForm(false)}
        isVisible={showEmailForm}
        isLoading={isLoadingEmail}
      />
    </div>
  );
}
