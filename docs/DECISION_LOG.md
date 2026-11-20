# ARCHITECTURAL DECISION LOG (ADR)
- **Mục đích:** Ghi nhận các quyết định kiến trúc then chốt, bối cảnh, các phương án xem xét và lý do lựa chọn.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ kiến trúc hệ thống Kaisha APS.
- **Trạng thái:** VERIFIED

---

## ADR-001: Sử dụng Vanilla Python HTTP Server thay vì Framework nặng (FastAPI / Django)
- **Bối cảnh:** Hệ thống cần triển khai trực tiếp tại xưởng hoặc máy tính biên (Edge Industrial PC) với tài nguyên tối thiểu, khởi động siêu nhanh và không gặp sự cố xung đột môi trường dependencies.
- **Quyết định:** Sử dụng `http.server.HTTPServer` kết hợp với `ThreadingMixIn` từ Python Standard Library, tự thiết kế `ApiRouter` và `StaticHandler`.
- **Hệ quả:**
  - *Tích cực:* Không phụ thuộc vào thư viện bên ngoài; thời gian khởi động < 0.1 giây; độ trễ xử lý < 0.5ms; bảo trì lâu dài không sợ breaking changes.
  - *Thách thức:* Cần tự viết bộ bóc tách token, header CORS và chuẩn hóa JSON. Đã hoàn thiện và kiểm thử thành công 100%.

---

## ADR-002: Kiến trúc Cơ sở Dữ liệu kép: SQLite WAL (Local) & PostgreSQL (Enterprise)
- **Bối cảnh:** Cần giải pháp vừa chạy gọn gàng offline tại một máy xưởng, vừa sẵn sàng mở rộng thành máy chủ trung tâm kết nối hàng chục nhà xưởng.
- **Quyết định:** Thiết kế tầng Repository trừu tượng (`Repository Facade`) với DDL tương thích hoàn hảo giữa SQLite 3 (WAL Mode) và PostgreSQL 15+.
- **Hệ quả:**
  - Kiểm thử stress test 10 luồng ghi nhận đồng thời trên SQLite không xảy ra deadlock.
  - Chuyển đổi môi trường chỉ bằng 1 biến môi trường `DATABASE_BACKEND=postgres`.

---

## ADR-003: Phân vùng 4 Cổng Độc Lập theo Bounded Contexts (Role Portals)
- **Bối cảnh:** Các nhóm đối tượng tại nhà máy (Quản lý xưởng, Thợ máy, Quản lý nguyên liệu, Công nhân đứng máy) có trách nhiệm, thiết bị và ngữ cảnh sử dụng hoàn toàn khác nhau.
- **Quyết định:** Tách giao diện thành 4 Portals độc lập:
  - `/admin`: Điều hành toàn cảnh 22 máy, lập lịch, BOM, cơ sở dữ liệu.
  - `/technician`: Tập trung vào quy trình gá khuôn an toàn 4 bước.
  - `/material`: Tập trung vào phễu sấy nhiệt và xuất thùng.
  - `/operator`: Bàn làm việc đứng máy gọn gàng, nút bấm lớn, báo cáo phế phẩm nhanh.
- **Hệ quả:** Tránh nhầm lẫn nghiệp vụ; giảm thiểu lỗi thao tác của công nhân tại hiện trường.

---

## ADR-004: Tự thiết kế HTML5 History Router (`useRouter.ts`) thay cho React Router DOM
- **Bối cảnh:** Dự án cần đồng bộ URL thực tế trên trình duyệt (/admin, /technician, /login...) nhưng tránh đưa vào các gói thư viện router cồng kềnh với nhiều breaking changes giữa các phiên bản.
- **Quyết định:** Tạo hook `useRouter.ts` (~50 dòng code) lắng nghe sự kiện `popstate` và `window.history.pushState`.
- **Hệ quả:** Giảm kích thước bundle JS, build Vite siêu nhanh (989ms), điều hướng mượt mà không reload trang.
