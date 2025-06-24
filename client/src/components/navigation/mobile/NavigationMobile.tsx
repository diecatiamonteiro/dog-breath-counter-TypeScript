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
      <div className="w-full bg-primary-light border-b border-primary/20">
        <nav className="flex lg:hidden items-center justify-center px-4 py-3">
          <Link href="/" className="block">
            {/* Dark logo - shown in light mode */}
            <Image
              src="/logo-dark.png"
              width={80}
              height={18}
              alt="Paw Pulse Logo"
              className="logo-dark w-auto h-auto"
            />

            {/* Light logo - shown in dark mode */}
            <Image
              src="/logo-light.png"
              width={80}
              height={18}
              alt="Paw Pulse Logo Light"
              className="logo-light w-auto h-auto"
            />
          </Link>
        </nav>
      </div>

      {/* Bottom Tab Navigation with Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
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
                        : "text-gray-500 bg-transparent"
                    }
                  `}
                >
                  {item.icon}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-xs font-medium transition-all duration-200
                    ${isActive ? "text-primary" : "text-gray-500"}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <p>&copy; 2025 Paw Pulse. All rights reserved</p>
          </div>
        </div>
      </div>
    </>
  );
}
