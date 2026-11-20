import React, { Suspense, lazy, useEffect, useState } from "react";
import { useAppStore } from "@/app/store/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/authApi";
import { useRouter } from "@/core/router/useRouter";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

// Lazy load role-specific portals (Code-splitting by bounded context)
const PublicSchedulePortal = lazy(() => import("@/features/public-schedule"));
const AdminPortal = lazy(() => import("@/features/admin"));
const TechnicianPortal = lazy(() => import("@/features/technician"));
const MaterialPortal = lazy(() => import("@/features/material"));
const OperatorPortal = lazy(() => import("@/features/operator-workstation"));
const LoginPage = lazy(() => import("@/features/auth/components/LoginPage"));

export const App: React.FC = () => {
  const { currentUser, setCurrentUser } = useAppStore();
  const { currentPath, navigate } = useRouter();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Khôi phục session từ token khi mở trang
  useEffect(() => {
    const token = localStorage.getItem("aps_token");
    if (token) {
      authApi
        .getMe()
        .then((res) => {
          if (res.status === "success" && res.user) {
            setCurrentUser(res.user, res.permissions);
          } else {
            localStorage.removeItem("aps_token");
          }
        })
        .catch(() => {
          localStorage.removeItem("aps_token");
        })
        .finally(() => {
          setAuthChecked(true);
        });
    } else {
      setAuthChecked(true);
    }
  }, [setCurrentUser]);

  const handleSyncDb = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Loading spinner khi đang kiểm tra phiên làm việc ban đầu
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center text-slate-400 gap-3">
        <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <span className="text-sm font-medium">Đang tải cấu hình bảo mật...</span>
      </div>
    );
  }

  // Component thông báo khi người dùng không có quyền truy cập URL tương ứng (403 Forbidden)
  const renderForbidden = (requiredRole: string, currentRole: string, allowedUrl: string) => (
    <div className="min-h-screen bg-[#080C14] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 rounded-2xl bg-factory-panel border border-red-500/30 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white uppercase">Truy Cập Bị Từ Chối (403)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Đường dẫn <strong className="text-red-400 font-mono">{currentPath}</strong> yêu cầu vai trò{" "}
            <strong className="text-white uppercase">{requiredRole}</strong>.
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Bạn hiện đang đăng nhập với vai trò: <strong className="text-slate-300 uppercase">{currentRole}</strong>
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="secondary" size="sm" onClick={() => navigate(allowedUrl)}>
            <ArrowLeft size={14} />
            Về Cổng Của Bạn ({allowedUrl})
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate("/login")}>
            <LogIn size={14} />
            Đổi Tài Khoản Khác
          </Button>
        </div>
      </div>
    </div>
  );

  // Điều hướng phân vùng theo URL và vai trò
  const renderRolePortal = () => {
    // 1. Trang Chủ (http://localhost:8080/): LỊCH TRÌNH TOÀN XƯỞNG
    // Hiển thị công khai kể cả khi CHƯA ĐĂNG NHẬP, hoặc khi đã đăng nhập ghé thăm
    if (currentPath === "/" || currentPath === "") {
      return (
        <PublicSchedulePortal
          onNavigateUrl={navigate}
          onRefresh={handleSyncDb}
          isRefreshing={isRefreshing}
        />
      );
    }

    // 2. Cổng Đăng Nhập (/login)
    if (currentPath === "/login") {
      return <LoginPage onNavigateUrl={navigate} />;
    }

    // Yêu cầu đăng nhập đối với tất cả các cổng cá nhân nghiệp vụ
    if (!currentUser) {
      return <LoginPage onNavigateUrl={navigate} />;
    }

    // 3. Cổng Quản Lý (/admin, /admin/*) - TUYỆT ĐỐI KHÔNG CÓ LỊCH TRÌNH
    if (currentPath.startsWith("/admin")) {
      if (currentUser.role === "admin") {
        return (
          <AdminPortal
            onNavigateUrl={navigate}
            onRefresh={handleSyncDb}
            isRefreshing={isRefreshing}
          />
        );
      }
      const myUrl =
        currentUser.role === "technician"
          ? "/technician"
          : currentUser.role === "material_manager"
          ? "/material"
          : "/operator";
      return renderForbidden("Quản Lý (Admin)", currentUser.role, myUrl);
    }

    // 4. Cổng Thợ Máy (/technician) - TUYỆT ĐỐI KHÔNG CÓ LỊCH TRÌNH
    if (currentPath.startsWith("/technician")) {
      if (currentUser.role === "technician" || currentUser.role === "admin") {
        return (
          <TechnicianPortal
            onNavigateUrl={navigate}
            onRefresh={handleSyncDb}
            isRefreshing={isRefreshing}
          />
        );
      }
      return renderForbidden("Thợ Máy", currentUser.role, "/operator");
    }

    // 5. Cổng Quản Lý Nguyên Liệu (/material) - TUYỆT ĐỐI KHÔNG CÓ LỊCH TRÌNH
    if (currentPath.startsWith("/material")) {
      if (currentUser.role === "material_manager" || currentUser.role === "admin") {
        return (
          <MaterialPortal
            onNavigateUrl={navigate}
            onRefresh={handleSyncDb}
            isRefreshing={isRefreshing}
          />
        );
      }
      return renderForbidden("Quản Lý Nguyên Liệu", currentUser.role, "/operator");
    }

    // 6. Cổng Đứng Máy (/operator hoặc /workstation) - TUYỆT ĐỐI KHÔNG CÓ LỊCH TRÌNH
    if (currentPath.startsWith("/operator") || currentPath.startsWith("/workstation")) {
      return <OperatorPortal onNavigateUrl={navigate} />;
    }

    // 7. Mọi đường dẫn khác: Trở về Bảng Lịch Xưởng Trang Chủ
    return (
      <PublicSchedulePortal
        onNavigateUrl={navigate}
        onRefresh={handleSyncDb}
        isRefreshing={isRefreshing}
      />
    );
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080C14] flex items-center justify-center text-slate-400 gap-3">
          <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm font-medium">Đang tải phân hệ điều hành...</span>
        </div>
      }
    >
      {renderRolePortal()}
    </Suspense>
  );
};

export default App;
