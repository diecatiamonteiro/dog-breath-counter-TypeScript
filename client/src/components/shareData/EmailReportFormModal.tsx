"use client";

import { useState } from "react";
import Button from "../Button";
import { MdEmail, MdSend, MdClose } from "react-icons/md";

interface EmailReportFormProps {
  onSendEmail: (recipientEmail: string) => Promise<void>;
  onCancel: () => void;
  isVisible: boolean;
  isLoading?: boolean;
}

export default function EmailReportFormModal({
  onSendEmail,
  onCancel,
  isVisible,
  isLoading = false,
}: EmailReportFormProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!recipientEmail.trim()) {
      setError("Please enter a recipient email");
      return;
    }

    if (!recipientEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await onSendEmail(recipientEmail.trim());
      setRecipientEmail("");
    } catch {
      setError("Failed to send email. Please try again.");
    }
  };

  if (!isVisible) return null; // if the form is not visible, don't render it

  return (
    // Email modal to send the report to the recipient
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-main-text-bg rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MdEmail className="text-primary" />
            Send Email Report
          </h3>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="text-foreground/60 hover:text-foreground"
          >
            <MdClose className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="recipientEmail"
              className="block text-sm font-medium text-foreground mb-2"
            >
              To:
            </label>
            <input
              id="recipientEmail"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="vet@clinic.com"
              className="w-full px-3 py-2 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MdSend className="w-4 h-4" />
                  Send Report
                </div>
              )}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="ghost"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
