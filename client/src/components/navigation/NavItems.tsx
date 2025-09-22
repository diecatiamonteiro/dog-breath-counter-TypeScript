/**
 * @file NavItems.tsx
 * @description Navigation items for desktop and mobile for both authenticated and unauthenticated users
 */

import { PiDogBold } from "react-icons/pi";
import { MdOutlineSettings } from "react-icons/md";
import { FiHome } from "react-icons/fi";
import { PiSignInBold } from "react-icons/pi";
import { TbLogout2 } from "react-icons/tb";

// Navigation items for unauthenticated users
export const publicNavItems = [
  {
    href: "/",
    label: "Home",
    icon: <FiHome className="w-7 h-7" aria-hidden="true" />,
  },
  {
    href: "/auth",
    label: "Sign In",
    icon: <PiSignInBold className="w-7 h-7" aria-hidden="true" />,
  },
];

// Navigation items for authenticated users
export const privateNavItems = [
  { href: "/", label: "Home", icon: <FiHome className="w-7 h-7" /> },
  {
    href: "/my-dogs",
    label: "My Dogs",
    icon: <PiDogBold className="w-7 h-7" aria-hidden="true" />,
  },
  {
    href: "/dashboard",
    label: "Settings",
    icon: <MdOutlineSettings className="w-7 h-7" aria-hidden="true" />,
  },
  {
    href: "/logout",
    label: "Sign Out",
    icon: <TbLogout2 className="w-7 h-7" aria-hidden="true" />,
  },
];

// Legacy export for backward compatibility
export const navItems = publicNavItems;

// Helper function to get navigation items based on auth status
export const getNavItems = (isAuthenticated: boolean) => {
  return isAuthenticated ? privateNavItems : publicNavItems;
};
