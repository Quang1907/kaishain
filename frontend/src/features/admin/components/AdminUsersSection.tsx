import React from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/authApi";
import { Card } from "@/shared/components/ui/Card";
import { Badge } from "@/shared/components/ui/Badge";
import { Shield, Clock, CheckCircle2 } from "lucide-react";

export const AdminUsersSection: React.FC = () => {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => authApi.getAllUsers(),
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">👑 Quản Lý (Admin)</Badge>;
      case "technician":
        return <Badge variant="warning">🔧 Thợ Máy Thay Khuôn</Badge>;
      case "material_manager":
        return <Badge variant="success">🌾 Quản Lý Nguyên Liệu</Badge>;
      case "user":
        return <Badge variant="info">👤 Nhân Viên Đứng Máy</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="text-blue-400 w-5 h-5" />
            Quản Trị Người Dùng & Ma Trận Phân Quyền (RBAC)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            4 vai trò phân quyền chuyên biệt được định nghĩa trong PostgreSQL Server
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Tổng số tài khoản: <strong className="text-white">{users.length}</strong>
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="py-12 flex justify-center text-slate-400 gap-3">
            <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <span>Đang tải danh sách tài khoản...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-factory-border/60 text-slate-400 uppercase font-semibold text-[11px] bg-factory-card/50">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Tài Khoản</th>
                  <th className="py-3 px-4">Họ & Tên</th>
                  <th className="py-3 px-4">Vai Trò Phân Quyền</th>
                  <th className="py-3 px-4">Phân Bổ Công Việc / Máy</th>
                  <th className="py-3 px-4">Đăng Nhập Cuối</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-factory-border/30">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">{u.id}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <span className="text-base">{u.avatar_url || "👤"}</span>
                      <span>@{u.username}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{u.full_name}</td>
                    <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                      {u.assigned_machine_or_task || "Toàn quyền"}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {u.last_login ? (
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-blue-400" />
                          {new Date(u.last_login).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Chưa đăng nhập</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 size={11} /> Hoạt động
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
