import React, { useState } from "react";
import { useProductsQuery, useMaterialsQuery, useBoxesQuery } from "../api/productsApi";
import { Badge } from "@/shared/components/ui/Badge";
import { Package, Flame, Layers } from "lucide-react";

export const ProductsBomView: React.FC = () => {
  const [tab, setTab] = useState<"products" | "materials" | "boxes">("products");
  const { data: products, isLoading: loadingProducts } = useProductsQuery();
  const { data: materials, isLoading: loadingMaterials } = useMaterialsQuery();
  const { data: boxes, isLoading: loadingBoxes } = useBoxesQuery();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Định Mức BOM, Nguyên Liệu & Quy Cách Bao Bì
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            28 con hàng chuẩn hóa • Điều kiện sấy nhựa tiêu chuẩn • Khay & Thùng KLT
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex bg-factory-card border border-factory-border rounded-lg p-1 text-xs">
          <button
            onClick={() => setTab("products")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              tab === "products" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers size={14} />
            28 Mã Hàng
          </button>
          <button
            onClick={() => setTab("materials")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              tab === "materials" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame size={14} />
            Hạt Nhựa & Sấy
          </button>
          <button
            onClick={() => setTab("boxes")}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
              tab === "boxes" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Package size={14} />
            Quy Cách Thùng
          </button>
        </div>
      </div>

      {/* Tab 1: Products */}
      {tab === "products" && (
        <div className="bg-factory-card border border-factory-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-factory-panel border-b border-factory-border text-xs uppercase font-mono text-slate-400">
              <tr>
                <th className="px-5 py-3">Mã Hàng</th>
                <th className="px-5 py-3">Tên Chi Tiết</th>
                <th className="px-5 py-3">Mã Nhựa</th>
                <th className="px-5 py-3">Quy Cách Thùng</th>
                <th className="px-5 py-3">Cavity</th>
                <th className="px-5 py-3">Chu Kỳ Ép</th>
                <th className="px-5 py-3">Chế Độ Đứng Máy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-factory-border">
              {loadingProducts ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    Đang tải danh mục mã hàng...
                  </td>
                </tr>
              ) : (
                products?.map((p) => (
                  <tr key={p.code} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-blue-400">{p.code}</td>
                    <td className="px-5 py-3.5 font-medium text-white">{p.name}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-amber-300">
                      {p.material?.resin_id || "PA6"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-300">
                      {p.box?.box_id || "KLT-4314"} ({p.box?.pcs_per_box || 100} pcs)
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">{p.cavity || 1}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">
                      {p.cycle_time || p.cycle_time_sec || 30}s
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={p.preferred_mode === "BY_PRODUCT" ? "warning" : "info"}>
                        {p.preferred_mode === "BY_PRODUCT" ? "Theo Con Hàng" : "Theo Máy Tự Động"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Materials */}
      {tab === "materials" && (
        <div className="bg-factory-card border border-factory-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-factory-panel border-b border-factory-border text-xs uppercase font-mono text-slate-400">
              <tr>
                <th className="px-5 py-3">Mã Nhựa</th>
                <th className="px-5 py-3">Tên Hạt Nhựa</th>
                <th className="px-5 py-3">Nhiệt Độ Sấy (°C)</th>
                <th className="px-5 py-3">Thời Gian Sấy Tối Thiểu</th>
                <th className="px-5 py-3">Cờ Dry-Coat (青○)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-factory-border">
              {loadingMaterials ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Đang tải danh mục hạt nhựa...
                  </td>
                </tr>
              ) : (
                materials?.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-amber-400">{m.id}</td>
                    <td className="px-5 py-3.5 font-medium text-white">{m.resin_name}</td>
                    <td className="px-5 py-3.5 font-mono text-emerald-400">{m.dry_temp_celsius}°C</td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">{m.dry_time_hours} giờ</td>
                    <td className="px-5 py-3.5">
                      {m.is_dry_coat ? (
                        <Badge variant="info" className="bg-cyan-950/70 text-cyan-300 border-cyan-500/40">
                          青○ Có yêu cầu đặc biệt
                        </Badge>
                      ) : (
                        <span className="text-slate-500 text-xs">Chuẩn</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Boxes */}
      {tab === "boxes" && (
        <div className="bg-factory-card border border-factory-border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-factory-panel border-b border-factory-border text-xs uppercase font-mono text-slate-400">
              <tr>
                <th className="px-5 py-3">Mã Bao Bì</th>
                <th className="px-5 py-3">Quy Cách Thùng</th>
                <th className="px-5 py-3">Số Chi Tiết / Thùng</th>
                <th className="px-5 py-3">Thời Gian Xuất Trước (Lead Time)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-factory-border">
              {loadingBoxes ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                    Đang tải quy cách thùng...
                  </td>
                </tr>
              ) : (
                boxes?.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-purple-400">{b.id}</td>
                    <td className="px-5 py-3.5 font-medium text-white">{b.box_name}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">{b.pcs_per_box} cái/thùng</td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">{b.staging_lead_hours} giờ trước giờ ép</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
