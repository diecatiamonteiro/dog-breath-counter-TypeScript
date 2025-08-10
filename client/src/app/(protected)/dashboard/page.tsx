"use client";

import { updateUserProfile } from "@/api/userApi";
import LoadingSpinner from "@/app/loading";
import Button from "@/components/Button";
import { useAppContext } from "@/context/Context";
import { useEffect, useRef, useState } from "react";

export default function DashboardPage() {
  const { userState, userDispatch } = useAppContext();
  const { user, isLoading } = userState;

  const [editData, setEditData] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user]);

  // When entering edit mode, scroll to top and briefly highlight the form wrapper
  useEffect(() => {
    if (editData) {
      // Scroll page to top so form appears at the top
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      // Add highlight ring similar to dog page sections
      const el = formWrapperRef.current;
      if (el) {
        el.classList.add("ring-2", "ring-primary", "ring-opacity-50");
        const timer = setTimeout(() => {
          el.classList.remove("ring-2", "ring-primary", "ring-opacity-50");
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [editData]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) return null;

  // Format user name
  const userName =
    user?.firstName.charAt(0).toUpperCase() +
    user?.firstName.slice(1) +
    " " +
    user?.lastName.charAt(0).toUpperCase() +
    user?.lastName.slice(1);
  const isGoogleAccount = Boolean(user?.googleId);

  const handleEditData = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
    setFormErrors({});
    setServerErrors("");
    setSuccessMessage("");
    setEditData(true);
  };

  const handleCancel = () => {
    setEditData(false);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
    setFormErrors({});
    setServerErrors("");
    setSuccessMessage("");
  };


  const validateForm = () => {
    const formErrors: Record<string, string> = {};

    if (!formData.firstName?.trim()) {
      formErrors.firstName = "First name is required";
    }
    if (!formData.lastName?.trim()) {
      formErrors.lastName = "Last name is required";
    }
    if (!formData.email?.trim()) {
      formErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = "Email is invalid";
    }

    return formErrors;
  };

  const handleInputChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    setServerErrors("");
    setSuccessMessage("");

    try {
      const payload: { firstName?: string; lastName?: string; email?: string } = {
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      if (!isGoogleAccount) {
        payload.email = formData.email;
      }
      const response = await updateUserProfile(userDispatch, payload);
      
      // Update formData with the new user data from response
      setFormData({
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
      });
      
      // Exit edit mode
      setEditData(false);
      setServerErrors("");
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setServerErrors("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (editData) {
    return (
      <div ref={formWrapperRef} className="transition-all duration-300 rounded-lg p-1">
        <div className="bg-main-text-bg rounded-lg p-6 border border-primary-light/20">
          {serverErrors && (
            <div className="mb-4 p-3 bg-accent/20 border border-accent rounded-lg">
              <p className="text-accent">{serverErrors}</p>
            </div>
          )}
          <form onSubmit={handleInputChange} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1 text-foreground">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="e.g., Alex"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground ${
                    formErrors.firstName ? "border-accent" : "border-primary/30 focus:border-primary"
                  }`}
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-accent">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1 text-foreground">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="e.g., Taylor"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground ${
                    formErrors.lastName ? "border-accent" : "border-primary/30 focus:border-primary"
                  }`}
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-accent">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-foreground">{`Email${isGoogleAccount ? " (managed by Google)" : ""}`}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="e.g., alex@example.com"
                disabled={isGoogleAccount}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground ${
                  isGoogleAccount
                    ? "border-primary/30 bg-foreground/5 text-foreground/70"
                    : formErrors.email
                    ? "border-accent"
                    : "border-primary/30 focus:border-primary"
                }`}
              />
              {formErrors.email && <p className="mt-1 text-sm text-accent">{formErrors.email}</p>}
              {isGoogleAccount && (
                <p className="mt-1 text-xs text-foreground/60">
                  To change your email, update it in your Google Account.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                Save
              </Button>
              <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      {user && <h2 className="mt-1 text-foreground/80">Hi, {userName}!</h2>}
      {successMessage && (
        <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          {successMessage}
        </p>
      )}

      <div className="mt-8">
        <div className="bg-main-text-bg rounded-lg p-6 border border-primary-light/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-foreground/80">First Name</p>
              <p className="mt-1 font-medium text-foreground">{user.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-foreground/80">Last Name</p>
              <p className="mt-1 font-medium text-foreground">{user.lastName}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-foreground/80">Email</p>
              <p className="mt-1 font-medium text-foreground">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="secondary"
          className="mt-4"
          onClick={handleEditData}
          disabled={isSubmitting}
        >
          Edit
        </Button>
      </div>

      {/* Footer Section - only visible until lg; from lg, info below is placed in the footer in NavigationDesktop.tsx */}
      <div className="mt-8 py-2 border-t border-primary/20 lg:hidden">
        <div className="text-xs text-foreground/70 text-left">
          <p>&copy; 2025 Paw Pulse. All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
