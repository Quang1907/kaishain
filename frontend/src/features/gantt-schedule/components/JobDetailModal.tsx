import React from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Badge } from "@/shared/components/ui/Badge";
import { useAppStore } from "@/app/store/useAppStore";
import { formatTimeHour } from "@/shared/utils/formatters";
import { JOB_TYPE_CONFIGS } from "@/core/config/constants";
import { Package, Flame, UserCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

export const JobDetailModal: React.FC = () => {
  const { selectedJob, setSelectedJob } = useAppStore();

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

        {/* 3 Chân Kiềng (Prerequisites Checklist) */}
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
      </div>
    </Modal>
  );
};
