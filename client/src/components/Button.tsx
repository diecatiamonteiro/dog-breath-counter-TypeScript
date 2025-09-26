"use client"

import Link from "next/link";
import { ReactNode } from "react";

export interface ButtonProps {
  children?: ReactNode;

  // Navigation vs Action
  href?: string; // If provided, renders as Link; if not, renders as button

  // Button-specific props
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent) => void;

  // Styling variants
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dangerGhost";
  size?: "xs" | "sm" | "md" | "lg";

  // Icon support
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  iconOnly?: boolean; // Icon-only button (no visible text)
  shape?: "default" | "square" | "circle"; // Button shape

  // Loading state
  loading?: boolean;
  loadingText?: string;

  // Accessibility
  ariaLabel?: string;
  title?: string;

  // Additional styling
  className?: string;
}

const Button = ({
  children,
  href,
  type = "button",
  disabled = false,
  onClick,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  iconOnly = false,
  shape = "default",
  loading = false,
  loadingText,
  ariaLabel,
  title,
  className = "",
}: ButtonProps) => {
  // Base styles that apply to both Link and button
  const baseStyles =
    "inline-flex items-center justify-center gap-1 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed";

  // Variant styles
  const variantStyles = {
    primary:
      "bg-primary text-background hover:bg-primary/80 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "bg-navbar-icons/90 text-foreground border border-primary/50 hover:bg-navbar-icons focus:ring-primary  disabled:opacity-50 disabled:cursor-not-allowed",
    ghost:
      "border border-primary text-primary hover:bg-primary/10 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
    danger:
      "bg-accent text-white hover:bg-accent-dark focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed",
    dangerGhost: "text-accent/70  border border-transparent hover:text-accent hover:bg-accent/10 flex-shrink-0",
  };

  // Size styles
  const sizeStyles = {
    xs: "px-1.5 py-1 text-xs",
    sm: "p-2 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Icon-only paddings (no text) to make square/circle buttons compact
  const iconOnlySizeStyles = {
    xs: "p-1",
    sm: "p-2",
    md: "p-2.5",
    lg: "p-3",
  } as const;

  // Shape styles
  const shapeStyles = {
    default: "rounded-lg",
    square: "rounded-lg",
    circle: "!rounded-full",
  };

  // Combine all styles
  const combinedStyles = [
    baseStyles,
    shapeStyles[shape],
    variantStyles[variant],
    iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
    iconOnly ? "gap-0" : "",
    className,
  ].join(" ");

  // Content with icon
  const content = (
    <>
      {iconOnly ? (
        // Icon-only: show spinner text only if loadingText provided, otherwise just the icon/children
        loading && loadingText ? (
          <span>{loadingText}</span>
        ) : (
          (icon as ReactNode) || (children as ReactNode)
        )
      ) : (
        <>
          {!loading && icon && iconPosition === "left" && icon}
          <span>{loading && loadingText ? loadingText : children}</span>
          {!loading && icon && iconPosition === "right" && icon}
        </>
      )}
    </>
  );

  // Render as Link if href is provided
  if (href) {
    if (href.startsWith("#")) {
      // hash links --> plain <a>
      return (
        <a
          href={href}
          className={combinedStyles}
          onClick={(e) => {
            // Allow caller's onClick first
            onClick?.(e);
            // Default behavior sometimes fails inside custom scroll containers (mobile/desktop layouts)
            // Prevent default and perform a robust programmatic scroll instead
            if (href && href.startsWith("#")) {
              e.preventDefault();
              const targetId = href.slice(1);
              const target = document.getElementById(targetId);
              if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                // Update URL hash without jumping
                if (history.replaceState) {
                  history.replaceState(null, "", href);
                } else {
                  window.location.hash = href;
                }
              }
            }
          }}
          aria-label={ariaLabel}
          aria-busy={loading || undefined}
          title={title}
        >
          {content}
        </a>
      );
    }
    // normal links --> Next.js <Link>
    return (
      <Link
        href={href}
        className={combinedStyles}
        onClick={(e) => onClick?.(e)}
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        title={title}
      >
        {content}
      </Link>
    );
  }

  // Render as button for actions
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={(e) => onClick?.(e)}
      className={combinedStyles}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      title={title}
    >
      {content}
    </button>
  );
};

export default Button;
