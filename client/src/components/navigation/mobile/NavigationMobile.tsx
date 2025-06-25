/**
 * @file NavigationMobile.tsx
 * @description Mobile navigation menu until lg screens
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { navItems } from "../NavItems";

export default function NavigationMobile() {
  const pathname = usePathname();

  return (
    <>
      {/* Top Bar with Logo */}
      <div className="w-full bg-navbar-bg border-b border-primary/20">
        <nav className="flex lg:hidden items-center justify-center px-4 py-3">
          <Link href="/" className="block">
            {/* Dark logo - light mode */}
            <Image
              src="/logos/logo-dark.png"
              loading="lazy"
              width={80}
              height={18}
              alt="Paw Pulse Dark Logo"
              className="block dark:hidden "
            />

            {/* Light logo - dark mode */}
            <Image
              src="/logos/logo-light.png"
              width={80}
              height={18}
              alt="Paw Pulse Light Logo"
              className="hidden dark:block"
            />
          </Link>
        </nav>
      </div>

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-navbar-items-bg border-t border-primary/20 z-50 lg:hidden">
        {/* Navigation Tabs */}
        <nav className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
