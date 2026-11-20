# CURRENT STATE: TRẠNG THÁI HỆ THỐNG THỰC TẾ
- **Mục đích:** Ghi nhận chính xác hiện trạng kỹ thuật, mã nguồn, build, test và các luồng công việc đang thực hiện.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ repository `kaisha`.
- **Trạng thái:** VERIFIED (Kiểm tra trực tiếp từ Git CLI, Unit Tests và Vite Build).

---

## 1. TÌNH TRẠNG GIT VÀ MÃ NGUỒN
- **Branch hiện tại:** `main` (Up to date với `origin/main`).
- **Commit gần nhất:** `9fe1d88` (*update view*).
- **Thay đổi đã Staged:**
  - Xóa bỏ `frontend/tsconfig.node.tsbuildinfo` và `frontend/tsconfig.tsbuildinfo` (đã đưa vào `.gitignore`).
- **Thay đổi Unstaged:**
  - `.gitignore`: Cập nhật bộ lọc ignore cho TypeScript buildinfo và build artifacts.
  - `frontend/src/app/App.tsx`: Refactor sang kiến trúc Role-based Portals với client-side routing.
  - `frontend/src/core/api/endpoints.ts`: Bổ sung endpoint `SCHEDULES`, `JOBS`, `JOBS_DELETE`.
  - `frontend/src/features/material/index.ts`: Export `MaterialPortalLayout`.
  - `frontend/src/features/operator-workstation/index.ts`: Export `OperatorPortalLayout`.
  - `frontend/src/features/technician/index.ts`: Export `TechnicianPortalLayout`.
  - `frontend/src/shared/components/layout/Header.tsx`: Cập nhật hiển thị vai trò và phiên bản PostgreSQL / SQLite.
  - `frontend/src/shared/components/layout/StatusBar.tsx`: Cập nhật thông số kết nối cơ sở dữ liệu động.
- **Tệp tin Untracked:**
  - `.env.example`: File mẫu biến môi trường (PostgreSQL / SQLite, Secret Key, Host, Port).
  - `frontend/src/core/router/useRouter.ts`: Custom router hook chuẩn HTML5 History API.
  - `frontend/src/features/admin/`: Module Cổng Quản Lý Điều Hành (Dashboard, Layout, Users Management).
  - `frontend/src/features/auth/components/LoginPage.tsx`: Trang đăng nhập phân quyền chuyên dụng.
  - `frontend/src/features/auth/index.ts`: Export auth components và API.
  - `frontend/src/features/material/components/MaterialPortalLayout.tsx`: Layout phân vùng cho Quản lý Nguyên liệu.
  - `frontend/src/features/operator-workstation/components/OperatorPortalLayout.tsx`: Layout cho Thợ Đứng Máy.
  - `frontend/src/features/technician/components/TechnicianPortalLayout.tsx`: Layout cho Thợ Máy Thay Khuôn.

---

## 2. KẾT QUẢ KIỂM THỬ VÀ ĐÓNG GÓI (VERIFIED)
1. **Backend Unit & Stress Tests:**
   - Lệnh kiểm tra: `python3 -m unittest discover -s tests -v`
   - Kết quả: **18/18 tests passed (100% OK)** trong **0.091 giây**.
   - Bao phủ: Kết nối DB, toàn vẹn quan hệ (Relational Integrity), ràng buộc 1 hàng 1 máy, đánh giá 3 chân kiềng, tự học đệm an toàn, stress test 10 luồng ghi nhận đồng thời, mã hóa mật khẩu SHA256 kèm Salt, vòng đời session token, RBAC 4 vai trò, nghiệm thu thợ máy 4 bước, cấp phát nguyên liệu.
2. **Frontend TypeCheck & Production Build:**
   - Lệnh kiểm tra: `cd frontend && npm run build`
   - Kết quả: **Vite build thành công trong 989ms** (Code splitting thành 14 chunks: vendor, admin, technician, material, operator-workstation, login, query, icons, v.v.).

---

## 3. CÁC PHÂN HỆ VÀ TRẠNG THÁI HOÀN THIỆN
| Phân hệ (Bounded Context) | Trạng thái | Ghi chú kiểm chứng |
| :--- | :--- | :--- |
| **Backend Core Server** | `COMPLETED` | Chạy trên Python chuẩn, không phụ thuộc framework nặng, có ThreadingMixIn. |
| **Database Layer (SQLite & Postgres)** | `COMPLETED` | 14 bảng quan hệ, Cascade Deletes, PRAGMA foreign keys, WAL mode. |
| **APS JIT Brain Optimizer** | `COMPLETED` | Thuật toán lập lịch ngược, giải quyết ràng buộc máy-hàng, ngắt điện tự động. |
| **Resource Manager (3 Pillars)** | `COMPLETED` | Kiểm tra điều kiện sấy nhựa, thùng bao bì và nhân sự đứng máy/chạy chuyền. |
| **Authentication & RBAC** | `COMPLETED` | Mã hóa SHA256 + Salt, token cache 24h, 4 vai trò: Admin, Technician, Material, Operator. |
| **Admin Portal (`/admin`)** | `COMPLETED` | Bảng Gantt 22 máy, danh mục BOM, quản lý nhân sự, lệnh xuất hàng, Database explorer. |
| **Technician Portal (`/technician`)** | `COMPLETED` | Quy trình nghiệm thu thay khuôn 4 bước, kiểm tra an toàn gá khuôn. |
| **Material Portal (`/material`)** | `COMPLETED` | Quản lý phễu sấy hạt nhựa, kiểm soát nhiệt độ sấy, cờ Dry-coat, thùng đóng gói. |
| **Operator Workstation (`/operator`)** | `COMPLETED` | Bàn làm việc đứng máy, xem chi tiết lệnh sản xuất, báo cáo sản lượng và phế phẩm. |
| **Client-Side HTML5 Router** | `COMPLETED` | `useRouter.ts` xử lý điều hướng URL không phụ thuộc thư viện bên ngoài. |
