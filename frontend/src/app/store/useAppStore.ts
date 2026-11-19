import { create } from "zustand";
import { JobBlock, User } from "@/core/types/factory-common.types";

export type ViewType =
  | "gantt"
  | "orders"
  | "machines"
  | "products"
  | "operators"
  | "database"
  | "technician"
  | "material"
  | "my-job";

export type BayFilterType = "ALL" | "BAY_A" | "BAY_B";

interface AppState {
  currentView: ViewType;
  currentDate: string;
  currentHour: number;
  bayFilter: BayFilterType;
  selectedJob: JobBlock | null;

  // Auth & RBAC State
  currentUser: User | null;
  permissions: Record<string, boolean>;
  isLoginModalOpen: boolean;

  // Actions
  setView: (view: ViewType) => void;
  setDate: (date: string) => void;
  setHour: (hour: number) => void;
  setBayFilter: (filter: BayFilterType) => void;
  setSelectedJob: (job: JobBlock | null) => void;
  setCurrentUser: (user: User | null, permissions?: Record<string, boolean>) => void;
  setLoginModalOpen: (open: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentView: "gantt",
  currentDate: "2026-11-12",
  currentHour: 8.0,
  bayFilter: "ALL",
  selectedJob: null,

  currentUser: null,
  permissions: {},
  isLoginModalOpen: false,

  setView: (view) => set({ currentView: view }),
  setDate: (date) => set({ currentDate: date }),
  setHour: (hour) => set({ currentHour: hour }),
  setBayFilter: (bayFilter) => set({ bayFilter }),
  setSelectedJob: (selectedJob) => set({ selectedJob }),

  setCurrentUser: (user, permissions = {}) =>
    set({
      currentUser: user,
      permissions,
      // Khi đăng nhập tự động hướng về tab sở trường của vai trò
      currentView:
        user?.role === "technician"
          ? "technician"
          : user?.role === "material_manager"
          ? "material"
          : user?.role === "user"
          ? "my-job"
          : "gantt",
    }),

  setLoginModalOpen: (open) => set({ isLoginModalOpen: open }),

  logout: () => {
    localStorage.removeItem("aps_token");
    set({ currentUser: null, permissions: {}, currentView: "gantt" });
  },
}));
