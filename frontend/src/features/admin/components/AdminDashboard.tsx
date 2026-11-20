import React from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { useAppStore } from "@/app/store/useAppStore";
import {
  Factory,
  Wrench,
  Wheat,
  Truck,
  Zap,
  TrendingUp,
  PowerOff,
  Flame,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";

interface AdminDashboardProps {
  onNavigateSection: (section: string) => void;
  onNavigateUrl?: (url: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateSection,
  onNavigateUrl,
}) => {
  const { currentDate, setDate } = useAppStore();

  const { data: machines = [] } = useQuery<any[]>({
    queryKey: ["machines"],
    queryFn: async () => (await apiClient.get(API_ENDPOINTS.MACHINES)).data,
  });

  const { data: moldLogs = [] } = useQuery<any[]>({
    queryKey: ["moldLogs", currentDate],
    queryFn: async () => (await apiClient.get(API_ENDPOINTS.MOLD_LOGS)).data,
  });

  const { data: materialLogs = [] } = useQuery<any[]>({
    queryKey: ["materialLogs", currentDate],
    queryFn: async () => (await apiClient.get(API_ENDPOINTS.MATERIAL_LOGS)).data,
  });

  const { data: shippingOrders = [] } = useQuery<any[]>({
    queryKey: ["shippingOrders"],
    queryFn: async () => (await apiClient.get(API_ENDPOINTS.SHIPPING_ORDERS)).data,
  });

  const { data: learningProfile } = useQuery<any>({
    queryKey: ["learningProfile"],
    queryFn: async () => (await apiClient.get(API_ENDPOINTS.LEARNING_PROFILE)).data,
  });

  const runningMachines = machines.filter((m) => m.status === "RUNNING").length;
  const stoppedMachines = machines.filter((m) => m.status === "PLANNED_STOP").length;
  const pendingMolds = moldLogs.filter((m) => m.status === "PENDING").length;
  const readyMaterials = materialLogs.filter((m) => m.status === "READY" || m.status === "CONFIRMED").length;

  return (
    <div className="space-y-6">
      {/* Executive Welcome Hero Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase">
              KHU VỰC QUẢN TRỊ VIÊN
            </span>
            <Badge variant="default">ADMIN ONLY</Badge>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1.5 tracking-wide">
            BẢNG ĐIỀU HÀNH TỔNG THỂ NHÀ MÁY ÉP NHỰA (22 MÁY ÉP)
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Hệ thống phân tích tự động 3 chân kiềng (Khuôn, Sấy nhựa, Nhân công), điều phối tối ưu lệnh xuất hàng JIT và tự động ngắt điện dừng máy (□ 計画停止 - Kế hoạch dừng máy) khi hoàn thành đơn để tiết kiệm điện năng.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <Button
            variant="primary"
            size="md"
            onClick={() => setDate("optimized")}
            className="bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20 text-xs sm:text-sm py-2 px-3 sm:px-4"
          >
            <Zap size={14} />
            <span>Chạy Tối Ưu Hóa AI JIT</span>
          </Button>
        </div>
      </div>

      {/* 4 Core Pillars KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigateSection("machines")}
          className="p-4 rounded-xl bg-factory-card border border-factory-border hover:border-blue-500/60 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">22 Máy Ép (Bay A/B)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Factory size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{runningMachines}</span>
            <span className="text-xs text-emerald-400 font-semibold">Đang ép hàng</span>
            <span className="text-xs text-slate-400">/ {machines.length} máy</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400 flex items-center gap-1 font-mono">
            <PowerOff size={12} />
            {stoppedMachines} máy tắt tiết kiệm điện (□ 計画停止)
          </div>
        </div>

        <div
          onClick={() =>
            onNavigateUrl ? onNavigateUrl("/technician") : onNavigateSection("technician")
          }
          className="p-4 rounded-xl bg-factory-card border border-factory-border hover:border-amber-500/60 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Thay Khuôn (○ 型替)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wrench size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">{pendingMolds}</span>
            <span className="text-xs text-slate-300">Chờ thợ máy nghiệm thu</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tổng số ca thay khuôn: {moldLogs.length}</span>
            <ArrowRight size={13} className="text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div
          onClick={() =>
            onNavigateUrl ? onNavigateUrl("/material") : onNavigateSection("material")
          }
          className="p-4 rounded-xl bg-factory-card border border-factory-border hover:border-emerald-500/60 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Nguyên Liệu & Sấy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Wheat size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{readyMaterials}</span>
            <span className="text-xs text-slate-300">Đã cấp liệu & chuẩn độ ẩm</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-400 flex items-center gap-1 font-mono">
            <Flame size={12} />
            Sấy chuẩn 80°C - 140°C &amp; Dry Coat (青○)
          </div>
        </div>

        <div
          onClick={() => onNavigateSection("orders")}
          className="p-4 rounded-xl bg-factory-card border border-factory-border hover:border-purple-500/60 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Lệnh Xuất Hàng JIT</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Truck size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-400 font-mono">{shippingOrders.length}</span>
            <span className="text-xs text-slate-300">Đơn hàng chuẩn bị xuất</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp size={12} />
            100% không nguy cơ trễ hạn (On-Time)
          </div>
        </div>
      </div>

      {/* AI Continuous Learning & Safety Buffer Card */}
      <Card>
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-factory-border/50">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              Hệ Thống Tự Học &amp; Tối Ưu Đệm An Toàn Liên Tục (Continuous Learning Loop)
            </h3>
          </div>
          <span className="text-xs text-purple-300 font-mono">PostgreSQL Active</span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Khi nhân viên đứng máy báo cáo phế phẩm hoặc thợ máy cập nhật thời gian thay khuôn, thuật toán tự động tính toán lại tỷ lệ bù hao hụt và cập nhật trực tiếp vào cơ sở dữ liệu. Lần lập lịch tiếp theo sẽ tự động cộng bù để <strong>không bao giờ bị thiếu hàng</strong>.
        </p>

        {learningProfile?.dynamic_safety_stock_pct && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {Object.entries(learningProfile.dynamic_safety_stock_pct).slice(0, 7).map(([code, buf]: [string, any]) => (
              <div key={code} className="p-2.5 rounded-lg bg-factory-bg border border-factory-border text-center">
                <div className="text-[11px] font-mono font-bold text-slate-300">{code}</div>
                <div className="text-sm font-mono font-extrabold text-purple-400 mt-0.5">{buf}%</div>
                <div className="text-[9px] text-slate-500 uppercase">Đệm an toàn</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
