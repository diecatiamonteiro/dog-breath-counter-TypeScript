import Link from "next/link";
import { ReactNode } from "react";

export interface ButtonProps {
  children: ReactNode;

  // Navigation vs Action
  href?: string; // If provided, renders as Link; if not, renders as button

  // Button-specific props
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent) => void;

  // Styling variants
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";

  // Icon support
  icon?: ReactNode;
  iconPosition?: "left" | "right";

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
  loading = false,
  loadingText,
  ariaLabel,
  title,
  className = "",
}: ButtonProps) => {
  // Base styles that apply to both Link and button
  const baseStyles =
    "inline-flex items-center justify-center gap-1 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed";

  // Variant styles
  const variantStyles = {
    primary:
      "bg-primary text-white hover:bg-primary/70 focus:ring-primary disabled:opacity-50 disabled:bg-primary/50",
    secondary:
      "bg-primary/30 text-primary hover:bg-primary hover:text-white focus:ring-primary border border-primary/20 disabled:opacity-50",
    ghost:
      "border border-primary/20 text-primary hover:bg-primary/10 focus:ring-primary disabled:opacity-50",
    danger:
      "bg-accent text-white hover:bg-accent/80 focus:ring-accent disabled:opacity-50",
  };

  // Size styles
  const sizeStyles = {
    sm: "p-2 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Combine all styles
  const combinedStyles = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    className,
  ].join(" ");

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );

  // Content with icon and loading state
  const content = (
    <>
      {loading && <LoadingSpinner />}
      {!loading && icon && iconPosition === "left" && icon}
      <span>{loading && loadingText ? loadingText : children}</span>
      {!loading && icon && iconPosition === "right" && icon}
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
