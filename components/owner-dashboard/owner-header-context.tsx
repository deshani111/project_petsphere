"use client";

import { createContext, useContext, type ReactNode } from "react";

const OwnerHeaderNameContext = createContext("Pet Owner");

export function OwnerHeaderNameProvider({
  userName,
  children,
}: {
  userName: string;
  children: ReactNode;
}) {
  return (
    <OwnerHeaderNameContext.Provider value={userName}>
      {children}
    </OwnerHeaderNameContext.Provider>
  );
}

export function useOwnerHeaderName() {
  return useContext(OwnerHeaderNameContext);
}
