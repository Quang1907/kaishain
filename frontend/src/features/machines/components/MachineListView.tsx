import React from "react";
import { useMachinesQuery } from "../api/machinesApi";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Factory, Zap, Shield } from "lucide-react";

export const MachineListView: React.FC = () => {
  const { data: machines, isLoading } = useMachinesQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-36 bg-factory-card rounded-xl border border-factory-border" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Danh Mục 22 Máy Ép Nhựa Chính Xác
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Khu Bay A (Máy 2-13: 80T - 180T) • Khu Bay B (Máy 15-25: 180T - 350T)
          </p>
        </div>
        <Badge variant="info" className="px-3 py-1 text-xs">
          Tổng số: {machines?.length || 22} Máy
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {machines?.map((m) => (
          <Card key={m.id} hoverEffect className="relative overflow-hidden group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <Factory size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-mono text-white">
                    {m.id.includes("号機") ? m.id : `Máy #${m.id}`}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {m.bay === "A" ? "Khu Bay A" : "Khu Bay B"}
                  </span>
                </div>
              </div>
              <Badge variant={m.status === "RUNNING" ? "success" : "default"}>
                {m.status || "RUNNING"}
              </Badge>
            </div>

            <div className="mt-4 pt-3 border-t border-factory-border grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Shield size={14} className="text-indigo-400" />
                <span>
                  Trọng tải: <strong className="text-white font-mono">{m.tonnage}T</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Zap size={14} className="text-amber-400" />
                <span>
                  Công suất: <strong className="text-white font-mono">{m.power_kw} kW</strong>
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
