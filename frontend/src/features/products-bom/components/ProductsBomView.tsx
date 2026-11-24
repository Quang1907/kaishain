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
import { ProductDetail, Material, Box } from "@/core/types/factory-common.types";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Modal } from "@/shared/components/ui/Modal";
import {
  Package,
  Flame,
  Layers,
  Plus,
  Trash2,
  Pencil,
  Search,
  CheckCircle2,
  Lock,
} from "lucide-react";

export const ProductsBomView: React.FC = () => {
  const [tab, setTab] = useState<"products" | "materials" | "boxes">("products");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading: loadingProducts } = useProductsQuery();
  const { data: materials, isLoading: loadingMaterials } = useMaterialsQuery();
  const { data: boxes, isLoading: loadingBoxes } = useBoxesQuery();

  const upsertProductMutation = useUpsertProductMutation();
  const deleteProductMutation = useDeleteProductMutation();
  const upsertMaterialMutation = useUpsertMaterialMutation();
  const deleteMaterialMutation = useDeleteMaterialMutation();
  const upsertBoxMutation = useUpsertBoxMutation();
  const deleteBoxMutation = useDeleteBoxMutation();

  // Modal State Thêm Mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State Thêm Mới Products
  const [pCode, setPCode] = useState("");
  const [pName, setPName] = useState("");
  const [pMatId, setPMatId] = useState("");
  const [pBoxId, setPBoxId] = useState("");
  const [pCycle, setPCycle] = useState(30);
  const [pCavity, setPCavity] = useState(2);
  const [pPreferredMode, setPPreferredMode] = useState<"BY_MACHINE" | "BY_PRODUCT">("BY_MACHINE");
  const [pDefectBuffer, setPDefectBuffer] = useState(3.0);

  // Modal & Form State Chỉnh Sửa Product (Update CRUD)
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [editPCode, setEditPCode] = useState("");
  const [editPName, setEditPName] = useState("");
  const [editPMatId, setEditPMatId] = useState("");
  const [editPBoxId, setEditPBoxId] = useState("");
  const [editPCavity, setEditPCavity] = useState(1);
  const [editPCycle, setEditPCycle] = useState(30);
  const [editPMode, setEditPMode] = useState<"BY_MACHINE" | "BY_PRODUCT">("BY_MACHINE");
  const [editPDefectBuffer, setEditPDefectBuffer] = useState(3.0);

  // Modal & Form State Thêm Mới / Chỉnh Sửa Materials
  const [matId, setMatId] = useState("");
  const [matName, setMatName] = useState("");
  const [matTemp, setMatTemp] = useState(80);
  const [matHours, setMatHours] = useState(3.0);
  const [isDryCoat, setIsDryCoat] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Modal & Form State Thêm Mới / Chỉnh Sửa Boxes
  const [bId, setBId] = useState("");
  const [bName, setBName] = useState("");
  const [bPcs, setBPcs] = useState(100);
  const [bLead, setBLead] = useState(1.0);
  const [editingBox, setEditingBox] = useState<Box | null>(null);

  // --- Handlers Thêm Mới ---
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertProductMutation.mutateAsync({
      code: pCode.trim(),
      name: pName.trim(),
      material_id: pMatId || materials?.[0]?.id || "ABS-750",
      box_id: pBoxId || boxes?.[0]?.id || "THUNG-KLT-4314",
      cycle_time_sec: Number(pCycle),
      cavity: Number(pCavity),
      preferred_mode: pPreferredMode,
      defect_buffer_pct: Number(pDefectBuffer),
      compatible_machines: [],
    });
    setIsAddModalOpen(false);
    setPCode("");
    setPName("");
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertMaterialMutation.mutateAsync({
      id: matId.trim(),
      resin_name: matName.trim(),
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
      id: bId.trim(),
      box_name: bName.trim(),
      pcs_per_box: Number(bPcs),
      staging_lead_hours: Number(bLead),
    });
    setIsAddModalOpen(false);
    setBId("");
    setBName("");
  };

  // --- Handlers Mở Modal Sửa (Edit) ---
  const handleOpenEditProduct = (p: ProductDetail) => {
    setEditingProduct(p);
    setEditPCode(p.code);
    setEditPName(p.name || "");
    setEditPMatId(p.material?.resin_id || materials?.[0]?.id || "ABS-750");
    setEditPBoxId(p.box?.box_id || boxes?.[0]?.id || "THUNG-KLT-4314");
    setEditPCavity(p.cavity || 1);
    setEditPCycle(p.cycle_time_sec || p.cycle_time || 30);
    setEditPMode(p.preferred_mode === "BY_PRODUCT" ? "BY_PRODUCT" : "BY_MACHINE");
    setEditPDefectBuffer(p.scrap_buffer_pct ?? 3.0);
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertProductMutation.mutateAsync({
      code: editPCode,
      name: editPName.trim(),
      material_id: editPMatId,
      box_id: editPBoxId,
      cavity: Number(editPCavity),
      cycle_time_sec: Number(editPCycle),
      preferred_mode: editPMode,
      defect_buffer_pct: Number(editPDefectBuffer),
      compatible_machines: editingProduct?.compatible_machines || [],
    });
    setEditingProduct(null);
  };

  const handleOpenEditMaterial = (m: Material) => {
    setEditingMaterial(m);
    setMatId(m.id);
    setMatName(m.resin_name);
    setMatTemp(m.dry_temp_celsius);
    setMatHours(m.dry_time_hours);
    setIsDryCoat(Boolean(m.is_dry_coat));
  };

  const handleSaveEditMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertMaterialMutation.mutateAsync({
      id: matId,
      resin_name: matName.trim(),
      dry_temp_celsius: Number(matTemp),
      dry_time_hours: Number(matHours),
      is_dry_coat: isDryCoat,
    });
    setEditingMaterial(null);
  };

  const handleOpenEditBox = (b: Box) => {
    setEditingBox(b);
    setBId(b.id);
    setBName(b.box_name);
    setBPcs(b.pcs_per_box);
    setBLead(b.staging_lead_hours);
  };

  const handleSaveEditBox = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertBoxMutation.mutateAsync({
      id: bId,
      box_name: bName.trim(),
      pcs_per_box: Number(bPcs),
      staging_lead_hours: Number(bLead),
    });
    setEditingBox(null);
  };

  // --- Lọc Tìm Kiếm ---
  const filteredProducts = products?.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.code.toLowerCase().includes(q) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.material?.resin_id && p.material.resin_id.toLowerCase().includes(q)) ||
      (p.box?.box_id && p.box.box_id.toLowerCase().includes(q))
    );
  });

  const filteredMaterials = materials?.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.id.toLowerCase().includes(q) || m.resin_name.toLowerCase().includes(q);
  });

  const filteredBoxes = boxes?.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return b.id.toLowerCase().includes(q) || b.box_name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <span>Định Mức BOM, Mã Hàng & Quy Cách Bao Bì</span>
            <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
              CRUD DATABASE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản trị trực tiếp Database PostgreSQL/SQLite • Hỗ trợ đầy đủ Thêm, Xem, Sửa (Update) và Xóa (Delete)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sub-tabs */}
          <div className="flex bg-factory-card border border-factory-border rounded-lg p-1 text-xs">
            <button
              onClick={() => {
                setTab("products");
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                tab === "products"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers size={14} />
              Mã Hàng ({products?.length || 0})
            </button>
            <button
              onClick={() => {
                setTab("materials");
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                tab === "materials"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Flame size={14} />
              Hạt Nhựa ({materials?.length || 0})
            </button>
            <button
              onClick={() => {
                setTab("boxes");
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                tab === "boxes"
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Package size={14} />
              Thùng ({boxes?.length || 0})
            </button>
          </div>

          {/* Button Thêm Mới */}
          <Button
            onClick={() => {
              if (tab === "products") {
                setPMatId(materials?.[0]?.id || "ABS-750");
                setPBoxId(boxes?.[0]?.id || "THUNG-KLT-4314");
              }
              setIsAddModalOpen(true);
            }}
            className="gap-1.5 h-8 font-medium"
          >
            <Plus size={15} />
            <span>
              {tab === "products" && "Thêm Mã Hàng Mới"}
              {tab === "materials" && "Thêm Loại Nhựa"}
              {tab === "boxes" && "Thêm Loại Thùng"}
            </span>
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-factory-card border border-factory-border rounded-xl px-4 py-2.5">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              tab === "products"
                ? "Tìm mã hàng (code), tên chi tiết, mã nhựa..."
                : tab === "materials"
                ? "Tìm mã nhựa, tên hạt nhựa..."
                : "Tìm mã thùng, tên quy cách bao bì..."
            }
            className="w-full bg-slate-900/80 border border-factory-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Hiển thị:{" "}
          <strong className="text-white">
            {tab === "products"
              ? filteredProducts?.length || 0
              : tab === "materials"
              ? filteredMaterials?.length || 0
              : filteredBoxes?.length || 0}
          </strong>{" "}
          bản ghi
        </div>
      </div>

      {/* TAB 1: PRODUCTS (MÃ HÀNG - FULL CRUD) */}
      {tab === "products" && (
        <div className="bg-factory-card border border-factory-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-factory-panel border-b border-factory-border text-xs uppercase font-mono text-slate-400">
                <tr>
                  <th className="px-5 py-3">Mã Hàng</th>
                  <th className="px-5 py-3">Tên Chi Tiết Sản Phẩm</th>
                  <th className="px-5 py-3">Hạt Nhựa (Material)</th>
                  <th className="px-5 py-3">Quy Cách Thùng (Box)</th>
                  <th className="px-5 py-3 text-center">Cavity</th>
                  <th className="px-5 py-3 text-center">Chu Kỳ (s)</th>
                  <th className="px-5 py-3">Chế Độ Đứng Máy</th>
                  <th className="px-5 py-3 text-right">Thao Tác (Sửa / Xóa)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-factory-border">
                {loadingProducts ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                      Đang tải danh mục mã hàng từ Database...
                    </td>
                  </tr>
                ) : filteredProducts?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                      Không tìm thấy mã hàng nào phù hợp với từ khóa "{searchQuery}"
                    </td>
                  </tr>
                ) : (
                  filteredProducts?.map((p) => (
                    <tr key={p.code} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-400">
                        {p.code}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-white">{p.name}</td>
                      <td className="px-5 py-3.5 font-mono text-xs">
                        <span className="text-amber-300 font-semibold">
                          {p.material?.resin_id || "PA6"}
                        </span>
                        {p.material?.name && (
                          <span className="text-slate-400 block text-[11px]">
                            {p.material.name}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs">
                        <span className="text-purple-300 font-semibold">
                          {p.box?.box_id || "KLT-4314"}
                        </span>
                        <span className="text-slate-400 block text-[11px]">
                          ({p.box?.pcs_per_box || 100} pcs/thùng)
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-center text-slate-300 font-semibold">
                        {p.cavity || 1}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-center text-emerald-400 font-semibold">
                        {p.cycle_time_sec || p.cycle_time || 30}s
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={p.preferred_mode === "BY_PRODUCT" ? "warning" : "info"}>
                          {p.preferred_mode === "BY_PRODUCT" ? "Theo Con Hàng" : "Theo Máy Tự Động"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Sửa (Edit) */}
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors border border-transparent hover:border-amber-500/30"
                            title={`Chỉnh sửa mã hàng ${p.code}`}
                          >
                            <Pencil size={15} />
                          </button>
                          {/* Nút Xóa (Delete) */}
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Bạn có chắc chắn muốn xóa vĩnh viễn mã hàng [${p.code} - ${p.name}] khỏi Database?`
                                )
                              ) {
                                deleteProductMutation.mutate(p.code);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors border border-transparent hover:border-rose-500/30"
                            title={`Xóa mã hàng ${p.code}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MATERIALS (HẠT NHỰA) */}
      {tab === "materials" && (
        <div className="bg-factory-card border border-factory-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-factory-panel border-b border-factory-border text-xs uppercase font-mono text-slate-400">
                <tr>
                  <th className="px-5 py-3">Mã Nhựa</th>
                  <th className="px-5 py-3">Tên Hạt Nhựa</th>
                  <th className="px-5 py-3">Nhiệt Độ Sấy (°C)</th>
                  <th className="px-5 py-3">Thời Gian Sấy Tối Thiểu</th>
                  <th className="px-5 py-3">Cờ Dry-Coat (青○)</th>
                  <th className="px-5 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-factory-border">
                {loadingMaterials ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      Đang tải danh mục hạt nhựa từ Database...
                    </td>
                  </tr>
                ) : filteredMaterials?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      Không tìm thấy loại nhựa nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredMaterials?.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-amber-400">{m.id}</td>
                      <td className="px-5 py-3.5 font-medium text-white">{m.resin_name}</td>
                      <td className="px-5 py-3.5 font-mono text-emerald-400 font-semibold">
                        {m.dry_temp_celsius}°C
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-300">
                        {m.dry_time_hours} giờ
                      </td>
                      <td className="px-5 py-3.5">
                        {m.is_dry_coat ? (
                          <Badge
                            variant="info"
                            className="bg-cyan-950/70 text-cyan-300 border-cyan-500/40"
                          >
                            青○ Có yêu cầu đặc biệt
                          </Badge>
                        ) : (
                          <span className="text-slate-500 text-xs">Chuẩn</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditMaterial(m)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors"
                            title={`Chỉnh sửa hạt nhựa ${m.id}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Xóa hạt nhựa ${m.id} khỏi Database?`)) {
                                deleteMaterialMutation.mutate(m.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Xóa hạt nhựa"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BOXES (THÙNG BAO BÌ) */}
      {tab === "boxes" && (
        <div className="bg-factory-card border border-factory-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-factory-panel border-b border-factory-border text-xs uppercase font-mono text-slate-400">
                <tr>
                  <th className="px-5 py-3">Mã Bao Bì</th>
                  <th className="px-5 py-3">Quy Cách Thùng</th>
                  <th className="px-5 py-3">Số Chi Tiết / Thùng</th>
                  <th className="px-5 py-3">Thời Gian Xuất Trước (Lead Time)</th>
                  <th className="px-5 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-factory-border">
                {loadingBoxes ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                      Đang tải quy cách thùng từ Database...
                    </td>
                  </tr>
                ) : filteredBoxes?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                      Không tìm thấy quy cách thùng nào phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredBoxes?.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-purple-400">{b.id}</td>
                      <td className="px-5 py-3.5 font-medium text-white">{b.box_name}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">
                        {b.pcs_per_box} cái/thùng
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-300">
                        {b.staging_lead_hours} giờ trước giờ ép
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditBox(b)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-950/40 transition-colors"
                            title={`Chỉnh sửa thùng ${b.id}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Xóa quy cách thùng ${b.id} khỏi Database?`)) {
                                deleteBoxMutation.mutate(b.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="Xóa thùng"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL THÊM MỚI (CREATE)                                 */}
      {/* ======================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={
          tab === "products"
            ? "+ Thêm Mã Hàng Mới Vào Database"
            : tab === "materials"
            ? "+ Thêm Hạt Nhựa Mới Vào Database"
            : "+ Thêm Quy Cách Thùng Mới Vào Database"
        }
      >
        {tab === "products" && (
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Mã Hàng (Code)
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Tên Chi Tiết Sản Phẩm
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Loại Hạt Nhựa (Material)
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Quy Cách Thùng Đóng Gói
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Số Cavity Khuôn
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Chu Kỳ Ép (giây / shot)
                </label>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Chế Độ Đứng Máy
                </label>
                <select
                  value={pPreferredMode}
                  onChange={(e) =>
                    setPPreferredMode(e.target.value as "BY_MACHINE" | "BY_PRODUCT")
                  }
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                >
                  <option value="BY_MACHINE">Theo Máy Tự Động (BY_MACHINE)</option>
                  <option value="BY_PRODUCT">Đứng Theo Con Hàng (BY_PRODUCT)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Tỷ Lệ Phế Phẩm Dự Phòng (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={pDefectBuffer}
                  onChange={(e) => setPDefectBuffer(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  min={0}
                  max={20}
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-3 border-t border-factory-border">
              <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
                Hủy
              </Button>
              <Button variant="primary" type="submit" isLoading={upsertProductMutation.isPending}>
                + Thêm Vào Database
              </Button>
            </div>
          </form>
        )}

        {tab === "materials" && (
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Mã Nhựa
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Tên Hạt Nhựa
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Nhiệt Độ Sấy (°C)
                </label>
                <input
                  type="number"
                  value={matTemp}
                  onChange={(e) => setMatTemp(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Thời Gian Sấy (giờ)
                </label>
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
              <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
                Hủy
              </Button>
              <Button variant="primary" type="submit" isLoading={upsertMaterialMutation.isPending}>
                + Thêm Vào Database
              </Button>
            </div>
          </form>
        )}

        {tab === "boxes" && (
          <form onSubmit={handleAddBox} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Mã Bao Bì
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Tên Quy Cách Thùng
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Số Chi Tiết / Thùng
                </label>
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
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Thời Gian Xuất Trước (giờ)
                </label>
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
              <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
                Hủy
              </Button>
              <Button variant="primary" type="submit" isLoading={upsertBoxMutation.isPending}>
                + Thêm Vào Database
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL CHỈNH SỬA MÃ HÀNG (UPDATE CRUD)                   */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title={`Chỉnh Sửa Mã Hàng: [${editPCode}]`}
      >
        <form onSubmit={handleSaveEditProduct} className="space-y-4">
          <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-lg flex items-center gap-2.5 text-xs text-blue-300">
            <Lock size={15} className="text-blue-400 shrink-0" />
            <span>
              Mã hàng <strong>{editPCode}</strong> là khóa chính (Primary Key). Bạn có thể cập nhật
              tên, định mức BOM nhựa, thùng và tham số khuôn ép.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Mã Hàng (Code)
              </label>
              <input
                type="text"
                value={editPCode}
                disabled
                className="w-full bg-slate-950 border border-factory-border/60 rounded-lg px-3 py-2 text-sm text-slate-400 font-mono cursor-not-allowed opacity-80"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Tên Chi Tiết Sản Phẩm
              </label>
              <input
                type="text"
                value={editPName}
                onChange={(e) => setEditPName(e.target.value)}
                placeholder="VD: Chi tiết nắp đậy W165"
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Loại Hạt Nhựa (Material)
              </label>
              <select
                value={editPMatId}
                onChange={(e) => setEditPMatId(e.target.value)}
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
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Quy Cách Thùng Đóng Gói
              </label>
              <select
                value={editPBoxId}
                onChange={(e) => setEditPBoxId(e.target.value)}
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
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Số Cavity Khuôn
              </label>
              <input
                type="number"
                value={editPCavity}
                onChange={(e) => setEditPCavity(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                min={1}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Chu Kỳ Ép (giây / shot)
              </label>
              <input
                type="number"
                value={editPCycle}
                onChange={(e) => setEditPCycle(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                min={5}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Chế Độ Đứng Máy
              </label>
              <select
                value={editPMode}
                onChange={(e) =>
                  setEditPMode(e.target.value as "BY_MACHINE" | "BY_PRODUCT")
                }
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
              >
                <option value="BY_MACHINE">Theo Máy Tự Động (BY_MACHINE)</option>
                <option value="BY_PRODUCT">Đứng Theo Con Hàng (BY_PRODUCT)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Tỷ Lệ Phế Phẩm Dự Phòng (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={editPDefectBuffer}
                onChange={(e) => setEditPDefectBuffer(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                min={0}
                max={20}
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-factory-border">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setEditingProduct(null)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={upsertProductMutation.isPending}
              className="gap-1.5"
            >
              <CheckCircle2 size={15} />
              Cập Nhật Thay Đổi Vào Database
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL CHỈNH SỬA HẠT NHỰA (UPDATE CRUD)                  */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(editingMaterial)}
        onClose={() => setEditingMaterial(null)}
        title={`Chỉnh Sửa Loại Nhựa: [${matId}]`}
      >
        <form onSubmit={handleSaveEditMaterial} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Mã Nhựa
              </label>
              <input
                type="text"
                value={matId}
                disabled
                className="w-full bg-slate-950 border border-factory-border/60 rounded-lg px-3 py-2 text-sm text-slate-400 font-mono cursor-not-allowed opacity-80"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Tên Hạt Nhựa
              </label>
              <input
                type="text"
                value={matName}
                onChange={(e) => setMatName(e.target.value)}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Nhiệt Độ Sấy (°C)
              </label>
              <input
                type="number"
                value={matTemp}
                onChange={(e) => setMatTemp(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Thời Gian Sấy (giờ)
              </label>
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
              id="dryCoatCheckEdit"
              checked={isDryCoat}
              onChange={(e) => setIsDryCoat(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-factory-border"
            />
            <label htmlFor="dryCoatCheckEdit" className="text-xs text-slate-300">
              Cờ yêu cầu sấy đặc biệt (青○ Dry-Coat)
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-factory-border">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setEditingMaterial(null)}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={upsertMaterialMutation.isPending}
            >
              Cập Nhật Vào DB
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL CHỈNH SỬA THÙNG (UPDATE CRUD)                     */}
      {/* ======================================================== */}
      <Modal
        isOpen={Boolean(editingBox)}
        onClose={() => setEditingBox(null)}
        title={`Chỉnh Sửa Quy Cách Thùng: [${bId}]`}
      >
        <form onSubmit={handleSaveEditBox} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Mã Thùng
              </label>
              <input
                type="text"
                value={bId}
                disabled
                className="w-full bg-slate-950 border border-factory-border/60 rounded-lg px-3 py-2 text-sm text-slate-400 font-mono cursor-not-allowed opacity-80"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Tên Quy Cách Thùng
              </label>
              <input
                type="text"
                value={bName}
                onChange={(e) => setBName(e.target.value)}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Số Chi Tiết / Thùng
              </label>
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
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Thời Gian Xuất Trước (giờ)
              </label>
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
            <Button variant="secondary" type="button" onClick={() => setEditingBox(null)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" isLoading={upsertBoxMutation.isPending}>
              Cập Nhật Vào DB
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
