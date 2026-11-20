# API MAP: ĐẶC TẢ GIAO DIỆN LẬP TRÌNH ỨNG DỤNG (RESTful)
- **Mục đích:** Liệt kê đầy đủ 22 endpoints, phương thức HTTP, tham số, dữ liệu payload và quyền truy cập.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ API Backend được xử lý qua `backend/api/router.py`.
- **Trạng thái:** VERIFIED

---

## 1. NHÓM HỆ THỐNG & CƠ SỞ DỮ LIỆU
| Method | Endpoint | Yêu cầu Auth | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | Không | Kiểm tra trạng thái máy chủ, backend type (sqlite/postgres) và độ trễ. |
| `GET` | `/api/db/stats` | Admin | Thống kê số lượng bản ghi của 14 bảng và kích thước database file. |
| `GET` | `/api/db/download` | Admin | Tải về tệp tin SQLite `factory_aps.db` vật lý. |
| `POST` | `/api/db/seed` | Admin | Nạp lại dữ liệu chuẩn từ 4 ảnh chụp kế hoạch nhà máy. |
| `POST` | `/api/db/reset` | Admin | Xóa trắng và tái cấu trúc lại database ban đầu. |

---

## 2. NHÓM XÁC THỰC & NGƯỜI DÙNG (RBAC)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/login` | Public | Đăng nhập bằng `username` + `password`, nhận `session_token` và `permissions`. |
| `POST` | `/api/auth/logout` | User | Đăng xuất và hủy token trong cache phiên. |
| `GET` | `/api/auth/me` | User | Lấy thông tin tài khoản hiện tại từ Bearer Token. |
| `GET` | `/api/users` | Admin | Lấy danh sách tài khoản và phân quyền trong xưởng. |

---

## 3. NHÓM MASTER DATA (QUẢN LÝ TÀI NGUYÊN)
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/machines` | Tất cả | Lấy danh sách 22 máy ép nhựa và trạng thái vận hành. |
| `POST` | `/api/machines` | Admin | Tạo mới hoặc cập nhật thông số máy ép. |
| `POST` | `/api/machines/delete` | Admin | Xóa máy ép (hỗ trợ kiểm tra ràng buộc khóa ngoại). |
| `GET` | `/api/products` | Tất cả | Lấy danh mục 28 con hàng, BOM nguyên liệu, thùng đóng gói. |
| `POST` | `/api/products` | Admin | Tạo mới hoặc cập nhật con hàng. |
| `POST` | `/api/products/delete` | Admin | Xóa con hàng. |
| `GET` | `/api/materials` | Tất cả | Lấy danh sách 27 loại hạt nhựa, nhiệt độ sấy, giờ sấy. |
| `POST` | `/api/materials` | Admin/Mat | Cập nhật thông số nguyên liệu hoặc gán phễu sấy. |
| `GET` | `/api/boxes` | Tất cả | Lấy danh mục 20 quy cách bao bì thùng. |
| `GET` | `/api/operators` | Tất cả | Danh sách 24 nhân sự, phân ca, bậc nghề và chế độ đứng máy. |
| `GET` | `/api/breaks` | Tất cả | Lấy khung giờ giải lao và phân bổ người chạy chuyền (Relief). |

---

## 4. NHÓM LẬP LỊCH & BỘ NÃO APS BRAIN
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/schedules` | Tất cả | Lấy danh sách tất cả các ngày lịch trình đã có trong hệ thống. |
| `GET` | `/api/schedule?date=...` | Tất cả | Lấy dữ liệu 22 máy và toàn bộ `job_blocks` của 1 ngày cụ thể. |
| `POST` | `/api/jobs` | Admin | Thêm mới hoặc điều chỉnh thủ công một khối công việc trên Gantt. |
| `POST` | `/api/jobs/delete` | Admin | Xóa một khối công việc. |
| `POST` | `/api/optimize` | Admin | Kích hoạt Bộ Não APS Brain chạy thuật toán lập lịch JIT. |
| `GET` | `/api/readiness?date=...` | Tất cả | Đánh giá 3 chân kiềng (Nguyên liệu, Thùng, Nhân sự) cho toàn bộ ca. |
| `GET` | `/api/shipping-orders` | Tất cả | Danh sách đơn hàng xuất khẩu của khách hàng. |
| `POST` | `/api/shipping-orders` | Admin | Tạo mới hoặc sửa đơn hàng xuất khẩu. |
| `POST` | `/api/shipping-orders/delete`| Admin | Hủy đơn hàng xuất khẩu. |

---

## 5. NHÓM WORKFLOW & TỰ HỌC
| Method | Endpoint | Quyền | Mô tả |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/mold/logs` | Tech/Admin | Lấy nhật ký nghiệm thu thay khuôn (○ 型替). |
| `GET` | `/api/material/logs` | Mat/Admin | Lấy nhật ký chuẩn bị phễu sấy và thùng bao bì. |
| `POST` | `/api/feedback` | Tất cả | Báo cáo sản lượng & phế phẩm cuối ca, kích hoạt tự động bù đệm an toàn. |
| `GET` | `/api/feedback/logs` | Admin | Lấy lịch sử tự học và biến thiên hệ số đệm phế phẩm qua các ca. |
| `GET` | `/api/learning-profile` | Admin | Hồ sơ học máy tổng hợp của 28 con hàng. |
