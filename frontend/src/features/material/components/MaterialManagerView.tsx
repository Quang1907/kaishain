import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { materialApi, MaterialConfirmPayload } from "../api/materialApi";
import { MaterialPrepLog } from "@/core/types/factory-common.types";
import { useAppStore } from "@/app/store/useAppStore";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import {
  Wheat,
  Thermometer,
  Boxes,
  Clock,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Flame,
  Droplets,
  Layers,
} from "lucide-react";

export const MaterialManagerView: React.FC = () => {
  const { currentDate, currentUser } = useAppStore();
  const queryClient = useQueryClient();

  const [selectedLog, setSelectedLog] = useState<MaterialPrepLog | null>(null);
  const [managerName, setManagerName] = useState(currentUser?.full_name || "エジソン (Edison)");
  const [actualTemp, setActualTemp] = useState<number>(80);
  const [boxesReady, setBoxesReady] = useState(true);
  const [notes, setNotes] = useState("");

  const { data: materialLogs = [], isLoading } = useQuery({
    queryKey: ["materialLogs", currentDate],
    queryFn: () => materialApi.getMaterialLogs(currentDate === "optimized" ? undefined : currentDate),
  });

  const confirmMutation = useMutation({
    mutationFn: (payload: MaterialConfirmPayload) => materialApi.confirmMaterialPrep(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materialLogs"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      setSelectedLog(null);
    },
  });

  const waitingCount = materialLogs.filter((l) => l.status === "WAITING" || l.status === "DRYING").length;
  const readyCount = materialLogs.filter((l) => l.status === "READY" || l.status === "CONFIRMED").length;

  const handleOpenConfirm = (log: MaterialPrepLog) => {
    setSelectedLog(log);
    setManagerName(currentUser?.full_name || "エジソン (Edison)");
    setActualTemp(log.target_temp || 80);
    setBoxesReady(Boolean(log.boxes_ready));
    setNotes(log.notes || "");
  };

  const handleConfirmSubmit = () => {
    if (!selectedLog) return;
    confirmMutation.mutate({
      log_id: selectedLog.id,
      manager_name: managerName,
      actual_temp: actualTemp,
      boxes_ready: boxesReady,
      notes,
    });
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-factory-panel to-slate-900 border border-emerald-500/30">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Wheat className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-wide">
                PHÂN HỆ NGUYÊN LIỆU &amp; SẤY NHỰA
              </h2>
              <Badge variant="success">NGUYÊN LIỆU</Badge>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Phụ trách: <strong className="text-emerald-400">{currentUser?.full_name || "エジソン (Edison)"}</strong> • Đảm bảo độ ẩm hạt &lt; 0.02% &amp; thùng bao bì
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3">
          <div className="px-3 py-2 rounded-xl bg-factory-card border border-factory-border text-center min-w-0 sm:min-w-[100px]">
            <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-semibold">Đang Sấy / Chờ</div>
            <div className="text-lg sm:text-xl font-extrabold text-amber-400 font-mono">{waitingCount}</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-factory-card border border-factory-border text-center min-w-0 sm:min-w-[100px]">
            <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-semibold">Đã Cấp Liệu</div>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono">{readyCount}</div>
          </div>
        </div>
      </div>

      {/* Dry Coat Alert */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-3">
        <Droplets className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-blue-200">Đặc biệt lưu ý hạt nhựa Dry Coat (青○ - ドライコート有色使用):</span> Các mã sản phẩm có ký hiệu vòng tròn xanh dương (青○) trên phiếu lập lịch sử dụng phụ gia màu khô đặc biệt. Cần nạp riêng phễu sấy độc lập, duy trì nhiệt độ sấy ổn định 3 - 4.5 giờ để tránh hiện tượng loang màu hoặc bọt khí trên bề mặt sản phẩm hoàn thiện.
        </div>
      </div>

      {/* Hopper Dryer Grid */}
      <Card>
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-factory-border/50">
          <Layers className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white">
              Bảng Giám Sát Phễu Sấy Hạt Nhựa & Tập Kết Bao Bì ({currentDate})
            </h3>
            <p className="text-xs text-slate-400">
              Hệ thống tự động liên kết phễu sấy tương thích cho 22 máy ép
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="py-12 flex justify-center text-slate-400 gap-3">
            <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            <span>Đang tải tình trạng phễu sấy...</span>
          </div>
        ) : materialLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Không có dữ liệu nguyên liệu cần cấp trong ngày.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materialLogs.map((log) => {
              const isReady = log.status === "READY" || log.status === "CONFIRMED";
              const isDryCoat = Boolean(log.is_dry_coat);

              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border transition-all ${
                    !isReady
                      ? "bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400"
                      : "bg-factory-card/60 border-factory-border/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-white font-mono bg-factory-panel px-2.5 py-1 rounded-lg border border-factory-border">
                        {log.machine_id}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-factory-bg text-slate-300 font-mono border border-factory-border">
                        {log.product_code}
                      </span>
                      {isDryCoat && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center gap-1">
                          ● 青○ Dry Coat
                        </span>
                      )}
                    </div>
                    <Badge variant={isReady ? "success" : "warning"}>
                      {isReady ? "✓ Đã Cấp Liệu" : "⌛ Đang Sấy Hạt"}
                    </Badge>
                  </div>

                  {/* Resin & Drying Details */}
                  <div className="mt-3.5 space-y-2 p-3 rounded-lg bg-factory-bg/80 border border-factory-border/50 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Hạt nhựa:</span>
                      <strong className="text-emerald-400 font-mono text-sm">{log.resin_name}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Flame size={13} className="text-amber-400" />
                        Nhiệt độ sấy chuẩn:
                      </span>
                      <span className="font-mono text-slate-200">
                        {log.target_temp}°C (Thực tế: <strong className={log.actual_temp ? "text-emerald-400" : "text-amber-400"}>{log.actual_temp || log.target_temp}°C</strong>)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock size={13} className="text-blue-400" />
                        Thời gian sấy tiêu chuẩn:
                      </span>
                      <span className="font-mono text-slate-200">{log.drying_lead_hours} giờ</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Boxes size={13} className="text-purple-400" />
                        Thùng & Bao bì chân máy:
                      </span>
                      <span className={log.boxes_ready ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                        {log.boxes_ready ? "✓ Đã tập kết đủ" : "Chưa tập kết"}
                      </span>
                    </div>
                  </div>

                  {/* Sign-off info & Action */}
                  <div className="mt-4 pt-3 border-t border-factory-border/50 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      {isReady ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          Ký bởi: <strong>{log.manager_name}</strong>
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1">
                          <AlertCircle size={13} />
                          Cần xác nhận độ ẩm & cấp liệu
                        </span>
                      )}
                    </div>

                    <Button
                      variant={!isReady ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => handleOpenConfirm(log)}
                      className={!isReady ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""}
                    >
                      {!isReady ? "Ký Cấp Liệu" : "Xem Chi Tiết"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Modal Ký Cấp Liệu */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`XÁC NHẬN CẤP LIỆU & SẤY NHỰA - ${selectedLog?.machine_id} (${selectedLog?.product_code})`}
        maxWidth="lg"
      >
        {selectedLog && (
          <div className="space-y-5">
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-200">
              <p className="font-bold">Cấp liệu hạt nhựa: {selectedLog.resin_name}</p>
              <p className="text-slate-400 mt-0.5">Máy ép: <strong>{selectedLog.machine_id}</strong> • Sản phẩm: <strong>{selectedLog.product_code}</strong> • Tiêu chuẩn sấy: {selectedLog.target_temp}°C trong {selectedLog.drying_lead_hours}h</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Thermometer size={14} className="text-amber-400" />
                  Nhiệt độ phễu sấy thực tế đo được (°C)
                </label>
                <input
                  type="number"
                  value={actualTemp}
                  onChange={(e) => setActualTemp(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-white font-mono"
                />
              </div>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-factory-card border border-factory-border hover:border-emerald-500/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={boxesReady}
                  onChange={(e) => setBoxesReady(e.target.checked)}
                  className="mt-0.5 rounded border-slate-600 text-emerald-600 focus:ring-0"
                />
                <div className="text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <PackageCheck size={14} className="text-emerald-400" />
                    Quy cách thùng & túi nilon đã tập kết đầy đủ tại chân máy
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Đã kiểm tra đúng quy cách mã thùng theo BOM, tem nhãn thành phẩm đã in sẵn sàng.
                  </p>
                </div>
              </label>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tên Quản Lý Nguyên Liệu Ký Duyệt</label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Ghi chú kiểm tra độ ẩm / Số lô hạt nhựa</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Lô nhựa LOT-202611-09, đo độ ẩm 0.012% (đạt tiêu chuẩn < 0.02%)..."
                  className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-white resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-factory-border">
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Đóng
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSubmit}
                isLoading={confirmMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Ký Xác Nhận & Cấp Liệu
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaterialManagerView;
