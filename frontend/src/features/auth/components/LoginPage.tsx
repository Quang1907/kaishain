import React, { useState } from "react";
import { useAppStore } from "@/app/store/useAppStore";
import { authApi } from "../api/authApi";
import {
  Shield,
  Wrench,
  Wheat,
  User,
  Lock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

const DEMO_ROLES = [
  {
    role: "admin",
    username: "admin",
    password: "admin123",
    label: "Quản Lý Xưởng (Admin)",
    name: "Kawabata (川端)",
    targetUrl: "/admin",
    desc: "Toàn quyền điều hành: Lập lịch 24H, 22 máy ép, BOM, lệnh xuất hàng JIT & quản trị hệ thống.",
    icon: Shield,
    color: "from-blue-600 to-indigo-600 border-blue-500/40 text-blue-400",
  },
  {
    role: "technician",
    username: "thomay",
    password: "tech123",
    label: "Thợ Máy (Kỹ thuật thay khuôn)",
    name: "Miyaji (宮地)",
    targetUrl: "/technician",
    desc: "Chuyên môn thay khuôn (○ 型替): Kiểm tra 4 bước an toàn khuôn & ký nghiệm thu bàn giao máy.",
    icon: Wrench,
    color: "from-amber-600 to-orange-600 border-amber-500/40 text-amber-400",
  },
  {
    role: "material_manager",
    username: "nguyenlieu",
    password: "mat123",
    label: "Quản Lý Nguyên Liệu & Sấy",
    name: "Edison (エジソン)",
    targetUrl: "/material",
    desc: "Giám sát sấy nhựa (80°C - 140°C), nhận diện Dry Coat (青○), chuẩn bị thùng & ký cấp liệu.",
    icon: Wheat,
    color: "from-emerald-600 to-teal-600 border-emerald-500/40 text-emerald-400",
  },
  {
    role: "user",
    username: "congnhan",
    password: "user123",
    label: "Nhân Viên Đứng Máy",
    name: "Chí (チー)",
    targetUrl: "/operator",
    desc: "Vận hành máy (15号機 / W165), kiểm tra 3 chân kiềng, báo cáo sản lượng đạt và phế phẩm.",
    icon: User,
    color: "from-purple-600 to-pink-600 border-purple-500/40 text-purple-400",
  },
];

interface LoginPageProps {
  onNavigateUrl: (url: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateUrl }) => {
  const { setCurrentUser } = useAppStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const performLogin = async (u: string, p: string, defaultTargetUrl?: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.login(u, p);
      if (res.status === "success" && res.token && res.user) {
        localStorage.setItem("aps_token", res.token);
        setCurrentUser(res.user, res.permissions);

        // Xác định URL đích tương ứng với vai trò
        let targetUrl = defaultTargetUrl;
        if (!targetUrl) {
          switch (res.user.role) {
            case "admin":
              targetUrl = "/admin";
              break;
            case "technician":
              targetUrl = "/technician";
              break;
            case "material_manager":
              targetUrl = "/material";
              break;
            case "user":
              targetUrl = "/operator";
              break;
            default:
              targetUrl = "/operator";
          }
        }

        setSuccessMsg(`Đăng nhập thành công! Đang chuyển hướng tới ${targetUrl}...`);
        setTimeout(() => {
          onNavigateUrl(targetUrl!);
        }, 500);
      } else {
        setError(res.message || "Tài khoản hoặc mật khẩu không chính xác.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Lỗi kết nối máy chủ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu!");
      return;
    }
    performLogin(username, password);
  };

  const handleQuickLogin = (roleItem: typeof DEMO_ROLES[0]) => {
    setUsername(roleItem.username);
    setPassword(roleItem.password);
    performLogin(roleItem.username, roleItem.password, roleItem.targetUrl);
  };

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col justify-center items-center p-3 sm:p-6 selection:bg-blue-600 selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] left-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-[20%] right-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="w-full max-w-4xl relative z-10 space-y-6 sm:space-y-8 my-4 sm:my-8">
        {/* Nút quay lại Lịch Trình Trang Chủ */}
        <div className="flex justify-start">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onNavigateUrl("/")}
            className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10 flex items-center gap-1.5 shadow-md text-xs py-1.5 px-2.5 sm:px-3"
          >
            <ArrowLeft size={13} />
            <CalendarDays size={13} />
            <span>Quay Lại Lịch Xưởng <span className="hidden sm:inline">(Trang Chủ)</span></span>
          </Button>
        </div>

        {/* Branding & Header */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
            <Cpu size={13} />
            <span>APS BRAIN 2.0 • POSTGRESQL 18</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide font-sans">
            ĐIỀU HÀNH &amp; PHÂN QUYỀN NHÀ MÁY ÉP NHỰA
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto px-2">
            Giao diện phân chia độc lập theo từng vai trò nghiệp vụ với đường dẫn (URL) và bảo mật chuyên biệt.
          </p>
        </div>

        {/* 4 One-Click Role Portals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5 text-cyan-400 text-[11px] sm:text-xs">
              <UserCheck size={14} />
              Cổng vai trò (1-Chạm):
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500">Chuyển URL riêng</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
            {DEMO_ROLES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickLogin(item)}
                  disabled={loading}
                  className="flex flex-col text-left p-4 rounded-2xl bg-factory-card/80 border border-factory-border/80 hover:border-blue-500/60 hover:bg-slate-800/80 transition-all group relative shadow-lg hover:shadow-blue-500/5 overflow-hidden"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-md`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          {item.name}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.targetUrl}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-factory-border/40 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>user: <strong className="text-slate-300">{item.username}</strong></span>
                    <span className="flex items-center gap-1 text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Truy cập cổng <ArrowRight size={12} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="h-px bg-factory-border/80 flex-1" />
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
            Hoặc đăng nhập thủ công
          </span>
          <div className="h-px bg-factory-border/80 flex-1" />
        </div>

        {/* Manual Login Card */}
        <div className="max-w-md mx-auto w-full p-6 rounded-2xl bg-factory-panel/90 border border-factory-border/90 shadow-2xl">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
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
                  placeholder="admin, thomay, nguyenlieu, congnhan"
                  className="w-full px-3.5 py-2 pl-9 bg-factory-bg border border-factory-border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
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
                  className="w-full px-3.5 py-2 pl-9 bg-factory-bg border border-factory-border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 py-2.5"
            >
              Đăng Nhập Vào Cổng Phân Quyền
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
