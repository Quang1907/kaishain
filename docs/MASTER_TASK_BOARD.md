# MASTER TASK BOARD: BẢNG ĐIỀU PHỐI CÔNG VIỆC DỰ ÁN
- **Mục đích:** Quản lý tập trung mọi nhiệm vụ kỹ thuật, trạng thái, người chịu trách nhiệm và tiêu chí nghiệm thu (DoD).
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ vòng đời phát triển của Kaisha APS Brain 2.0.
- **Trạng thái:** VERIFIED

---

## 1. QUY ƯỚC TRẠNG THÁI
- `NOT_STARTED`: Đã định nghĩa nhưng chưa bắt đầu.
- `PLANNED`: Đã xếp lịch trình vào roadmap.
- `IN_PROGRESS`: Đang trực tiếp xử lý mã nguồn.
- `TESTING`: Đang chạy kiểm thử nghiệm thu.
- `COMPLETED`: Đã vượt qua toàn bộ tiêu chí DoD và test suites.
- `BLOCKED`: Đang bị tắc nghẽn do phụ thuộc.
- `DEPRECATED`: Đã hủy bỏ có lý do.

---

## 2. DANH MỤC NHIỆM VỤ CHI TIẾT

| Task ID | Nhiệm vụ | Module | Ưu tiên | Trạng thái | Tiêu chí hoàn thành (DoD) |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **TSK-001** | Khởi tạo Clean Architecture Backend | `backend/core` | P0 | `COMPLETED` | Phân tầng rõ rệt: API $\to$ Service $\to$ Domain $\to$ Infrastructure. 0 lỗi circular import. |
| **TSK-002** | Thiết kế 14 Table Database & WAL Mode | `backend/database` | P0 | `COMPLETED` | SQLite Enterprise kích hoạt WAL, Foreign keys ON, Cascade delete chuẩn mực. |
| **TSK-003** | Xây dựng Bộ Não Lập Lịch JIT Brain | `backend/services` | P0 | `COMPLETED` | Ràng buộc 1 hàng 1 máy, ngắt điện tắt máy, tự học đệm an toàn khi có phế phẩm. |
| **TSK-004** | Bộ Quản lý 3 Chân Kiềng (Resource Manager) | `backend/services` | P0 | `COMPLETED` | Đánh giá độc lập: Sấy nhựa, Thùng, Người đứng máy & Thợ chạy chuyền. |
| **TSK-005** | Hệ thống Xác thực & RBAC 4 Vai trò | `backend/auth` | P0 | `COMPLETED` | Mật khẩu Salted SHA256, Session Token, phân quyền nghiêm ngặt Admin/Tech/Mat/Op. |
| **TSK-006** | Frontend Clean Architecture Vite + React | `frontend/src` | P0 | `COMPLETED` | Cấu trúc Feature-Sliced, TypeScript strict mode, Tailwind styling chuẩn công nghiệp. |
| **TSK-007** | Bảng Gantt 22 Máy Ép Chuẩn Nhà Máy Nhật | `features/gantt` | P1 | `COMPLETED` | Trục thời gian 7h-31h, hiển thị trực quan các khối PROD, ○ 型替, △ 色替, □ 計画停止. |
| **TSK-008** | Phân Vùng 4 Cổng Độc Lập (Role Portals) | `features/*` | P1 | `COMPLETED` | Cổng Admin (`/admin`), Thợ máy (`/technician`), Nguyên liệu (`/material`), Đứng máy (`/operator`). |
| **TSK-009** | Xây Dựng HTML5 History Router Nhẹ Gọn | `core/router` | P1 | `COMPLETED` | `useRouter.ts` đồng bộ URL trên trình duyệt, không cài đặt thêm package nặng nề. |
| **TSK-010** | Tích Hợp PostgreSQL Enterprise Sẵn Sàng | `backend/database` | P1 | `COMPLETED` | `postgres_schema.sql` đầy đủ DDL, chỉ mục, view, tương thích 100% với backend. |
| **TSK-011** | Kiểm Thử Tự Động Toàn Diện (QA Suite) | `tests` | P0 | `COMPLETED` | 18 unit tests, stress test 10 luồng đồng thời, độ trễ < 1ms, không deadlock. |
| **TSK-012** | Khởi Tạo Bộ Tài Liệu Master Dev Intelligence | `docs` | P0 | `IN_PROGRESS` | Hoàn thiện 22 tài liệu chuẩn Project Memory và Codebase Intelligence. |
| **TSK-013** | Kết Nối WebSocket / SSE Cho Bảng Gantt | `features/gantt` | P2 | `PLANNED` | Cập nhật trạng thái máy thời gian thực không cần reload hoặc polling. |
| **TSK-014** | Tích Hợp Quét Mã Vạch QR Code Tại Máy | `features/operator` | P2 | `PLANNED` | Quét mã khuôn và mã bao bì bằng camera thiết bị di động/máy tính bảng. |
| **TSK-015** | Báo Cáo Phân Tích OEE & Tiêu Thụ Năng Lượng | `features/admin` | P3 | `PLANNED` | Dashboard thống kê điện năng tiết kiệm được từ các lệnh □ 計画停止. |
