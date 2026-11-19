import React, { useState } from "react";
import {
  useShippingOrdersQuery,
  useCreateShippingOrderMutation,
  useDeleteShippingOrderMutation,
} from "../api/ordersApi";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { Modal } from "@/shared/components/ui/Modal";
import { formatNumber, formatTimeHour } from "@/shared/utils/formatters";
import { Plus, Clock, Calendar, Trash2 } from "lucide-react";

export const ShippingOrdersView: React.FC = () => {
  const { data: orders, isLoading } = useShippingOrdersQuery();
  const createOrderMutation = useCreateShippingOrderMutation();
  const deleteOrderMutation = useDeleteShippingOrderMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [customer, setCustomer] = useState("Hikari Seimitsu");
  const [product, setProduct] = useState("W165");
  const [orderQty, setOrderQty] = useState(500);
  const [shipDate, setShipDate] = useState("2026-11-14");
  const [shipDeadlineHour, setShipDeadlineHour] = useState(17.0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrderMutation.mutateAsync({
      customer,
      product,
      order_qty: Number(orderQty),
      ship_date: shipDate,
      ship_deadline_hour: Number(shipDeadlineHour),
    });
    setIsModalOpen(false);
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn ${orderId} khỏi Database?`)) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Quản Lý Lệnh Xuất Hàng Khách Hàng (Shipping Orders)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Đầu vào bắt buộc cho thuật toán Lập lịch ngược JIT • Lưu trữ trực tiếp trong PostgreSQL/SQLite
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} />
          <span>Tạo Lệnh Xuất Mới</span>
        </Button>
      </div>

      {/* Orders Table */}
      <div className="bg-factory-card border border-factory-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-factory-panel border-b border-factory-border text-xs uppercase font-mono text-slate-400">
            <tr>
              <th className="px-5 py-3">Mã Đơn</th>
              <th className="px-5 py-3">Khách Hàng</th>
              <th className="px-5 py-3">Mã Hàng</th>
              <th className="px-5 py-3">Số Lượng Đặt</th>
              <th className="px-5 py-3">Ngày Xuất Hàng</th>
              <th className="px-5 py-3">Hạn Giao Hàng</th>
              <th className="px-5 py-3">Bao Bì</th>
              <th className="px-5 py-3">Trạng Thái</th>
              <th className="px-5 py-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-factory-border">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
                  Đang tải danh sách lệnh xuất từ Database...
                </td>
              </tr>
            ) : orders?.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
                  Chưa có lệnh xuất hàng nào trong Database.
                </td>
              </tr>
            ) : (
              orders?.map((ord) => (
                <tr key={ord.order_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-blue-400">{ord.order_id}</td>
                  <td className="px-5 py-3.5 font-medium text-white">{ord.customer}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-200">{ord.product}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">
                    {formatNumber(ord.order_qty)} pcs
                  </td>
                  <td className="px-5 py-3.5 text-slate-300 flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-500" />
                    <span>{ord.ship_date}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-amber-400">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {formatTimeHour(ord.ship_deadline_hour)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {ord.required_boxes ? `${ord.required_boxes} thùng` : "-"}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="success">JIT TIẾP NHẬN</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(ord.order_id)}
                      disabled={deleteOrderMutation.isPending}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Xóa đơn hàng khỏi Database"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tạo Lệnh Mới */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo Lệnh Xuất Hàng Mới Vào Database">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Khách hàng
            </label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Mã hàng (Product Code)
              </label>
              <input
                type="text"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Số lượng đặt (pcs)
              </label>
              <input
                type="number"
                value={orderQty}
                onChange={(e) => setOrderQty(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                required
                min={1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Ngày xuất hàng
              </label>
              <input
                type="date"
                value={shipDate}
                onChange={(e) => setShipDate(e.target.value)}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Giờ hạn chót giao hàng
              </label>
              <input
                type="number"
                step="0.5"
                min="7"
                max="31"
                value={shipDeadlineHour}
                onChange={(e) => setShipDeadlineHour(Number(e.target.value))}
                className="w-full bg-slate-900 border border-factory-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-factory-border">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit" isLoading={createOrderMutation.isPending}>
              Lưu Vào Database
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
