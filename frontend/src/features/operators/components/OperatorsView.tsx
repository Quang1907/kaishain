import React, { useState } from "react";
import { useOperatorsQuery } from "../api/operatorsApi";
import { Badge } from "@/shared/components/ui/Badge";
import { UserCheck, Clock, Award } from "lucide-react";

export const OperatorsView: React.FC = () => {
  const { data: operators, isLoading } = useOperatorsQuery();
  const [filterShift, setFilterShift] = useState<string>("ALL");

  const filtered = operators?.filter((op) => {
    if (filterShift === "ALL") return true;
    return op.shift === filterShift;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Phân Bổ Nhân Lực & Thợ Vận Hành ({operators?.length || 24} Nhân Sự)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            2 chế độ vận hành: Theo con hàng khó (By Product) & Trông máy tự động (By Machine)
          </p>
        </div>

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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            Đang tải dữ liệu nhân sự...
          </div>
        ) : (
          filtered?.map((op) => (
            <div
              key={op.id}
              className="bg-factory-card border border-factory-border rounded-xl p-4 flex items-start justify-between shadow-sm hover:border-blue-500/40 transition-colors"
            >
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
                    <div className="text-[11px] text-slate-500 mt-1">
                      Phụ trách: <span className="text-slate-300 font-medium">{op.assigned_machine}</span>
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
                  <span>Tay nghề: Bậc {op.skill}/5</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
