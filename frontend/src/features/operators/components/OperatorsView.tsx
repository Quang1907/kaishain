import React, { useState } from "react";
import {
  useOperatorsQuery,
  useUpsertOperatorMutation,
  useDeleteOperatorMutation,
} from "../api/operatorsApi";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import { UserCheck, Clock, Award, Plus, Trash2 } from "lucide-react";

export const OperatorsView: React.FC = () => {
  const { data: operators, isLoading } = useOperatorsQuery();
  const upsertMutation = useUpsertOperatorMutation();
  const deleteMutation = useDeleteOperatorMutation();

  const [filterShift, setFilterShift] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [shift, setShift] = useState<"DAY" | "OVERTIME" | "NIGHT">("DAY");
  const [mode, setMode] = useState<"BY_PRODUCT" | "BY_MACHINE">("BY_MACHINE");
  const [skill, setSkill] = useState(2);
  const [assignedMachine, setAssignedMachine] = useState("");

  const filtered = operators?.filter((op) => {
    if (filterShift === "ALL") return true;
    return op.shift === filterShift;
  });

  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertMutation.mutateAsync({
      name,
      shift,
      mode,
      skill: Number(skill),
      assigned_machine: assignedMachine.trim() || null,
      start: shift === "DAY" ? 8.0 : shift === "OVERTIME" ? 17.0 : 20.0,
      end: shift === "DAY" ? 17.0 : shift === "OVERTIME" ? 20.0 : 29.0,
    });
    setIsAddModalOpen(false);
    setName("");
    setAssignedMachine("");
  };

  const handleDeleteOperator = (opId: string | number, opName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân sự ${opName} khỏi Database?`)) {
      deleteMutation.mutate(opId);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Phân Bổ Nhân Lực & Thợ Vận Hành ({operators?.length || 0} Nhân Sự)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            2 chế độ vận hành: Theo con hàng khó (By Product) & Trông máy tự động (By Machine) • Lưu trữ trực tiếp trong DB
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter */}
          <div className="flex bg-factory-card border border-factory-border rounded-lg p-1 text-xs">
            {["ALL", "DAY", "OVERTIME", "NIGHT"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterShift(s)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  filterShift === s ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                {s === "ALL" && "Tất cả"}
                {s === "DAY" && "Ca Ngày (8-17h)"}
                {s === "OVERTIME" && "Tăng Ca (17-20h)"}
                {s === "NIGHT" && "Ca Đêm (20-5h)"}
              </button>
            ))}
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 h-8">
            <Plus size={15} />
            <span>Thêm Nhân Lực</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            Đang tải dữ liệu nhân sự từ Database...
          </div>
        ) : (
          filtered?.map((op) => (
            <div
              key={op.id}
              className="bg-factory-card border border-factory-border rounded-xl p-4 flex flex-col justify-between shadow-sm hover:border-blue-500/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{op.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Clock size={12} />
                      <span>
                        {op.shift === "DAY" && "Ca Ngày (8:00 - 17:00)"}
                        {op.shift === "OVERTIME" && "Tăng ca (17:00 - 20:00)"}
                        {op.shift === "NIGHT" && "Ca Đêm (20:00 - 05:00)"}
                      </span>
                    </div>
                    {op.assigned_machine && (
                      <div className="text-[11px] text-slate-400 mt-1">
                        Phụ trách: <strong className="text-white font-mono">{op.assigned_machine}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <Badge
                    variant={
                      op.skill >= 4
                        ? "warning"
                        : op.mode === "BY_PRODUCT"
                        ? "info"
                        : "default"
                    }
                  >
                    {op.mode === "BY_PRODUCT" ? "Theo Con Hàng" : "Theo Cụm Máy"}
                  </Badge>
                  <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                    <Award size={12} className="text-amber-400" />
                    <span>Bậc {op.skill}/5</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-factory-border/60 flex justify-end">
                <button
                  onClick={() => handleDeleteOperator(op.id, op.name)}
                  disabled={deleteMutation.isPending}
                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors text-xs flex items-center gap-1"
                  title="Xóa nhân sự khỏi DB"
                >
                  <Trash2 size={13} />
                  <span>Xóa khỏi DB</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Thêm Nhân Sự */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Thêm Nhân Sự Mới Vào Database">
        <form onSubmit={handleAddOperator} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Họ Tên Nhân Sự
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A (アイン)"
              className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Ca Làm Việc
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
              >
                <option value="DAY">Ca Ngày (08:00 - 17:00)</option>
                <option value="OVERTIME">Tăng Ca (17:00 - 20:00)</option>
                <option value="NIGHT">Ca Đêm (20:00 - 05:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Chế Độ Đứng Máy
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
              >
                <option value="BY_MACHINE">Theo Cụm Máy (Tự động)</option>
                <option value="BY_PRODUCT">Theo Con Hàng (Chuyên gia)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Bậc Tay Nghề (1 - 5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={skill}
                onChange={(e) => setSkill(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Máy Hoặc Con Hàng Phụ Trách
              </label>
              <input
                type="text"
                value={assignedMachine}
                onChange={(e) => setAssignedMachine(e.target.value)}
                placeholder="VD: 10号機 hoặc W165"
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
              />
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
