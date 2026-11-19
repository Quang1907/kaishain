import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { workstationApi, OperatorReportPayload } from "../api/workstationApi";
import { useAppStore } from "@/app/store/useAppStore";
import { useMachinesQuery } from "@/features/machines/api/machinesApi";
import { useProductsQuery } from "@/features/products-bom/api/productsApi";
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

  const { data: machines = [] } = useMachinesQuery();
  const { data: products = [] } = useProductsQuery();

  const [machineId, setMachineId] = useState("15号機");
  const [productCode, setProductCode] = useState("W165");
  const [actualQty, setActualQty] = useState<number>(1150);
  const [scraps, setScraps] = useState<number>(24);
  const [scrapReason, setScrapReason] = useState("Ba-via cạnh đầu ca do căn chỉnh nhiệt độ");
  const [operatorName, setOperatorName] = useState(currentUser?.full_name || "Chí (チー)");
  const [successResponse, setSuccessResponse] = useState<string | null>(null);

  // Sync initial machine and product once loaded from DB
  useEffect(() => {
    if (machines.length > 0 && !machines.some((m) => m.id === machineId)) {
      setMachineId(machines[0].id);
    }
  }, [machines, machineId]);

  useEffect(() => {
    if (products.length > 0 && !products.some((p) => p.code === productCode)) {
      setProductCode(products[0].code);
    }
  }, [products, productCode]);

  // Tìm model sản phẩm và máy hiện tại từ DB
  const selectedProduct = products.find((p) => p.code === productCode);
  const selectedMachine = machines.find((m) => m.id === machineId);

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
              Nhân viên: <strong className="text-purple-300">{operatorName}</strong> • Chế độ điều phối:{" "}
              <span className="text-amber-400 font-semibold">
                {selectedProduct?.preferred_mode === "BY_MACHINE"
                  ? "Cố định theo máy (By Machine)"
                  : "Theo con hàng (By Product)"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-factory-card border border-factory-border text-center">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Máy Đang Đứng</div>
            <div className="text-xl font-extrabold text-purple-400 font-mono">{machineId}</div>
            <span className="text-[10px] text-slate-500 font-mono">
              {selectedMachine?.tonnage}T • {selectedMachine?.bay === "A" ? "Bay A" : "Bay B"}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Pillars Readiness for Current Station from Real DB Models */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Material / Resin */}
        <div className="p-4 rounded-xl bg-factory-card border border-factory-border flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Wheat size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              1. Nguyên Liệu Nhựa (DB)
            </div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={14} /> {selectedProduct?.material?.name || "Chưa gán nhựa"}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              {selectedProduct?.material?.dry_temp ? (
                <span>
                  Sấy: <strong className="text-white">{selectedProduct.material.dry_temp}°C</strong> ({selectedProduct.material.dry_hours}h)
                  {selectedProduct.material.is_dry_coat && " • Tráng bạc"}
                </span>
              ) : (
                "Nhựa tiêu chuẩn xưởng"
              )}
            </div>
          </div>
        </div>

        {/* Pillar 2: Box / Packaging */}
        <div className="p-4 rounded-xl bg-factory-card border border-factory-border flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Boxes size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              2. Thùng Bao Bì (DB)
            </div>
            <div className="text-sm font-bold text-blue-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={14} /> {selectedProduct?.box?.name || selectedProduct?.box?.box_id || "Thùng tiêu chuẩn"}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              Đóng gói: <strong className="text-white">{selectedProduct?.box?.pcs_per_box || 100}</strong> pcs/thùng
            </div>
          </div>
        </div>

        {/* Pillar 3: Mold & Machine Tonnage */}
        <div className="p-4 rounded-xl bg-factory-card border border-factory-border flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Factory size={20} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              3. Khuôn Ép ({productCode})
            </div>
            <div className="text-sm font-bold text-amber-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 size={14} /> Cavity: {selectedProduct?.cavity || 2} • Chu kỳ: {selectedProduct?.cycle_time_sec || selectedProduct?.cycle_time || 35}s
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              Máy ép phù hợp: {selectedProduct?.compatible_machines?.join(", ") || `${selectedMachine?.tonnage}T`}
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
              Dữ liệu được nạp trực tiếp vào Database thực tế để AI tự động tối ưu hệ số bù phế phẩm cho lần lập lịch sau
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
                  ⚡ Thuật toán Machine Learning đã ghi nhận vào Database. Lần lập lịch tới sẽ tự động cộng bù để <strong>không bao giờ bị thiếu hàng</strong>!
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Máy ép sản xuất (Từ DB {machines.length} máy)
              </label>
              <select
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-white font-mono"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} ({m.tonnage}T - {m.bay === "A" ? "Bay A" : "Bay B"} - {m.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Mã con hàng (Từ DB {products.length} mã)
              </label>
              <select
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-white font-mono"
              >
                {products.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
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
                required
                min={0}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Phế phẩm / NG (Pcs)</label>
              <input
                type="number"
                value={scraps}
                onChange={(e) => setScraps(Number(e.target.value))}
                className="w-full px-3 py-2 bg-factory-bg border border-factory-border rounded-lg text-sm text-red-400 font-mono font-bold"
                required
                min={0}
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
              required
            />
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-300 flex items-start gap-2.5">
            <BrainCircuit className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Tối ưu hóa học máy liên tục (Continuous Learning Loop):</strong> Bất kỳ phế phẩm nào được nhân viên ghi nhận sẽ được lưu vào cơ sở dữ liệu. Thuật toán sẽ phân tích xu hướng và tự động bù thêm sản lượng sản xuất cho đơn vị đó ở ca kế tiếp để đảm bảo <strong>Lệnh Xuất Hàng (Shipping Orders) không bao giờ bị thiếu hàng</strong>.
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
              Gửi Báo Cáo Ca & Huấn Luyện AI Vào DB
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OperatorWorkstationView;
