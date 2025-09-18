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
  fullWidth?: boolean;
  
  // Icon support
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  
  // Loading state
  loading?: boolean;
  loadingText?: string;
  
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
  fullWidth = false,
  icon,
  iconPosition = "left",
  loading = false,
  loadingText,
  className = "",
}: ButtonProps) => {
  
  // Base styles that apply to both Link and button
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:cursor-not-allowed";
  
  // Variant styles
  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary/70 focus:ring-primary disabled:opacity-50 disabled:bg-primary/50",
    secondary: "bg-primary/30 text-primary hover:bg-primary hover:text-white focus:ring-primary border border-primary/20 disabled:opacity-50",
    ghost: "border border-primary/20 text-primary hover:bg-primary/10 focus:ring-primary disabled:opacity-50",
    danger: "bg-accent text-white hover:bg-accent/80 focus:ring-accent disabled:opacity-50",
  };
  
  // Size styles
  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };
  
  // Combine all styles
  const combinedStyles = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full" : "w-fit",
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
    return (
      <Link href={href} className={combinedStyles} onClick={(e) => onClick?.(e)}>
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
    >
      {content}
    </button>
  );
};

export default Button; 