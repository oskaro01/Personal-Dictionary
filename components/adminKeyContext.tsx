"use client"


// adminKeyContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

interface AdminKeyContextType {
  adminKey: string;
  setAdminKey: (key: string) => void;
}

const AdminKeyContext = createContext<AdminKeyContextType | undefined>(undefined);

export function AdminKeyProvider({ children }: { children: ReactNode }) {
  const [adminKey, setAdminKey] = useState("");
  return (
    <AdminKeyContext.Provider value={{ adminKey, setAdminKey }}>
      {children}
    </AdminKeyContext.Provider>
  );
}

export function useAdminKey() {
  const context = useContext(AdminKeyContext);
  if (!context) throw new Error("useAdminKey must be used inside AdminKeyProvider");
  return context;
}
