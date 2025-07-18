/**
 * @file NavigationMobile.tsx
 * @description Mobile navigation menu until lg screens
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { getNavItems } from "../NavItems";
import { useAppContext } from "@/context/Context";
import { logoutUser } from "@/api/userApi";
import { toast } from "react-toastify";

export default function NavigationMobile() {
  const pathname = usePathname();
  const router = useRouter();
  const { userState, userDispatch, authLoading } = useAppContext();

  // Get navigation items based on authentication status
  // Show authenticated navigation during initial load, then use actual state
  const navItems = getNavItems(authLoading ? true : userState.isAuthenticated);

  const handleLogout = async () => {
    try {
      await logoutUser(userDispatch);
      router.push("/");
    } catch {
      toast.error("Failed to log out");
    }
  };

  return (
    <>
      {/* Top Bar with Logo */}
      <div className="w-full bg-navbar-bg border-b border-primary/20">
        <nav className="flex lg:hidden items-center justify-center px-4 py-3">
          <Link href="/" className="block">
            {/* Dark logo - light mode */}
            <Image
              src="/logos/logo-dark.png"
              width={80}
              height={18}
              alt="Paw Pulse Dark Logo"
              className="block dark:hidden"
              priority
            />

            {/* Light logo - dark mode */}
            <Image
              src="/logos/logo-light.png"
              width={80}
              height={18}
              alt="Paw Pulse Light Logo"
              className="hidden dark:block h-auto w-auto"
              priority
            />
          </Link>
        </nav>
      </div>

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-main-text-bg border-t border-primary/20 z-50 lg:hidden">
        {/* Navigation Tabs */}
        <nav className="flex items-center justify-center px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            // Handle logout
            if (item.href === "/logout") {
              return (
                <button
                  key={item.label}
                  onClick={handleLogout}
                  disabled={userState.isLoading}
                  className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1"
                >
                  {/* Icon */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 mb-1 text-foreground/60 bg-transparent">
                    {item.icon}
                  </div>

                  {/* Label */}
                  <span className="text-xs text-center font-bold transition-all duration-200 text-foreground/60">
                    {userState.isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Signing out...
                      </div>
                    ) : (
                      item.label
                    )}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1"
              >
                {/* Icon */}
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 mb-1
                    ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "text-foreground/60 bg-transparent"
                    }
                  `}
                >
                  {item.icon}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-xs text-center font-bold transition-all duration-200
                    ${isActive ? "text-primary" : "text-foreground/60"}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
