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
import LoadingSpinner from "@/app/loading";

export default function NavigationDesktop() {
  const pathname = usePathname();
  const router = useRouter();
  const { userState, userDispatch } = useAppContext();

  // Get navigation items based on authentication status
  const navItems = getNavItems(userState.isAuthenticated);

  const handleLogout = async () => {
    try {
      await logoutUser(userDispatch);
      router.push("/");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="h-screen w-64 md:w-72 lg:w-80 xl:w-96 bg-navbar-bg flex-shrink-0 border-r border-primary/20">
      <nav className="h-full flex flex-col py-6 px-4">
        {/* Logo Section */}
        <div className="mb-12 px-2">
          <Link href="/" className="block">
            {/* Dark logo - light mode */}
            <Image
              src="/logos/logo-dark.png"
              width={110}
              height={22}
              alt="Paw Pulse Dark Logo"
              className="block dark:hidden transition-transform duration-300 hover:scale-105"
              priority
            />

            {/* Light logo - dark mode */}
            <Image
              src="/logos/logo-light.png"
              width={110}
              height={22}
              alt="Paw Pulse Light Logo"
              className="hidden dark:block transition-transform duration-300 hover:scale-105 h-auto w-auto"
              priority
            />
          </Link>
        </div>

        {/* User Info (if authenticated) */}
        {userState.isAuthenticated && userState.user && (
          <div className="mb-6 px-4 py-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium text-foreground">Welcome back,</p>
            <p className="text-sm text-foreground/70">
              {userState.user.firstName} {userState.user.lastName}
            </p>
          </div>
        )}

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
                  <div className={`
                    flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-navbar-icons text-white shadow-md"
                        : "text-primary bg-primary/10 group-hover:bg-primary/50 group-hover:text-foreground"
                    }
                  `}>
                    {item.icon}
                  </div>

                  {/* Label */}
                  <div className="flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium w-full text-foreground bg-transparent group-hover:bg-primary/20 group-hover:text-foreground">
                    {userState.isLoading ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner className="w-7 h-7" />
                        Signing out...
                      </div>
                    ) : (
                      item.label
                    )}
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
                        : "text-primary bg-primary/10 group-hover:bg-primary/50 group-hover:text-foreground"
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
