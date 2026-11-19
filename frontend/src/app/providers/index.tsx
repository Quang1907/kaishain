import React from "react";
import { QueryProvider } from "./QueryProvider";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <QueryProvider>{children}</QueryProvider>;
};

