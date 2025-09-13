"use client";

import { deleteUserAccount, updateUserProfile } from "@/api/userApi";
import LoadingSpinner from "@/app/loading";
import Button from "@/components/Button";
import { useAppContext } from "@/context/Context";
import { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleLoginUser } from "@/api/userApi";
import { getErrorMessage, isAxiosError } from "@/lib/apiUtils";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import { IoWarning } from "react-icons/io5";


export default function DashboardPage() {
  const router = useRouter();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Delete account modal state
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }, [user]);

  // Google sync hook must be called before any early returns to preserve hook order
  const handleGoogleSync = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      try {
        await googleLoginUser(userDispatch, {
          token: tokenResponse.access_token,
        });
        setServerErrors("");
        // userState.user updates via reducer; useEffect([user]) refreshes formData
      } catch (error) {
        const msg = isAxiosError(error)
          ? getErrorMessage(error)
          : "Failed to sync from Google. Please try again.";
        setServerErrors(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      setServerErrors("Google sync failed. Please try again.");
    },
  });

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
  };

  const handleDeleteAccount = async () => {
    setIsSubmitting(true);
    try {
      await deleteUserAccount(userDispatch);
      setShowDeleteAccountModal(false);
      router.replace("/");
    } finally {
      setIsSubmitting(false);
    }
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

  const handleInputChange = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    setServerErrors("");

    try {
      const payload: { firstName?: string; lastName?: string; email?: string } =
        {
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
    } catch (error) {
      const msg = isAxiosError(error)
        ? getErrorMessage(error)
        : "Failed to update profile. Please try again.";
      setServerErrors(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      {user && (
        <h2 className="mt-3 text-foreground/80">Woof, woof, {userName}!</h2>
      )}

      {!editData ? (
        <div>
          <div className="mt-12">
            <div className="bg-main-text-bg rounded-lg p-6 border border-primary-light/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-foreground/80">First Name</p>
                  <p className="mt-1 font-medium text-foreground">
                    {user.firstName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-foreground/80">Last Name</p>
                  <p className="mt-1 font-medium text-foreground">
                    {user.lastName}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-foreground/80">Email</p>
                  <p className="mt-1 font-medium text-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <Button
              variant="secondary"
              className="mt-4"
              onClick={handleEditData}
              disabled={isSubmitting}
            >
              Edit
            </Button>

            <Button
              variant="danger"
              className="mt-4"
              onClick={() => setShowDeleteAccountModal(true)}
              disabled={isSubmitting}
            >
              Delete Account
            </Button>

            {showDeleteAccountModal && (
              <Modal
                title="Delete Account"
                onClose={() => setShowDeleteAccountModal(false)}
              >
                <div className="flex flex-col items-center justify-center space-y-2 p-6 text-center">
                <IoWarning className="w-10 h-10 text-accent" />
                  <h3 className="text-lg md:text-xl font-extrabold text-accent">
                    Are you sure you want to delete your account?
                    
                  </h3>
                  <p className="text-sm text-accent">
                    This action is irreversible and will remove all your data.
                  </p>
                  <div className="flex justify-center gap-4 pt-6">
                    <Button
                      variant="secondary"
                      onClick={() => setShowDeleteAccountModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDeleteAccount}>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        </div>
      ) : (
        // Data form to edit profile
        <div className="mt-12">
          <div className="bg-main-text-bg rounded-lg p-6 border border-primary-light/20">
            {serverErrors && (
              <div className="mb-8 p-3 bg-accent/10 border border-accent rounded-lg">
                <p className="text-accent">{serverErrors}</p>
              </div>
            )}
            <form onSubmit={handleInputChange} className="space-y-8 max-w-5xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-1 text-foreground/80"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="e.g., Alex"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground ${
                      formErrors.firstName
                        ? "border-accent"
                        : "border-primary/30 focus:border-primary"
                    }`}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-accent">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-1 text-foreground/80"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="e.g., Taylor"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-main-text-bg placeholder-foreground/50 transition-colors text-foreground ${
                      formErrors.lastName
                        ? "border-accent"
                        : "border-primary/30 focus:border-primary"
                    }`}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-accent">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1 text-foreground/80"
                >{`Email${isGoogleAccount ? " (Google account)" : ""}`}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
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
                {formErrors.email && (
                  <p className="mt-1 text-sm text-accent">{formErrors.email}</p>
                )}
                {isGoogleAccount && (
                  <p className="mt-1 text-sm text-accent">
                    You are logged in with Google. To change your email, switch to a different Google account by clicking the button below.
                  </p>
                )}
                {isGoogleAccount && (
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleGoogleSync()}
                      disabled={isSubmitting}
                    >
                      Change Google Account
                    </Button>
                  </div>
                )}
              </div>
            </form>
            </div>
            <div className="mt-4 flex gap-3 pt-2">
                <Button  type="button" onClick={handleInputChange} disabled={isSubmitting}>
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
          </div>
      )}

      {/* Footer Section - only visible until lg; from lg, info below is placed in the footer in NavigationDesktop.tsx */}
      <div className="mt-8 py-2 border-t border-primary/20 lg:hidden">
        <div className="text-xs text-foreground/70 text-left">
          <p>&copy; 2025 Paw Pulse. All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
