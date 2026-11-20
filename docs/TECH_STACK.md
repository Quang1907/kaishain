# TECH STACK: CÔNG NGHỆ VÀ TIÊU CHUẨN KỸ THUẬT
- **Mục đích:** Liệt kê đầy đủ thành phần công nghệ, phiên bản, vai trò và căn cứ lựa chọn.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ dự án `kaisha`.
- **Trạng thái:** VERIFIED

---

## 1. BACKEND ARCHITECTURE
| Thành phần | Công nghệ / Thư viện | Phiên bản | Vai trò trong hệ thống | Lý do chọn lựa |
| :--- | :--- | :--- | :--- | :--- |
| **Runtime** | Python | 3.10+ / 3.15 | Ngôn ngữ thực thi chính | Cú pháp rõ ràng, tích hợp tốt với thư viện toán học & tối ưu hóa. |
| **HTTP Server** | `http.server.HTTPServer` + `ThreadingMixIn` | Standard Lib | Máy chủ web đa luồng hiệu năng cao | Không phụ thuộc framework bên thứ ba, khởi động tức thì, độ trễ < 0.5ms. |
| **Database Engine** | SQLite 3 (Chế độ WAL) & PostgreSQL 15+ | 3.54.1 / 15+ | Lưu trữ quan hệ dữ liệu nhà máy | SQLite không cần cấu hình cho local/edge, PostgreSQL cho enterprise server. |
| **DB Driver** | `sqlite3` (built-in) & `psycopg2-binary` | Standard / 2.9+ | Kết nối cơ sở dữ liệu | Trừu tượng hóa qua Repository Pattern & Facade. |
| **Data Validation** | `dataclasses` & Type Hints | Standard Lib | Định nghĩa Domain Entities & Value Objects | Kiểm soát kiểu dữ liệu nghiêm ngặt theo chuẩn Clean Architecture. |
| **Testing** | `unittest` | Standard Lib | Kiểm thử đơn vị & kiểm thử tải đồng thời | Chạy siêu nhanh (18 tests trong 0.091s), tích hợp CI/CD chuẩn. |

---

## 2. FRONTEND ARCHITECTURE
| Thành phần | Công nghệ / Thư viện | Phiên bản | Vai trò trong hệ thống | Lý do chọn lựa |
| :--- | :--- | :--- | :--- | :--- |
| **Core Framework** | React | 18.3.1 | Giao diện điều hành đơn trang (SPA) | Component hóa mạnh mẽ, hệ sinh thái phong phú, hiệu năng cao. |
| **Language** | TypeScript | 5.5.3 | Kiểm tra tĩnh kiểu dữ liệu toàn diện | Loại bỏ lỗi runtime, tự động hoàn thiện mã nguồn, an toàn tái cấu trúc. |
| **Build Tool** | Vite | 5.4.21 | Trình đóng gói và dev server siêu tốc | Hot Module Replacement (HMR) tức thì, build production dưới 1 giây. |
| **Styling** | TailwindCSS + PostCSS | 3.4.1 | Hệ thống thiết kế giao diện Dark Mode | Thiết kế dành riêng cho xưởng sản xuất, tương phản cao, tối ưu kích thước CSS. |
| **State Management**| Zustand | 4.5.5 | Quản lý trạng thái toàn cục ứng dụng | Nhẹ gọn (< 1KB), cú pháp dễ hiểu, hỗ trợ persist và reactive updates. |
| **Server State** | @tanstack/react-query | 5.56.2 | Quản lý cache và truy vấn API | Tự động revalidate, cache dữ liệu thông minh, xử lý trạng thái loading/error. |
| **Icons** | Lucide React | 0.441.0 | Bộ icon công nghiệp và điều hành | Đầy đủ icon máy móc, bảo mật, thời gian, công cụ, giao diện hiện đại. |
| **Routing** | HTML5 History API (`useRouter.ts`) | Custom | Điều hướng các Cổng Phân Quyền | Tối ưu kích thước gói build, hỗ trợ URL thực tế (/admin, /technician...). |
