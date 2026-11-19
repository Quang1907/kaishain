import React, { useState, useEffect } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { useAppStore } from "@/app/store/useAppStore";
import { formatTimeHour } from "@/shared/utils/formatters";
import { JOB_TYPE_CONFIGS } from "@/core/config/constants";
import { useUpsertJobMutation, useDeleteJobMutation } from "../api/scheduleApi";
import {
  Package,
  Flame,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Save,
  Layers,
} from "lucide-react";

export const JobDetailModal: React.FC = () => {
  const { selectedJob, setSelectedJob, currentDate } = useAppStore();
  const upsertMutation = useUpsertJobMutation();
  const deleteMutation = useDeleteJobMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [plannedQty, setPlannedQty] = useState(0);
  const [operatorName, setOperatorName] = useState("");
  const [startHour, setStartHour] = useState(7.0);
  const [endHour, setEndHour] = useState(14.5);
  const [eventType, setEventType] = useState<string>("PROD");

  useEffect(() => {
    if (selectedJob) {
      setPlannedQty(selectedJob.planned_qty || 0);
      setOperatorName(selectedJob.op || "");
      setStartHour(selectedJob.start);
      setEndHour(selectedJob.end);
      setEventType(selectedJob.event || "PROD");
      setIsEditing(false);
    }
  }, [selectedJob]);

  if (!selectedJob) return null;

  const prereq = selectedJob.prerequisites;
  const config = JOB_TYPE_CONFIGS[selectedJob.event] || JOB_TYPE_CONFIGS.PROD;

  const mat = prereq?.material;
  const box = prereq?.box;
  const op = prereq?.operator;

  const matReady = mat?.status === "READY" || mat?.is_ready;
  const boxReady = box?.status === "READY" || box?.is_ready;
  const opReady = op?.status === "READY" || op?.is_ready;
  const allReady = prereq?.all_ready ?? (matReady && boxReady && opReady);

  const handleSaveToDb = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertMutation.mutateAsync({
      schedule_id: currentDate,
      job: {
        ...selectedJob,
        planned_qty: Number(plannedQty),
        op: operatorName.trim() || null,
        start: Number(startHour),
        end: Number(endHour),
        event: eventType as any,
      },
    });
    setIsEditing(false);
    setSelectedJob(null);
  };

  const handleDeleteFromDb = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn XÓA khối lệnh ${selectedJob.product} trên ${selectedJob.machine} khỏi Database?`)) {
      await deleteMutation.mutateAsync(selectedJob.id);
      setSelectedJob(null);
    }
  };

  return (
    <Modal
      isOpen={!!selectedJob}
      onClose={() => setSelectedJob(null)}
      title={`Chi Tiết Lệnh Ép • ${selectedJob.machine} - Mã Hàng ${selectedJob.product}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Basic Header Info */}
        <div className="flex items-center justify-between p-4 bg-factory-card rounded-xl border border-factory-border">
          <div>
            <div className="text-xs text-slate-400 uppercase font-semibold">Mã Chi Tiết & Con Hàng</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {selectedJob.product}
            </div>
            {prereq?.product_name && (
              <div className="text-xs text-slate-300 mt-0.5">{prereq.product_name}</div>
            )}
            <div className="text-xs text-slate-400 mt-1">
              Thời gian:{" "}
              <span className="font-mono text-blue-400 font-semibold">
                {formatTimeHour(selectedJob.start)} → {formatTimeHour(selectedJob.end)}
              </span>{" "}
              ({(selectedJob.end - selectedJob.start).toFixed(1)}h)
            </div>
          </div>
          <div className="text-right">
            <Badge variant="info" className={config.badge}>
              {config.label}
            </Badge>
            {selectedJob.planned_qty > 0 && (
              <div className="text-xs text-slate-400 mt-2">
                Kế hoạch: <strong className="text-white font-mono">{selectedJob.planned_qty}</strong> pcs
              </div>
            )}
            {selectedJob.op && (
              <div className="text-xs text-slate-400 mt-1">
                Thợ máy: <strong className="text-emerald-400">{selectedJob.op}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form Toggle */}
        {isEditing ? (
          <form onSubmit={handleSaveToDb} className="p-4 bg-slate-900/80 rounded-xl border border-blue-500/40 space-y-3">
            <div className="text-xs font-bold uppercase text-blue-400 flex items-center gap-1.5 mb-2">
              <Layers size={14} /> Chỉnh Sửa Thông Tin & Lưu Trực Tiếp Vào Database
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Số Lượng Kế Hoạch (pcs)
                </label>
                <input
                  type="number"
                  value={plannedQty}
                  onChange={(e) => setPlannedQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-factory-border rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-blue-500"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Thợ Máy Đứng Chuyền
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  placeholder="VD: Thu, Chí, Quỳnh..."
                  className="w-full bg-slate-950 border border-factory-border rounded-lg px-3 py-1.5 text-sm text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Giờ Bắt Đầu
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="7"
                  max="31"
                  value={startHour}
                  onChange={(e) => setStartHour(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-factory-border rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Giờ Kết Thúc
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="7"
                  max="31"
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-factory-border rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Loại Công Việc
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-slate-950 border border-factory-border rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500"
                >
                  <option value="PROD">Sản xuất (PROD)</option>
                  <option value="MOLD_CHANGE">○ Gá khuôn (型替)</option>
                  <option value="COLOR_CHANGE">△ Đổi màu (色替)</option>
                  <option value="STOP">□ Kế hoạch dừng</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={upsertMutation.isPending} className="gap-1.5">
                <Save size={14} /> Lưu Vào DB
              </Button>
            </div>
          </form>
        ) : null}

        {/* 3 Chân Kiềng (Prerequisites Checklist from DB) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Kiểm Soát 3 Chân Kiềng (JIT Verification)</span>
            {allReady ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-semibold">
                <CheckCircle2 size={14} /> Đủ điều kiện khởi động
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 text-[11px] font-semibold">
                <AlertTriangle size={14} /> Chưa đủ điều kiện
              </span>
            )}
          </h4>

          <div className="space-y-3">
            {/* 1. Bao bì / Thùng */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-factory-card border border-factory-border">
              <div
                className={`p-2 rounded-lg ${
                  boxReady ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                }`}
              >
                <Package size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-200">
                    1. Quy cách thùng bao bì {box?.box_name ? `(${box.box_name})` : ""}
                  </span>
                  <Badge variant={boxReady ? "success" : "warning"}>
                    {boxReady ? "ĐÃ CẤP THÙNG" : "CHƯA ĐỦ THÙNG"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {box?.note ||
                    (box?.required_boxes
                      ? `Cần ${box.required_boxes} thùng (${box.pcs_per_box} cái/thùng). Chuẩn bị tại khu Staging.`
                      : "Đã chuẩn bị trước 1.5 giờ tại khu Staging theo tiêu chuẩn Kanban.")}
                </p>
              </div>
            </div>

            {/* 2. Sấy nhựa & Nhiệt độ */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-factory-card border border-factory-border">
              <div
                className={`p-2 rounded-lg ${
                  matReady ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                }`}
              >
                <Flame size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-200">
                    2. Sấy hạt nhựa {mat?.resin ? `(${mat.resin})` : ""}
                  </span>
                  <Badge variant={matReady ? "success" : "warning"}>
                    {matReady ? "SẤY ĐẠT NHIỆT" : "ĐANG SẤY NHIỆT"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {mat?.note ||
                    (mat?.dry_temp
                      ? `Nhiệt độ sấy: ${mat.dry_temp}°C trong ${mat.dry_hours}h. ${
                          mat.is_dry_coat ? "Yêu cầu cờ sấy đặc biệt 青○." : "Tiêu chuẩn nòng chống ẩm."
                        }`
                      : "Hopper hoàn thành chu kỳ nhiệt độ, độ ẩm hạt nhựa đạt tiêu chuẩn.")}
                </p>
              </div>
            </div>

            {/* 3. Nhân công thợ máy */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-factory-card border border-factory-border">
              <div
                className={`p-2 rounded-lg ${
                  opReady ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                }`}
              >
                <UserCheck size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-200">
                    3. Bố trí người đứng máy {op?.operator_name ? `(${op.operator_name})` : ""}
                  </span>
                  <Badge variant={opReady ? "success" : "warning"}>
                    {opReady ? "ĐÃ BỐ TRÍ" : "CHƯA PHÂN BỔ"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {op?.note ||
                    `Phân bổ: ${selectedJob.op || "Công nhân chính"} theo chế độ ${
                      op?.mode === "BY_PRODUCT" ? "Kiểm tra theo con hàng" : "Trông cụm máy tự động"
                    }.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Edit in DB / Delete from DB */}
        <div className="pt-3 flex items-center justify-between border-t border-factory-border">
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteFromDb}
            isLoading={deleteMutation.isPending}
            className="gap-1.5"
          >
            <Trash2 size={14} /> Xóa Khỏi Database
          </Button>

          <div className="flex gap-2">
            {!isEditing && (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                Chỉnh Sửa Khối Lệnh
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
