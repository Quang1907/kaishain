# CHANGELOG: LỊCH SỬ THAY ĐỔI DỰ ÁN

- **Mục đích:** Theo dõi toàn bộ các phiên bản, tính năng bổ sung, sửa lỗi và tái cấu trúc hệ thống.
- **Ngày cập nhật:** 2026-11-20
- **Quy chuẩn:** Tuân thủ chuẩn [Keep a Changelog](https://keepachangelog.com/).

---

## [2.0.0] - 2026-11-20

### Added (Bổ sung mới)

- **Role-Based Portals:** Tách biệt 4 cổng làm việc độc lập theo vai trò:
  - Cổng Quản Lý Điều Hành (`/admin`): Giám sát 22 máy, Gantt 24H, BOM, Database.
  - Cổng Thợ Máy Thay Khuôn (`/technician`): Quy trình nghiệm thu 4 bước an toàn.
  - Cổng Quản Lý Nguyên Liệu (`/material`): Giám sát nhiệt độ sấy, cờ Dry-coat, xuất thùng.
  - Cổng Bàn Làm Việc Đứng Máy (`/operator`): Giao diện thao tác ca và báo cáo phế phẩm.
- **Trang Đăng Nhập Chuyên Dụng (`/login`):** Trang đăng nhập hiện đại với bộ chọn nhanh 4 vai trò demo.
- **HTML5 History Client Router:** Module `useRouter.ts` gọn nhẹ hỗ trợ URL thực tế.
- **PostgreSQL Enterprise Schema:** File `postgres_schema.sql` hoàn chỉnh hỗ trợ sẵn sàng mở rộng.
- **Hệ Thống Master Dev Documentation:** Khởi tạo toàn bộ 22 tài liệu Project Memory & Codebase Intelligence.

### Changed (Cải tiến)

- Tái cấu trúc `App.tsx` sang mô hình điều hướng phân vùng theo URL và vai trò người dùng.
- Nâng cấp `Header.tsx` và `StatusBar.tsx` hiển thị trạng thái kết nối động (SQLite WAL / PostgreSQL) và vai trò người dùng.
- Tối ưu hóa Vite build chunk splitting, giảm thời gian build production xuống dưới 1 giây.

### Fixed (Sửa lỗi)

- Cập nhật `.gitignore` loại bỏ các file tạm TypeScript buildinfo (`*.tsbuildinfo`).
- Đảm bảo toàn vẹn quan hệ và cascade delete khi xóa lịch trình sản xuất.

---

## [1.0.0] - 2026-11-18

### Added

- Khởi tạo kiến trúc Clean Architecture cho xưởng ép nhựa 22 máy.
- Bộ não lập lịch ngược JIT Brain và Quản lý 3 chân kiềng.
- Bảng Gantt trực quan 22 máy với trục thời gian giả lập 7h - 31h.
- 10 bảng cơ sở dữ liệu SQLite chuyên dụng.
