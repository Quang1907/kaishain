import React, { Suspense, lazy, useEffect } from "react";
import { MainLayout } from "@/shared/components/layout/MainLayout";
import { useAppStore } from "@/app/store/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import { LoginModal } from "@/features/auth/components/LoginModal";
import { authApi } from "@/features/auth/api/authApi";

// Lazy load feature slices for optimal code splitting & performance
const GanttScheduleFeature = lazy(() => import("@/features/gantt-schedule"));
const ShippingOrdersView = lazy(() => import("@/features/shipping-orders"));
const MachineListView = lazy(() => import("@/features/machines"));
const ProductsBomView = lazy(() => import("@/features/products-bom"));
const OperatorsView = lazy(() => import("@/features/operators"));
const DatabaseExplorerView = lazy(() => import("@/features/database-explorer"));
const TechnicianView = lazy(() => import("@/features/technician"));
const MaterialManagerView = lazy(() => import("@/features/material"));
const OperatorWorkstationView = lazy(() => import("@/features/operator-workstation"));

export const App: React.FC = () => {
  const { currentView, setCurrentUser } = useAppStore();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Khôi phục session khi mở trang
  useEffect(() => {
    const token = localStorage.getItem("aps_token");
    if (token) {
      authApi
        .getMe()
        .then((res) => {
          if (res.status === "success" && res.user) {
            setCurrentUser(res.user, res.permissions);
          }
        })
        .catch(() => {
          localStorage.removeItem("aps_token");
        });
    }
  }, [setCurrentUser]);

  const handleSyncDb = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const renderActiveView = () => {
    switch (currentView) {
      case "gantt":
        return <GanttScheduleFeature />;
      case "technician":
        return <TechnicianView />;
      case "material":
        return <MaterialManagerView />;
      case "my-job":
        return <OperatorWorkstationView />;
      case "orders":
        return <ShippingOrdersView />;
      case "machines":
        return <MachineListView />;
      case "products":
        return <ProductsBomView />;
      case "operators":
        return <OperatorsView />;
      case "database":
        return <DatabaseExplorerView />;
      default:
        return <GanttScheduleFeature />;
    }
  };

  return (
    <MainLayout onRefresh={handleSyncDb} isRefreshing={isRefreshing}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh] text-slate-400 gap-3">
            <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm font-medium">Đang tải phân hệ điều hành...</span>
          </div>
        }
      >
        {renderActiveView()}
      </Suspense>

      {/* Global Auth Modal */}
      <LoginModal />
    </MainLayout>
  );
};

export default App;
