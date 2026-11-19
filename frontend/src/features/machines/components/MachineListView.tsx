import React, { useState } from "react";
import { useMachinesQuery, useUpsertMachineMutation, useDeleteMachineMutation } from "../api/machinesApi";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import { Factory, Zap, Shield, Plus, Power, Wrench, Trash2 } from "lucide-react";
import { Machine } from "@/core/types/factory-common.types";

export const MachineListView: React.FC = () => {
  const { data: machines, isLoading } = useMachinesQuery();
  const upsertMutation = useUpsertMachineMutation();
  const deleteMutation = useDeleteMachineMutation();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [machineId, setMachineId] = useState("");
  const [tonnage, setTonnage] = useState(110);
  const [powerKw, setPowerKw] = useState(22.0);
  const [bay, setBay] = useState<"A" | "B">("A");
  const [status, setStatus] = useState("PLANNED_STOP");

  const handleToggleStatus = (m: Machine, newStatus: string) => {
    upsertMutation.mutate({
      ...m,
      status: newStatus,
    });
  };

  const handleAddMachine = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedId = machineId.includes("号機") ? machineId : `${machineId}号機`;
    await upsertMutation.mutateAsync({
      id: formattedId,
      tonnage: Number(tonnage),
      power_kw: Number(powerKw),
      bay: bay,
      status: status,
    });
    setIsAddModalOpen(false);
    setMachineId("");
  };

  const handleDeleteMachine = (mId: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${mId} khỏi Database?`)) {
      deleteMutation.mutate(mId);
    }
  };

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
            Quản Lý 22 Máy Ép Nhựa Chính Xác
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Khu Bay A (80T - 180T) • Khu Bay B (180T - 350T) • Cập nhật trạng thái trực tiếp vào DB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="info" className="px-3 py-1 text-xs font-mono">
            Tổng số: {machines?.length || 0} Máy (DB)
          </Badge>
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 h-8">
            <Plus size={15} />
            <span>Thêm Máy Ép</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {machines?.map((m) => {
          const isRunning = m.status === "RUNNING";
          const isStopped = m.status === "PLANNED_STOP";
          const isMaint = m.status === "MAINTENANCE";

          return (
            <Card key={m.id} hoverEffect className="relative overflow-hidden group flex flex-col justify-between">
              <div>
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

                  <Badge
                    variant={isRunning ? "success" : isMaint ? "warning" : "default"}
                    className="font-mono text-[10px]"
                  >
                    {m.status || "STOPPED"}
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
              </div>

              {/* Direct Database Action Controls */}
              <div className="mt-4 pt-3 border-t border-factory-border/60 flex items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-1">
                  {!isRunning && (
                    <button
                      onClick={() => handleToggleStatus(m, "RUNNING")}
                      disabled={upsertMutation.isPending}
                      className="px-2 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-semibold transition-colors flex items-center gap-1"
                      title="Chuyển sang Đang Chạy (Lưu DB)"
                    >
                      <Power size={11} /> Bật Máy
                    </button>
                  )}

                  {!isStopped && (
                    <button
                      onClick={() => handleToggleStatus(m, "PLANNED_STOP")}
                      disabled={upsertMutation.isPending}
                      className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold transition-colors"
                      title="Tắt máy tiết kiệm điện (Lưu DB)"
                    >
                      Tắt Máy
                    </button>
                  )}

                  {!isMaint && (
                    <button
                      onClick={() => handleToggleStatus(m, "MAINTENANCE")}
                      disabled={upsertMutation.isPending}
                      className="px-2 py-1 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 font-semibold transition-colors flex items-center gap-1"
                      title="Chuyển sang Bảo Trì (Lưu DB)"
                    >
                      <Wrench size={11} /> Bảo Trì
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteMachine(m.id)}
                  disabled={deleteMutation.isPending}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  title="Xóa máy khỏi DB"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal "+ Thêm Máy Ép Mới Vào DB" */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Thêm Máy Ép Mới Vào Database">
        <form onSubmit={handleAddMachine} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Mã Số Máy
              </label>
              <input
                type="text"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                placeholder="VD: 26号機 hoặc 26"
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Khu Phân Bổ (Bay)
              </label>
              <select
                value={bay}
                onChange={(e) => setBay(e.target.value as "A" | "B")}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
              >
                <option value="A">Khu Bay A</option>
                <option value="B">Khu Bay B</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Trọng Tải (Tấn)
              </label>
              <input
                type="number"
                value={tonnage}
                onChange={(e) => setTonnage(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                required
                min={30}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Công Suất (kW)
              </label>
              <input
                type="number"
                step="0.5"
                value={powerKw}
                onChange={(e) => setPowerKw(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Trạng Thái Đầu
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-2.5 py-2 text-xs text-white focus:border-blue-500"
              >
                <option value="PLANNED_STOP">PLANNED_STOP (Tắt máy)</option>
                <option value="RUNNING">RUNNING (Đang chạy)</option>
                <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-factory-border">
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" isLoading={upsertMutation.isPending} className="gap-1.5">
              <Plus size={14} /> Lưu Vào Database
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
