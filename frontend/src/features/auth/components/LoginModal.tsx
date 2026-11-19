import React, { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { useAppStore } from "@/app/store/useAppStore";
import { authApi } from "../api/authApi";
import { Lock, UserCheck, Shield, Wrench, Wheat, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

const DEMO_ACCOUNTS = [
  {
    role: "admin",
    username: "admin",
    password: "admin123",
    label: "Quản Lý Xưởng (Admin)",
    name: "Kawabata (川端)",
    desc: "Toàn quyền: Lập lịch AI, quản lý 22 máy, lệnh xuất hàng & cấu hình hệ thống.",
    icon: Shield,
    color: "from-blue-600 to-indigo-600 border-blue-500/40 text-blue-400",
  },
  {
    role: "technician",
    username: "thomay",
    password: "tech123",
    label: "Thợ Máy (Kỹ thuật thay khuôn)",
    name: "Miyaji (宮地)",
    desc: "Chuyên môn: Tiếp nhận lệnh thay khuôn (○ 型替), kiểm tra an toàn 4 bước & ký nghiệm thu.",
    icon: Wrench,
    color: "from-amber-600 to-orange-600 border-amber-500/40 text-amber-400",
  },
  {
    role: "material_manager",
    username: "nguyenlieu",
    password: "mat123",
    label: "Quản Lý Nguyên Liệu & Sấy",
    name: "Edison (エジソン)",
    desc: "Chuyên môn: Giám sát phễu sấy hạt nhựa, kiểm soát Dry Coat (青○), chuẩn bị thùng bao bì.",
    icon: Wheat,
    color: "from-emerald-600 to-teal-600 border-emerald-500/40 text-emerald-400",
  },
  {
    role: "user",
    username: "congnhan",
    password: "user123",
    label: "Nhân Viên Đứng Máy",
    name: "Chí (チー)",
    desc: "Vận hành: Đứng theo con hàng (W165 / 15号機), nhập báo cáo sản lượng đạt và phế phẩm.",
    icon: User,
    color: "from-purple-600 to-pink-600 border-purple-500/40 text-purple-400",
  },
];

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, setCurrentUser } = useAppStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (u: string, p: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login(u, p);
      if (res.status === "success" && res.token && res.user) {
        localStorage.setItem("aps_token", res.token);
        setCurrentUser(res.user, res.permissions);
        setSuccessMsg(`Đăng nhập thành công với vai trò: ${res.user.full_name}!`);
        setTimeout(() => {
          setLoginModalOpen(false);
          setSuccessMsg(null);
        }, 600);
      } else {
        setError(res.message || "Tài khoản hoặc mật khẩu không chính xác.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Lỗi máy chủ khi đăng nhập. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!");
      return;
    }
    handleLogin(username, password);
  };

  const selectDemoAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setUsername(acc.username);
    setPassword(acc.password);
    handleLogin(acc.username, acc.password);
  };

  return (
    <Modal
      isOpen={isLoginModalOpen}
      onClose={() => setLoginModalOpen(false)}
      title="ĐĂNG NHẬP & PHÂN QUYỀN HỆ THỐNG"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Banner giới thiệu phân quyền */}
        <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-xs text-blue-300 flex items-start gap-2.5">
          <Shield className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-200">
              Hệ Thống Phân Quyền 4 Cấp Độ Chuyên Biệt Theo Thực Tế Xưởng Ép Nhựa Nhật Bản:
            </p>
            <p className="text-slate-400 mt-0.5">
              Chọn nhanh 1 trong 4 vai trò bên dưới để kiểm thử giao diện điều hành tương ứng, hoặc nhập tài khoản thủ công.
            </p>
          </div>
        </div>

        {/* Demo Fast Logins Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <UserCheck size={14} className="text-cyan-400" />
            Đăng nhập nhanh 1 chạm (Demo Roles):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => selectDemoAccount(acc)}
                  disabled={loading}
                  className="flex flex-col text-left p-3 rounded-xl bg-factory-card/90 border border-factory-border/80 hover:border-blue-500/60 hover:bg-slate-800/80 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${acc.color} flex items-center justify-center text-white shadow`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {acc.label}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {acc.name}
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {acc.desc}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between border-t border-factory-border/40 pt-1.5">
                    <span>user: <strong className="text-slate-300">{acc.username}</strong></span>
                    <span>pass: <strong className="text-slate-300">{acc.password}</strong></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-factory-border/60 flex-1" />
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Hoặc nhập tài khoản
          </span>
          <div className="h-px bg-factory-border/60 flex-1" />
        </div>

        {/* Manual Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Tên đăng nhập</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: admin, thomay, nguyenlieu, congnhan"
                className="w-full px-3.5 py-2 pl-9 bg-factory-bg border border-factory-border rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <User size={15} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Mật khẩu</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full px-3.5 py-2 pl-9 bg-factory-bg border border-factory-border rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setLoginModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="px-6"
            >
              Đăng Nhập
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

