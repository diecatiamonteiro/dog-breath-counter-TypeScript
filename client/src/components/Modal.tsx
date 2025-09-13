import { useEffect } from "react";
import Button from "./Button";

export default function Modal({ title, children, onClose}: { title: string, children: React.ReactNode, onClose: () => void }) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if(e.key === "Escape") {
                onClose()
            }
        }
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    // Prevent click propagation from modal to parent elements
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <div
            className="bg-main-text-bg rounded-lg shadow-xl max-w-md w-full mx-4"
            onClick={handleContentClick}
          >
            <div className="flex justify-between items-center border-b p-6">
              <h2 className="text-xl font-semibold">{title}</h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </Button>
            </div>
            {children}
          </div>
        </div>
      );
};

