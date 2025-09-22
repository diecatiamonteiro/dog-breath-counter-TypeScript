/**
 * @file NavigationDesktop.tsx
 * @description Desktop navigation menu from lg screens onwards
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getNavItems } from "../NavItems";
import { useAppContext } from "@/context/Context";
import { logoutUser } from "@/api/userApi";
import { toast } from "react-toastify";

export default function NavigationDesktop() {
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
    <div className="h-screen w-56 xl:w-64 2xl:w-76 bg-navbar-bg flex-shrink-0 border-r border-primary/20">
      <nav className="h-full flex flex-col py-6 px-4" aria-label="Main navigation">
        {/* Logo Section */}
        <div className="mb-12 px-2">
          <Link href="/" className="block">
            {/* Dark logo - light mode */}
            <Image
              src="/logos/logo-dark.png"
              width={128}
              height={32}
              alt="Paw Pulse Dark Logo"
              className="h-auto w-auto max-h-12 block dark:hidden transition-transform duration-300 hover:scale-105"
              priority
            />

            {/* Light logo - dark mode */}
            <Image
              src="/logos/logo-light.png"
              width={128}
              height={32}
              alt="Paw Pulse Light Logo"
              className="h-auto w-auto hidden dark:block transition-transform duration-300 hover:scale-105"
              priority
            />
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            // Handle logout
            if (item.href === "/logout") {
              return (
                <button
                  key={item.label}
                  onClick={handleLogout}
                  disabled={userState.isLoading}
                  className="group flex flex-row gap-2 w-full"
                >
                  {/* Icon */}
                  <div
                    className={`
                    flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-navbar-icons text-white shadow-md"
                        : "text-primary bg-primary/20 group-hover:bg-primary/50 group-hover:text-foreground"
                    }
                  `}
                  aria-hidden="true"
                  >
                    {item.icon}
                  </div>

                  {/* Label */}
                  <div className="flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium w-full text-foreground bg-transparent group-hover:bg-primary/20 group-hover:text-foreground">
                    {item.label}
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-row gap-2"
              >
                {/* Icon */}
                <div
                  className={`
                    flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-navbar-icons text-white shadow-md"
                        : "text-primary bg-primary/20 group-hover:bg-primary/50 group-hover:text-foreground"
                    }
                  `}
                >
                  {item.icon}
                </div>

                {/* Label */}
                <div
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium w-full
                    ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "text-foreground bg-transparent group-hover:bg-primary/20 group-hover:text-foreground"
                    }
                  `}
                >
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-6 border-t border-primary/20">
          <div className="px-4 py-2 text-sm text-foreground/70">
            <p>&copy; 2025 Paw Pulse. All rights reserved</p>
          </div>
        </footer>
      </nav>
    </div>
  );
}
