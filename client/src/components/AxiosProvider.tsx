/**
 * @file AxiosProvider.tsx
 * @description Client component that initializes axios defaults set up in lib/axios.ts
 *              Wrap AppProvider with AxiosProvider in app/layout.tsx
 */

"use client";

import { useEffect } from "react";
import { setAxiosDefaults } from "@/lib/axios";

export const AxiosProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    setAxiosDefaults();
  }, []);

  return <>{children}</>;
};
