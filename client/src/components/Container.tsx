/**
 * @file components/Container.tsx
 * @description Container component for the app to center the content with max-width and padding
 */

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div className={`p-6 sm:p-8 lg:px-18 lg:py-12 ${className}`}>
      {children}
    </div>
  );
}
