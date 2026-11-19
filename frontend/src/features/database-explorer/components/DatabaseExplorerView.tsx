import React from "react";
import { useDbStatsQuery, useFeedbackLogsQuery, useResetDbMutation } from "../api/dbApi";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { formatFileSize, formatNumber } from "@/shared/utils/formatters";
import { Database, Download, RotateCcw, Brain, ShieldCheck } from "lucide-react";

export const DatabaseExplorerView: React.FC = () => {
  const { data: stats, isLoading: loadingStats } = useDbStatsQuery();
  const { data: feedbackLogs, isLoading: loadingLogs } = useFeedbackLogsQuery();
  const resetDbMutation = useResetDbMutation();

  const handleExport = () => {
    window.open("/api/db/download", "_blank");
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn nạp lại dữ liệu gốc ban đầu vào SQLite?")) {
      resetDbMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Cơ Sở Dữ Liệu Chuyên Dụng (SQLite Enterprise & Feedback AI)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chế độ WAL (Write-Ahead Logging) • Ràng buộc toàn vẹn Foreign Keys ON • Học máy phế phẩm
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExport} className="gap-2">
            <Download size={14} />
            <span>Tải File .db Sao Lưu</span>
          </Button>
          <Button
            variant="danger"
            onClick={handleReset}
            isLoading={resetDbMutation.isPending}
            className="gap-2"
          >
            <RotateCcw size={14} />
            <span>Nạp Lại Dữ Liệu Gốc</span>
          </Button>
        </div>
      </div>

      {/* Database Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Dung lượng Database</span>
            <Database size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">
            {loadingStats ? "..." : formatFileSize(stats?.file_size_kb)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats?.database_name || "factory_aps.db"}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Trạng thái WAL</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
            {stats?.wal_mode ? "ACTIVE" : "ON"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Hỗ trợ đọc/ghi đồng thời cực cao</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Động cơ Cơ sở dữ liệu</span>
            <Database size={16} className="text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-2">
            {stats?.db_type || "SQLite 3 Fallback"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats?.server_version || "SQLite 3.54"}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Bộ Não Tự Học Phế Phẩm</span>
            <Brain size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
            {feedbackLogs?.length || 0} Nhật Ký
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tự động bù đệm an toàn JIT</div>
        </Card>
      </div>

      {/* 10 Tables Summary */}
      {stats?.table_counts && (
        <Card>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
            Thống Kê Các Bảng Trong Cơ Sở Dữ Liệu ({Object.keys(stats.table_counts).length} Tables)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(stats.table_counts).map(([tableName, count]) => (
              <div
                key={tableName}
                className="p-3 bg-factory-bg rounded-lg border border-factory-border text-center"
              >
                <div className="text-xs text-slate-400 font-mono truncate">{tableName}</div>
                <div className="text-lg font-bold font-mono text-white mt-1">
                  {formatNumber(count)}
                </div>
                <div className="text-[10px] text-slate-500">dòng dữ liệu</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Feedback Logs */}
      <div className="bg-factory-card border border-factory-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-factory-border flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Brain size={16} className="text-amber-400" />
            <span>Nhật Ký Học Máy & Cập Nhật Đệm An Toàn (Learning Logs)</span>
          </h3>
          <Badge variant="warning">TỰ ĐỘNG LẬP LỊCH BÙ</Badge>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-factory-panel border-b border-factory-border text-xs uppercase font-mono text-slate-400">
            <tr>
              <th className="px-5 py-3">Mã Hàng</th>
              <th className="px-5 py-3">Máy Ép</th>
              <th className="px-5 py-3">Phế Phẩm Báo Cáo</th>
              <th className="px-5 py-3">Đệm An Toàn Mới</th>
              <th className="px-5 py-3">Thời Điểm Cập Nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-factory-border">
            {loadingLogs ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-500">
                  Đang tải nhật ký...
                </td>
              </tr>
            ) : feedbackLogs?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-500">
                  Chưa có báo cáo học máy nào được ghi nhận.
                </td>
              </tr>
            ) : (
              feedbackLogs?.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="px-5 py-3 font-mono font-bold text-blue-400">{log.product_code}</td>
                  <td className="px-5 py-3 font-mono text-white">Máy #{log.machine_id}</td>
                  <td className="px-5 py-3 font-mono text-rose-400 font-semibold">{log.scraps} cái</td>
                  <td className="px-5 py-3 font-mono text-emerald-400 font-semibold">
                    +{(log.buffer_pct * 100).toFixed(1)}%
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">{log.logged_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
