/**
 * @file app/(protected)/layout.tsx
 * @description Protected pages layout for authenticated users
 */

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1>Protected Layout with children below (dashboard & my dogs)</h1>
      {children}
    </div>
  );
}
