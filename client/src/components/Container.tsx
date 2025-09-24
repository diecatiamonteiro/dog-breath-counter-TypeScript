/**
 * @file components/Container.tsx
 * @description Container component for the app to center
 *              the content with max-width and padding
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
    <div className={`py-6 px-4 sm:p-6 md:p-8 lg:px-16 lg:py-12 ${className}`}>
      {children}
    </div>
  );
}
