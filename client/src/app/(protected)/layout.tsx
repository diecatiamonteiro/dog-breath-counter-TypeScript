/**
 * @file app/(protected)/layout.tsx
 * @description Protected pages layout for authenticated users
 */

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
