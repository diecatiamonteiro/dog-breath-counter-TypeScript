/**
 * @file client/src/components/InfoDialog.tsx
 * @description Accessible info dialog UI component with trigger button,
 *              focus trap, and proper keyboard/screen reader support.
 */

"use client";

import { useEffect, useRef, useState, ReactNode, MouseEvent } from "react";
import Button from "./Button";
import { IoMdInformationCircle } from "react-icons/io";
import { MdClose } from "react-icons/md";

export interface InfoDialogProps {
  title?: string;
  children: ReactNode;
  triggerAriaLabel?: string;
}

export default function InfoDialog({
  title = "More info",
  children,
  triggerAriaLabel = "More information",
}: InfoDialogProps) {
  const [open, setOpen] = useState(false);

  // Refs for focus return & initial focus
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Open/close lifecycle: remember opener, focus inside,
  // lock scroll, restore on close
  useEffect(() => {
    if (!open) return;

    // remember opener
    lastFocusedRef.current = document.activeElement as HTMLElement | null;

    // focus first focusable or panel
    const firstFocusable =
      panelRef.current?.querySelector<HTMLElement>(
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
      ) ?? null;
    (firstFocusable ?? panelRef.current)?.focus();

    // scroll lock
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      // restore focus
      if (lastFocusedRef.current) {
        lastFocusedRef.current.focus();
        lastFocusedRef.current = null;
      }
    };
  }, [open]);

  // Keydown: Esc to close + Tab to trap focus
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!panelRef.current) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }

      if (e.key === "Tab") {
        const nodes = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
          )
        );
        if (nodes.length === 0) {
          // keep focus on panel
          e.preventDefault();
          panelRef.current.focus();
          return;
        }
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement as HTMLElement | null;

        // cycle
        if (e.shiftKey) {
          if (active === first || !panelRef.current.contains(active)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last || !panelRef.current.contains(active)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Click outside closes
  const onOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) setOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        ariaLabel={triggerAriaLabel}
        variant="ghost"
        size="xs"
        icon={<IoMdInformationCircle className="w-6 h-6" aria-hidden="true" />}
        className="border-none p-0 hover:bg-transparent hover:scale-125"
      />

      {open && (
        <div
          ref={overlayRef}
          onMouseDown={onOverlayMouseDown}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="info-dialog-title"
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            className="w-full max-w-sm md:max-w-md rounded-2xl bg-main-text-bg border border-primary shadow-lg p-4 md:p-6"
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center gap-2">
                  <IoMdInformationCircle
                    className="w-7 h-7 text-primary"
                    aria-hidden="true"
                  />
                  <h2
                    id="info-dialog-title"
                    className="font-bold text-foreground md:text-lg"
                  >
                    {title}
                  </h2>
                </div>

                <Button
                  onClick={() => setOpen(false)}
                  ariaLabel="Close info"
                  size="sm"
                  variant="ghost"
                  icon={<MdClose className="w-5 h-5" aria-hidden="true" />}
                  className="pl-2"
                />
              </div>

              {/* Text content */}
              <div className="flex flex-col gap-4 text-sm md:text-base text-foreground">
                {children}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setOpen(false)} variant="primary">
                  Got it
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
