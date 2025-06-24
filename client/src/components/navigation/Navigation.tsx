"use client";

import { usePathname } from 'next/navigation';
import NavigationDesktop from "./desktop/NavigationDesktop";
import NavigationMobile from "./mobile/NavigationMobile";

export default function Navigation() {
  const pathname = usePathname();

  // Don't show navigation on auth pages
  // if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
  //   return null;
  // }

  return (
    <>
      <NavigationDesktop />
      <NavigationMobile />
    </>
  );
}
