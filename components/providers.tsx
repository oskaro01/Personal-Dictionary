"use client"

import { ReactNode } from "react";
import { AdminKeyProvider } from "@/components/adminKeyContext";

export function Providers({ children }: { children: ReactNode }) {
  return <AdminKeyProvider>{children}</AdminKeyProvider>;
}
