import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workstationApi, OperatorReportPayload } from "../api/workstationApi";
import { useAppStore } from "@/app/store/useAppStore";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import {
  User,
  Factory,
  Boxes,
  Wheat,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  ClipboardList,
  Sparkles,
} from "lucide-react";

export const OperatorWorkstationView: React.FC = () => {
  const { currentUser } = useAppStore();
  const queryClient = useQueryClient();

  // Mặc định nhân viên Chí (チー) đứng con hàng W165 tại 15号機
  const [machineId, setMachineId] = useState("15号機");
  const [productCode, setProductCode] = useState("W165");
  const [actualQty, setActualQty] = useState<number>(1150);
  const [scraps, setScraps] = useState<number>(24);
  const [scrapReason, setScrapReason] = useState("Ba-via đầu ca do căn chỉnh nhiệt độ");
  const [operatorName, setOperatorName] = useState(currentUser?.full_name || "Chí (チー)");
  const [successResponse, setSuccessResponse] = useState<string | null>(null);

  const reportMutation = useMutation({
    mutationFn: (payload: OperatorReportPayload) => workstationApi.submitShiftReport(payload),
    onSuccess: (data) => {
      setSuccessResponse(data.message);
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      queryClient.invalidateQueries({ queryKey: ["learning-profile"] });
      queryClient.invalidateQueries({ queryKey: ["feedbackLogs"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessResponse(null);
    reportMutation.mutate({
      machine_id: machineId,
      product_code: productCode,
      actual_qty: Number(actualQty),
      scraps: Number(scraps),
      operator_name: operatorName,
      note: `Lý do phế phẩm: ${scrapReason}`,
    });
  };

  const defectRate = actualQty > 0 ? ((scraps / (actualQty + scraps)) * 100).toFixed(2) : "0.00";

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-factory-panel to-slate-900 border border-purple-500/30">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                BÀN LÀM VIỆC NHÂN VIÊN ĐỨNG MÁY (OPERATOR WORKSTATION)
              </h2>
              <Badge variant="info">NHÂN VIÊN ĐỨNG MÁY</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Nhân viên: <strong className="text-purple-300">{operatorName}</strong> • Phân bổ theo: <span className="text-amber-400 font-semibold">Theo con hàng (By Product)</span>
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-xl bg-factory-card border border-factory-border text-center">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Máy Đang Đứng</div>
          <div className="text-xl font-extrabold text-purple-400 font-mono">{machineId}</div>
        </div>
      </div>

      {/* 3 Pillars Readiness for Current Station */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-factory-card border border-factory-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Wheat size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">1. Nguyên Liệu (ABS)</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={14} /> Sẵn sàng (80°C - 3h)
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-factory-card border border-factory-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Boxes size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">2. Thùng Bao Bì (B-05)</div>
            <div className="text-sm font-bold text-blue-400 flex items-center gap-1">
              <CheckCircle2 size={14} /> 12 Thùng tại chân máy
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-factory-card border border-factory-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Factory size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400">3. Khuôn Ép ({productCode})</div>
            <div className="text-sm font-bold text-amber-400 flex items-center gap-1">
              <CheckCircle2 size={14} /> Thợ máy đã nghiệm thu
            </div>
          </div>
        </div>
      </div>

      {/* End-of-shift reporting Form */}
      <Card>
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-factory-border/50">
          <ClipboardList className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-bold text-white">
              Báo Cáo Sản Lượng & Phế Phẩm Cuối Ca
            </h3>
            <p className="text-xs text-slate-400">
              Dữ liệu này được nạp trực tiếp vào PostgreSQL để AI tự động tối ưu đệm an toàn cho lần sau
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {successResponse && (
            <div className="p-4 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-xs text-emerald-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-100">Đã cập nhật hệ thống thành công!</p>
                <p className="mt-1 leading-relaxed">{successResponse}</p>
                <p className="mt-1 text-slate-400">
                  ⚡ Thuật toán Machine Learning đã cập nhật tỷ lệ bù hao hụt cho mã <strong>{productCode}</strong> lên máy <strong>{machineId}</strong> vào Database Server. Lần lập lịch tới sẽ tự động cộng bù để <strong>không bao giờ bị thiếu hàng</strong>!
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Máy ép sản xuất</label>
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-white font-mono"
              >
                {Array.from({ length: 24 }, (_, i) => {
                  const num = i + 2;
                  if (num === 14) return null;
                  const mName = `${num}号機`;
                  return <option key={mName} value={mName}>{mName}</option>;
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Mã con hàng</label>
              <input
                type="text"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Sản lượng đạt chuẩn (OK Pcs)</label>
              <input
                type="number"
                value={actualQty}
                onChange={(e) => setActualQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-emerald-400 font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Phế phẩm / NG (Pcs)</label>
              <input
                type="number"
                value={scraps}
                onChange={(e) => setScraps(Number(e.target.value))}
                className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-red-400 font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tỷ lệ phế phẩm tính toán</label>
              <div className="px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm font-mono flex items-center justify-between text-amber-400 font-bold">
                <span>{defectRate}%</span>
                <TrendingUp size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nguyên nhân lỗi / Hiện tượng bất thường</label>
            <input
              type="text"
              value={scrapReason}
              onChange={(e) => setScrapReason(e.target.value)}
              placeholder="Ví dụ: Ba-via cạnh, vết co ngót, phễu sấy nhiệt độ bị tụt 5 độ..."
              className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Nhân viên xác nhận</label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-white"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-300 flex items-start gap-2.5">
            <BrainCircuit className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Tối ưu hóa học máy liên tục (Continuous Learning Loop):</strong> Bất kỳ phế phẩm nào được nhân viên ghi nhận sẽ được lưu vào bảng <code>learning_feedback_logs</code> trong PostgreSQL. Thuật toán sẽ phân tích xu hướng và tự động bù thêm sản lượng sản xuất cho đơn vị đó ở ca kế tiếp để đảm bảo <strong>Lệnh Xuất Hàng (Shipping Orders) không bao giờ bị thiếu hàng</strong>.
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={reportMutation.isPending}
              className="bg-purple-600 hover:bg-purple-500 text-white px-8"
            >
              Gửi Báo Cáo Ca & Huấn Luyện AI
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OperatorWorkstationView;
