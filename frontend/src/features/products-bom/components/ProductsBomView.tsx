import React, { useState } from "react";
import {
  useProductsQuery,
  useMaterialsQuery,
  useBoxesQuery,
  useUpsertProductMutation,
  useDeleteProductMutation,
  useUpsertMaterialMutation,
  useDeleteMaterialMutation,
  useUpsertBoxMutation,
  useDeleteBoxMutation,
} from "../api/productsApi";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import { Package, Flame, Layers, Plus, Trash2 } from "lucide-react";

export const ProductsBomView: React.FC = () => {
  const [tab, setTab] = useState<"products" | "materials" | "boxes">("products");
  const { data: products, isLoading: loadingProducts } = useProductsQuery();
  const { data: materials, isLoading: loadingMaterials } = useMaterialsQuery();
  const { data: boxes, isLoading: loadingBoxes } = useBoxesQuery();

  const upsertProductMutation = useUpsertProductMutation();
  const deleteProductMutation = useDeleteProductMutation();
  const upsertMaterialMutation = useUpsertMaterialMutation();
  const deleteMaterialMutation = useDeleteMaterialMutation();
  const upsertBoxMutation = useUpsertBoxMutation();
  const deleteBoxMutation = useDeleteBoxMutation();

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State Products
  const [pCode, setPCode] = useState("");
  const [pName, setPName] = useState("");
  const [pMatId, setPMatId] = useState("ABS-750");
  const [pBoxId, setPBoxId] = useState("THUNG-KLT-4314");
  const [pCycle, setPCycle] = useState(30);
  const [pCavity, setPCavity] = useState(2);

  // Form State Materials
  const [matId, setMatId] = useState("");
  const [matName, setMatName] = useState("");
  const [matTemp, setMatTemp] = useState(80);
  const [matHours, setMatHours] = useState(3.0);
  const [isDryCoat, setIsDryCoat] = useState(false);

  // Form State Boxes
  const [bId, setBId] = useState("");
  const [bName, setBName] = useState("");
  const [bPcs, setBPcs] = useState(100);
  const [bLead, setBLead] = useState(1.0);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertProductMutation.mutateAsync({
      code: pCode,
      name: pName,
      material_id: pMatId,
      box_id: pBoxId,
      cycle_time_sec: Number(pCycle),
      cavity: Number(pCavity),
      preferred_mode: "BY_MACHINE",
    });
    setIsAddModalOpen(false);
    setPCode("");
    setPName("");
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertMaterialMutation.mutateAsync({
      id: matId,
      resin_name: matName,
      dry_temp_celsius: Number(matTemp),
      dry_time_hours: Number(matHours),
      is_dry_coat: isDryCoat,
    });
    setIsAddModalOpen(false);
    setMatId("");
    setMatName("");
  };

  const handleAddBox = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertBoxMutation.mutateAsync({
      id: bId,
      box_name: bName,
      pcs_per_box: Number(bPcs),
      staging_lead_hours: Number(bLead),
    });
    setIsAddModalOpen(false);
    setBId("");
    setBName("");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Định Mức BOM, Nguyên Liệu & Quy Cách Bao Bì
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dữ liệu trực tiếp từ Database PostgreSQL/SQLite • Thao tác thêm/sửa/xóa 2 chiều
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub-tabs */}
          <div className="flex bg-factory-card border border-factory-border rounded-lg p-1 text-xs">
            <button
              onClick={() => setTab("products")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                tab === "products" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers size={14} />
              Mã Hàng ({products?.length || 0})
            </button>
            <button
              onClick={() => setTab("materials")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                tab === "materials" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Flame size={14} />
              Hạt Nhựa ({materials?.length || 0})
            </button>
            <button
              onClick={() => setTab("boxes")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                tab === "boxes" ? "bg-blue-600 text-white font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Package size={14} />
              Thùng ({boxes?.length || 0})
            </button>
          </div>

          <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 h-8">
            <Plus size={15} />
            <span>
              {tab === "products" && "Thêm Mã Hàng"}
              {tab === "materials" && "Thêm Loại Nhựa"}
              {tab === "boxes" && "Thêm Loại Thùng"}
            </span>
          </Button>
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
                <th className="px-5 py-3 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-factory-border">
              {loadingProducts ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                    Đang tải danh mục mã hàng từ Database...
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
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa mã hàng ${p.code} khỏi Database?`)) {
                            deleteProductMutation.mutate(p.code);
                          }
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Xóa mã hàng"
                      >
                        <Trash2 size={14} />
                      </button>
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
                <th className="px-5 py-3 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-factory-border">
              {loadingMaterials ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                    Đang tải danh mục hạt nhựa từ Database...
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
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa hạt nhựa ${m.id} khỏi Database?`)) {
                            deleteMaterialMutation.mutate(m.id);
                          }
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Xóa hạt nhựa"
                      >
                        <Trash2 size={14} />
                      </button>
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
                <th className="px-5 py-3 text-right">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-factory-border">
              {loadingBoxes ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    Đang tải quy cách thùng từ Database...
                  </td>
                </tr>
              ) : (
                boxes?.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-purple-400">{b.id}</td>
                    <td className="px-5 py-3.5 font-medium text-white">{b.box_name}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">{b.pcs_per_box} cái/thùng</td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">{b.staging_lead_hours} giờ trước giờ ép</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          if (window.confirm(`Xóa quy cách thùng ${b.id} khỏi Database?`)) {
                            deleteBoxMutation.mutate(b.id);
                          }
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                        title="Xóa thùng"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Thêm Mới */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={
          tab === "products"
            ? "Thêm Mã Hàng Mới Vào Database"
            : tab === "materials"
            ? "Thêm Hạt Nhựa Mới Vào Database"
            : "Thêm Quy Cách Thùng Mới Vào Database"
        }
      >
        {tab === "products" && (
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Mã Hàng</label>
                <input
                  type="text"
                  value={pCode}
                  onChange={(e) => setPCode(e.target.value)}
                  placeholder="VD: W165"
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tên Chi Tiết</label>
                <input
                  type="text"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  placeholder="VD: Nắp ốp vỏ điện tử W165"
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Hạt Nhựa</label>
                <select
                  value={pMatId}
                  onChange={(e) => setPMatId(e.target.value)}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                >
                  {materials?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} ({m.resin_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Quy Cách Thùng</label>
                <select
                  value={pBoxId}
                  onChange={(e) => setPBoxId(e.target.value)}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                >
                  {boxes?.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} ({b.pcs_per_box} pcs/thùng)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Cavity Khuôn</label>
                <input
                  type="number"
                  value={pCavity}
                  onChange={(e) => setPCavity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Chu Kỳ Ép (giây)</label>
                <input
                  type="number"
                  value={pCycle}
                  onChange={(e) => setPCycle(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  min={5}
                  required
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-factory-border">
              <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button variant="primary" type="submit" isLoading={upsertProductMutation.isPending}>Lưu Vào DB</Button>
            </div>
          </form>
        )}

        {tab === "materials" && (
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Mã Nhựa</label>
                <input
                  type="text"
                  value={matId}
                  onChange={(e) => setMatId(e.target.value)}
                  placeholder="VD: POM-M90"
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tên Hạt Nhựa</label>
                <input
                  type="text"
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  placeholder="VD: Nhựa POM Kỹ thuật"
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nhiệt Độ Sấy (°C)</label>
                <input
                  type="number"
                  value={matTemp}
                  onChange={(e) => setMatTemp(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Thời Gian Sấy (giờ)</label>
                <input
                  type="number"
                  step="0.5"
                  value={matHours}
                  onChange={(e) => setMatHours(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="dryCoatCheck"
                checked={isDryCoat}
                onChange={(e) => setIsDryCoat(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-factory-border"
              />
              <label htmlFor="dryCoatCheck" className="text-xs text-slate-300">
                Cờ yêu cầu sấy đặc biệt (青○ Dry-Coat)
              </label>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-factory-border">
              <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button variant="primary" type="submit" isLoading={upsertMaterialMutation.isPending}>Lưu Vào DB</Button>
            </div>
          </form>
        )}

        {tab === "boxes" && (
          <form onSubmit={handleAddBox} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Mã Bao Bì</label>
                <input
                  type="text"
                  value={bId}
                  onChange={(e) => setBId(e.target.value)}
                  placeholder="VD: THUNG-KLT-4314"
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tên Quy Cách Thùng</label>
                <input
                  type="text"
                  value={bName}
                  onChange={(e) => setBName(e.target.value)}
                  placeholder="VD: Thùng nhựa KLT tiêu chuẩn"
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Số Chi Tiết / Thùng</label>
                <input
                  type="number"
                  value={bPcs}
                  onChange={(e) => setBPcs(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  min={1}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Thời Gian Xuất Trước (giờ)</label>
                <input
                  type="number"
                  step="0.5"
                  value={bLead}
                  onChange={(e) => setBLead(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  required
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-factory-border">
              <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button variant="primary" type="submit" isLoading={upsertBoxMutation.isPending}>Lưu Vào DB</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
