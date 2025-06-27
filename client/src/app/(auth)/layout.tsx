/**
 * @file app/(auth)/layout.tsx
 * @description Auth-specific layout for login and register pages
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
