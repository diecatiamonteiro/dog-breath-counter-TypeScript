/**
 * @file client/src/app/(protected)/my-dogs/[id]/page.tsx
 * @description Dog profile page
 *
 * Displays:
 * - Dog information and photo
 * - Veterinarian details
 * - Resting respiratory rate (max and average BPM)
 * - Breathing logs (chart/calendar view with delete option)
 * - Share data functionality (PDF download, email report)
 */

"use client";

import { useAppContext } from "@/context/Context";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import BreathingLogChart from "@/components/breathingLogs/BreathingLogChart";
import BreathingLogCalendar from "@/components/breathingLogs/BreathingLogCalendar";
import BreathingLogNavigation from "@/components/breathingLogs/BreathingLogNavigation";
import { deleteBreathingLog, getAllBreathingLogs } from "@/api/breathingLogApi";
import { getSelectedDog } from "@/api/dogApi";
import Image from "next/image";
import DateRangePicker from "@/components/shareData/DateRangePicker";
import {
  generateBreathingLogPdf,
  sendBreathingLogEmail,
} from "@/api/breathingLogApi";
import LoadingSpinner from "@/app/loading";
import EmailReportFormModal from "@/components/shareData/EmailReportFormModal";
import { RiArrowLeftSLine, RiAddLine, RiEditLine } from "react-icons/ri";
import { FaDog, FaHospital, FaLungs, FaPaw } from "react-icons/fa";
import { TbLungsFilled } from "react-icons/tb";
import { PiHeartbeatBold } from "react-icons/pi";
import { GrDocumentDownload } from "react-icons/gr";
import { LuTriangleAlert, LuShare2 } from "react-icons/lu";
import { TfiEmail } from "react-icons/tfi";
import { BsClipboardData } from "react-icons/bs";
import InfoDialog from "@/components/InfoDialog";

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
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState<string>("");

  // Load breathing logs on mount and when dogId changes
  useEffect(() => {
    getAllBreathingLogs(logDispatch, dogId);
  }, [dogId, logDispatch]);

  // Load dog data on mount and when dogId changes (force refresh)
  useEffect(() => {
    getSelectedDog(dogDispatch, dogId);
  }, [dogId, dogDispatch]);

  const handleDateRangeChange = (start: string | null, end: string | null) => {
    setStartDate(start);
    setEndDate(end);
  };

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

  // Show email sent message for 5 seconds
  const handleShowEmailSentMessage = () => {
    setIsEmailSent(true);
    setTimeout(() => {
      setIsEmailSent(false);
      setRecipientEmail("");
    }, 5000);
  };

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
      setRecipientEmail(recipientEmail);
      handleShowEmailSentMessage();
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

  const handleDeleteBreathingLog = async (logId: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this log? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteBreathingLog(logDispatch, dogId, logId);
      // Breathing log will be automatically removed from state by the reducer
    } catch (error) {
      console.error("Failed to delete breathing log:", error);
      // Error is already handled by the API function and displayed in state
    }
  };

  if (!selectedDog) {
    return (
      <div className="max-w-5xl p-4">
        <div className="text-left">
          <div className="flex flex-wrap gap-2">
            <h2 className="text-lg md:text-xl text-primary font-semibold mb-2">
              Loading your dog&apos;s profile...
            </h2>
            <LoadingSpinner />
          </div>
          <p className="text-sm text-foreground/70 mb-4">
            If this takes too long, try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl relative">
      <div className="mb-36">
        <div className="flex flex-wrap gap-2 justify-between align-center">
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-2xl font-bold text-foreground">
              {dogName || "Dog"}&apos;s Profile
            </h1>
          </div>
          <Button
            href="/my-dogs"
            size="sm"
            variant="ghost"
            icon={<RiArrowLeftSLine className="w-5 h-5" aria-hidden="true" />}
          >
            Back to My Dogs
          </Button>
        </div>

        <div className="w-full my-8">
          <Button
            href={`/my-dogs/${dogId}/monitor-breathing`}
            variant="primary"
            size="lg"
            ariaLabel={`Track ${dogName}'s Breathing`}
            className="w-full"
          >
            <div className="flex items-center">
              <TbLungsFilled
                className="w-7 h-7 inline-block mr-2 md:mr-4 text-background"
                aria-hidden="true"
              />{" "}
              Track Breathing
            </div>
          </Button>
        </div>

        {/* ***************** DOG INFO SECTION ***************** */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 border border-primary-light/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FaPaw
                  className="w-5 h-5 md:w-6 md:h-6 inline-block mr-2 md:mr-4 text-foreground"
                  aria-hidden="true"
                />
                <h2 className="text-base md:text-xl font-semibold text-foreground">
                  Dog
                </h2>
              </div>

              <Button
                href={`/my-dogs/add-dog?edit=${dogId}&section=info`}
                size="sm"
                variant="ghost"
                icon={<RiEditLine className="w-4 h-4" aria-hidden="true" />}
                ariaLabel={`Edit ${dogName} dog data`}
              >
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Dog Photo */}
              <div className="">
                <div
                  className="w-full h-48 rounded-xl overflow-hidden flex items-center justify-center border-2 border-primary/20 relative group shadow-lg"
                  tabIndex={0}
                  aria-label={`${
                    selectedDog?.name ?? "Dog"
                  } photo. Press Tab to change photo.`}
                >
                  {selectedDog?.photo?.url ? (
                    <Image
                      src={selectedDog.photo.url}
                      alt={`${selectedDog.name}'s photo`}
                      width={128}
                      height={32}
                      className="w-full h-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <FaDog
                        className="w-16 h-16 text-primary/40 mb-3"
                        aria-hidden="true"
                      />
                      <p className="text-sm text-primary/60 mb-4 font-medium">
                        No photo
                      </p>
                      <Button
                        href={`/my-dogs/add-dog?edit=${dogId}&section=info`}
                        variant="secondary"
                        size="sm"
                        ariaLabel={`Add photo to ${dogName}'s profile`}
                      >
                        Add Photo
                      </Button>
                    </div>
                  )}

                  {/* Edit Photo Overlay - only visible when photo exists */}
                  {selectedDog?.photo?.url && (
                    <div
                      className="absolute inset-0 hidden items-center justify-center bg-black/60
                group-hover:flex group-focus-within:flex"
                    >
                      <Button
                        href={`/my-dogs/add-dog?edit=${dogId}&section=info`}
                        variant="secondary"
                        size="sm"
                        ariaLabel={`Change ${dogName}'s photo`}
                      >
                        Change Photo
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dog Details */}
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-xl md:text-2xl text-foreground">
                    {dogName}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Age */}
                    {selectedDog?.age && (
                      <div>
                        <p className="text-sm text-foreground/70">Age</p>
                        <p className="font-medium text-foreground">
                          {selectedDog.age}
                        </p>
                      </div>
                    )}

                    {selectedDog?.gender && (
                      <div>
                        <p className="text-sm text-foreground/70">Gender</p>
                        <p className="font-medium text-foreground">
                          {selectedDog.gender.charAt(0).toUpperCase() +
                            selectedDog.gender.slice(1)}
                        </p>
                      </div>
                    )}

                    {selectedDog?.breed && (
                      <div className="leading-tight">
                        <p className="text-sm text-foreground/70">Breed</p>
                        <p className="font-medium text-foreground">
                          {selectedDog.breed.charAt(0).toUpperCase() +
                            selectedDog.breed.slice(1)}
                        </p>
                      </div>
                    )}

                    {/* Show message if no info available */}
                    {!selectedDog?.age &&
                      !selectedDog?.breed &&
                      !selectedDog?.gender && (
                        <div className="md:col-span-2 text-left py-4">
                          <p className="text-foreground/70 leading-tight">
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
              <div className="flex items-center">
                <FaHospital
                  className="w-5 h-5 md:w-6 md:h-6 inline-block mr-2 md:mr-4 text-foreground"
                  aria-hidden="true"
                />
                <h2 className="text-base md:text-xl font-semibold text-foreground">
                  Veterinarian
                </h2>
              </div>

              <Button
                href={`/my-dogs/add-dog?edit=${dogId}&section=vet`}
                size="sm"
                variant="ghost"
                icon={
                  hasVeterinarianData() ? (
                    <RiEditLine className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <RiAddLine className="w-4 h-4" aria-hidden="true" />
                  )
                }
                ariaLabel={
                  hasVeterinarianData()
                    ? `Edit ${dogName}'s Veterinarian data`
                    : `Add ${dogName}'s Veterinarian data`
                }
              >
                {hasVeterinarianData() ? "Edit" : "Add"}
              </Button>
            </div>

            {hasVeterinarianData() ? (
              <div className="grid grid-cols-2 gap-4">
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
              <div className="text-left">
                <p className="text-foreground/70 leading-tight mb-4">
                  No veterinarian information added yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ***************** RESTING RESPIRATORY RATE SECTION ***************** */}
        <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 mb-4 sm:mb-6 md:mb-8 border border-primary-light/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaLungs className="w-5 h-5 md:w-6 md:h-6 inline-block mr-2 md:md:mr-4 text-foreground" />
              <h2 className="text-base md:text-xl font-semibold text-foreground mr-1 md:mr-2">
                Breathing Rate
              </h2>
              <InfoDialog title="Breathing Rate">
                <p>
                  The{" "}
                  <span className="font-semibold">maximum breathing rate </span>
                  you find here is the value you set when you created your dog’s
                  profile. Your dog’s{" "}
                  <span className="font-semibold">
                    average breathing rate{" "}
                  </span>{" "}
                  is calculated using this max BPM.
                </p>
                <p>
                  Since most dogs rest between 15-30 breaths per minute (BPM),
                  30 is the recommended max by default, but your vet may suggest
                  adjusting it based on your dog’s health.
                </p>
              </InfoDialog>
            </div>

            <Button
              href={`/my-dogs/add-dog?edit=${dogId}&section=breathing`}
              variant="ghost"
              size="sm"
              icon={<RiEditLine className="w-4 h-4" aria-hidden="true" />}
              ariaLabel={`Edit ${dogName}'s breathing rate`}
            >
              Edit
            </Button>
          </div>

          <div className="flex flex-row gap-4">
            <div className="rounded-lg p-4 border border-navbar-icons flex-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-primary leading-tight">
                    Max Breathing Rate
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-primary leading-tight">
                    {selectedDog?.maxBreathingRate} BPM
                  </p>
                  <p className="text-xs text-primary leading-tight">
                    Set when adding dog
                  </p>
                </div>
                <div className="text-primary text-2xl md:text-3xl xl:text-4xl">
                  <LuTriangleAlert aria-hidden="true" />
                </div>
              </div>
            </div>

            <div className="rounded-lg p-4 border border-navbar-icons flex-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-primary leading-tight">
                    Average Breathing Rate
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-primary leading-tight">
                    {averageBPM ? `${averageBPM} BPM` : "No data"}
                  </p>
                  <p className="text-xs text-primary leading-tight">
                    {averageBPM
                      ? "Average of all logs"
                      : "Start tracking breathing to see average"}
                  </p>
                </div>
                <div className="text-primary text-2xl md:text-3xl xl:text-4xl">
                  <PiHeartbeatBold aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ***************** BREATHING LOGS SECTION ***************** */}
        <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 md:p-6 mb-4 sm:mb-6 md:mb-8 border border-primary-light/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BsClipboardData
                className="w-5 h-5 md:w-6 md:h-6 inline-block mr-2 md:mr-4 text-foreground"
                aria-hidden="true"
              />
              <h2 className="text-base md:text-xl font-semibold text-foreground">
                Breathing Logs
              </h2>
            </div>
          </div>

          {breathingLogs.length === 0 ? (
            <div className="flex flex-col gap-4 bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 border border-primary-light/20">
              <p className="text-left text-foreground/70 leading-tight">
                No breathing logs available yet.
              </p>
              <Button
                href={`/my-dogs/${dogId}/monitor-breathing`}
                variant="primary"
                size="md"
                ariaLabel={`Start tracking ${dogName}'s breathing`}
              >
                <div className="flex items-center">
                  <TbLungsFilled
                    className="w-5 h-5 md:w-6 md:h-6 inline-block mr-2 md:mr-4 text-foreground"
                    aria-hidden="true"
                  />{" "}
                  Start Tracking Breathing
                </div>
              </Button>
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
                <BreathingLogCalendar
                  logs={breathingLogs}
                  selectedDog={selectedDog}
                  onDeleteLog={handleDeleteBreathingLog}
                />
              )}
            </>
          )}
        </div>

        {/* ***************** SHARE DATA SECTION ***************** */}
        <div className="bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 mb-4 sm:mb-6 md:mb-8 border border-primary-light/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <LuShare2
                className="w-5 h-5 md:w-6 md:h-6 inline-block mr-2 md:mr-4 text-foreground"
                aria-hidden="true"
              />
              <h2 className="text-base md:text-xl font-semibold text-foreground">
                Share Report
              </h2>
            </div>
          </div>

          {breathingLogs.length === 0 ? (
            <div className="flex flex-col gap-4 bg-main-text-bg rounded-lg shadow-md p-3 md:p-6 border border-primary-light/20">
              <p className="text-left text-foreground/70 leading-tight">
                No breathing reports available to share yet.
              </p>
              <Button
                href={`/my-dogs/${dogId}/monitor-breathing`}
                variant="primary"
                size="md"
                ariaLabel={`Start tracking ${dogName}'s breathing`}
              >
                <div className="flex items-center">
                  <TbLungsFilled
                    className="w-5 h-5 md:w-6 md:h-6 inline-block mr-2 md:mr-4 text-foreground"
                    aria-hidden="true"
                  />{" "}
                  Start Tracking Breathing
                </div>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <DateRangePicker
                onDateRangeChange={handleDateRangeChange}
                className="mb-4"
              />

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleDownloadPdf}
                  variant="secondary"
                  size="sm"
                  disabled={isLoadingPdf}
                  className="flex items-center gap-2 w-full sm:w-fit"
                  icon={
                    <GrDocumentDownload
                      className="w-5 h-5"
                      aria-hidden="true"
                    />
                  }
                  ariaLabel={
                    isLoadingPdf
                      ? `Generating ${dogName}'s Report...`
                      : `Download ${dogName}'s Report`
                  }
                >
                  {isLoadingPdf ? (
                    <>Generating Report...</>
                  ) : (
                    <> Download Report</>
                  )}
                </Button>

                <Button
                  onClick={() => setShowEmailForm(true)}
                  variant="secondary"
                  size="sm"
                  disabled={isLoadingEmail}
                  ariaLabel={`Email ${dogName}'s report`}
                  className="flex items-center gap-2 w-full sm:w-fit"
                  icon={<TfiEmail className="w-5 h-5" aria-hidden="true" />}
                >
                  Email Report
                </Button>

                {isEmailSent && (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-primary">
                      Email is being sent to {recipientEmail} 📧
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {breathingLogs.length != 0 && (
          <div className="w-full mt-16">
            <Button
              href={`/my-dogs/${dogId}/monitor-breathing`}
              variant="primary"
              size="lg"
              ariaLabel={`Track ${dogName}'s breathing`}
              className="w-full"
            >
              <div className="flex items-center">
                <TbLungsFilled
                  className="w-7 h-7 inline-block mr-2 md:mr-4 text-background"
                  aria-hidden="true"
                />{" "}
                Track Breathing
              </div>
            </Button>
          </div>
        )}
      </div>

      <EmailReportFormModal
        onSendEmail={handleSendEmail}
        onCancel={() => setShowEmailForm(false)}
        isVisible={showEmailForm}
        isLoading={isLoadingEmail}
      />
    </div>
  );
}
