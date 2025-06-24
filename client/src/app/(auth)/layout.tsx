/**
 * @file app/(auth)/layout.tsx
 * @description Auth-specific layout for login and register pages
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1>Auth Layout with children below (login or register)</h1>
      {children}
    </div>
  );
}

