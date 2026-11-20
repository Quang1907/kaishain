import React, { useState } from "react";
import { useAppStore } from "@/app/store/useAppStore";
import { Button } from "@/shared/components/ui/Button";
import {
  LayoutDashboard,
  CalendarDays,
  Truck,
  Factory,
  Boxes,
  Users2,
  Database,
  Shield,
  LogOut,
  RefreshCw,
  Zap,
  Wrench,
  Wheat,
  UserCheck,
} from "lucide-react";
import { AdminDashboard } from "./AdminDashboard";
import { AdminUsersSection } from "./AdminUsersSection";
import ShippingOrdersView from "@/features/shipping-orders";
import MachineListView from "@/features/machines";
import ProductsBomView from "@/features/products-bom";
import OperatorsView from "@/features/operators";
import DatabaseExplorerView from "@/features/database-explorer";

type AdminTab =
  | "overview"
  | "orders"
  | "machines"
  | "products"
  | "operators"
  | "database"
  | "users";

interface AdminLayoutProps {
  onNavigateUrl: (url: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  onNavigateUrl,
  onRefresh,
  isRefreshing,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const { currentDate, setDate, currentUser, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    onNavigateUrl("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <AdminDashboard
            onNavigateSection={(sec) => setActiveTab(sec as AdminTab)}
            onNavigateUrl={onNavigateUrl}
          />
        );
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
      case "users":
        return <AdminUsersSection />;
      default:
        return (
          <AdminDashboard
            onNavigateSection={(sec) => setActiveTab(sec as AdminTab)}
            onNavigateUrl={onNavigateUrl}
          />
        );
    }
  };

  const navItems = [
    { key: "overview", label: "Tổng Quan Quản Lý", icon: LayoutDashboard },
    { key: "orders", label: "Lệnh Xuất Hàng JIT", icon: Truck },
    { key: "machines", label: "22 Máy Ép (Bay A/B)", icon: Factory },
    { key: "products", label: "Hàng & Định Mức BOM", icon: Boxes },
    { key: "operators", label: "Nhân Sự & Ca", icon: Users2 },
    { key: "database", label: "Cơ Sở Dữ Liệu PostgreSQL", icon: Database },
    { key: "users", label: "Quản Trị Người Dùng (RBAC)", icon: Shield },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-factory-bg text-slate-100">
      {/* Dedicated Admin Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-blue-500/30 bg-factory-card/50 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Shield className="text-white w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-wider text-white uppercase font-mono">
                CỔNG QUẢN LÝ XƯỞNG ÉP NHỰA
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 font-mono">
                URL: /admin
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quản trị viên: <strong className="text-blue-300">{currentUser?.full_name || "川端 (Kawabata)"}</strong> • Toàn quyền điều hành xưởng
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-3">
          {/* Nút Xem Lịch Xưởng (Trang Chủ) */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateUrl("/")}
            title="Quay về trang chủ xem Lịch Trình Toàn Xưởng 24H"
            className="h-8 px-3 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 flex items-center gap-1.5"
          >
            <CalendarDays size={14} />
            <span className="text-xs font-semibold">Xem Lịch Xưởng (Trang Chủ)</span>
          </Button>

          {/* Date Switcher */}
          <div className="flex bg-factory-card border border-factory-border rounded-lg p-1 text-xs font-medium">
            <button
              onClick={() => setDate("2026-11-12")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                currentDate === "2026-11-12"
                  ? "bg-blue-600 text-white shadow font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              11/12 (Thứ 5)
            </button>
            <button
              onClick={() => setDate("2026-11-13")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                currentDate === "2026-11-13"
                  ? "bg-blue-600 text-white shadow font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              11/13 (Thứ 6)
            </button>
            <button
              onClick={() => setDate("optimized")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1 transition-all ${
                currentDate === "optimized"
                  ? "bg-amber-600 text-white shadow font-semibold"
                  : "text-amber-400 hover:text-amber-300"
              }`}
            >
              <Zap size={13} />
              AI Tối Ưu
            </button>
          </div>

          {onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              isLoading={isRefreshing}
              className="h-8"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              Đồng bộ DB
            </Button>
          )}

          <div className="h-6 w-px bg-factory-border/60 mx-1" />

          {/* Quick jump to field portals */}
          <div className="hidden xl:flex items-center gap-1 bg-factory-panel border border-factory-border p-1 rounded-lg text-[11px]">
            <span className="text-slate-500 px-1 font-semibold">Hiện trường:</span>
            <button
              onClick={() => onNavigateUrl("/technician")}
              className="px-2 py-1 rounded text-amber-400 hover:bg-amber-500/10 flex items-center gap-1"
              title="Mở cổng thợ máy (/technician)"
            >
              <Wrench size={12} /> Thợ máy
            </button>
            <button
              onClick={() => onNavigateUrl("/material")}
              className="px-2 py-1 rounded text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-1"
              title="Mở cổng nguyên liệu (/material)"
            >
              <Wheat size={12} /> Nguyên liệu
            </button>
            <button
              onClick={() => onNavigateUrl("/operator")}
              className="px-2 py-1 rounded text-purple-400 hover:bg-purple-500/10 flex items-center gap-1"
              title="Mở cổng đứng máy (/operator)"
            >
              <UserCheck size={12} /> Đứng máy
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            title="Đăng xuất khỏi Cổng Quản Lý"
            className="h-8 px-2.5 text-slate-400 hover:text-red-400 hover:border-red-500/40"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline text-xs">Đăng Xuất</span>
          </Button>
        </div>
      </header>

      {/* Dedicated Admin Sub-Navigation Bar */}
      <nav className="flex items-center gap-1 px-6 py-2 bg-factory-panel border-b border-factory-border/60 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as AdminTab)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap border ${
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 border-blue-400/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border-transparent"
              }`}
            >
              <Icon size={14} className={isActive ? "text-white" : "text-slate-400"} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Admin Work Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
