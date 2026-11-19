import React from "react";
import { Header } from "./Header";
import { NavigationTabs } from "./NavigationTabs";
import { StatusBar } from "./StatusBar";

interface MainLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-factory-bg text-slate-100">
      {/* Sticky Combined Top Navigation Container */}
      <div className="sticky top-0 z-40 bg-factory-panel shadow-md border-b border-factory-border">
        <Header onRefresh={onRefresh} isRefreshing={isRefreshing} />
        <NavigationTabs />
      </div>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </main>

      <StatusBar />
    </div>
  );
};
