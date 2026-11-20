# HỆ THỐNG ĐIỀU HÀNH & BỘ NÃO LẬP LỊCH SẢN XUẤT THÔNG MINH (PLASTIC INJECTION APS BRAIN)

## Dedicated Enterprise SQLite Database • Master Dev Clean Architecture

Hệ thống điều hành sản xuất và lập lịch tự động dành riêng cho nhà máy chế tạo ép nhựa chính xác, kết nối trực tiếp với **Cơ sở Dữ liệu Quan hệ Chuyên dụng (SQLite Enterprise Grade)**, được chuẩn hóa từ 4 bảng kế hoạch sản xuất 2 ngày làm việc:

- **Ngày 1 (11月12日 木曜日 - Thứ 5):** Máy 2 đến 13 và Máy 15 đến 25
- **Ngày 2 (11月13日 金曜日 - Thứ 6):** Máy 2 đến 13 và Máy 15 đến 25

---

## 1. KIẾN TRÚC MASTER DEV & CƠ SỞ DỮ LIỆU RIÊNG (DEDICATED DATABASE)

Hệ thống được thiết kế theo tiêu chuẩn **Clean Architecture / Domain-Driven Design (DDD)** với 3 tầng độc lập:

1. **Tầng Lưu Trữ (Database & Repository Layer):**
   - Cơ sở dữ liệu: SQLite 3 chuyên dụng tại [backend/database/factory_aps.db](file:///Users/levanquang/kaisha/backend/database/factory_aps.db).
   - Chế độ **WAL (Write-Ahead Logging)** cho tốc độ đọc/ghi cực nhanh và hỗ trợ đồng thời cao.
   - Kích hoạt toàn diện **Foreign Key Constraints (`PRAGMA foreign_keys = ON;`)** đảm bảo toàn vẹn dữ liệu quan hệ.
   - [backend/database/repository.py](file:///Users/levanquang/kaisha/backend/database/repository.py): Mẫu thiết kế Repository Pattern trừu tượng hóa toàn bộ thao tác CRUD.
2. **Tầng Nghiệp Vụ & Bộ Não AI (Service & APS Brain Layer):**
   - [backend/brain_optimizer.py](file:///Users/levanquang/kaisha/backend/brain_optimizer.py): Bộ não lập lịch ngược JIT, tối ưu 1 hàng 1 máy, ngắt điện tắt máy ($□$), tự học đệm an toàn.
   - [backend/resource_manager.py](file:///Users/levanquang/kaisha/backend/resource_manager.py): Quản lý 3 chân kiềng (Sấy nhựa, Thùng, Nhân công).
3. **Tầng Giao Diện & API (REST API & Web UI Layer):**
   - [backend/server.py](file:///Users/levanquang/kaisha/backend/server.py): REST API điều khiển thời gian thực kết nối DB.
   - [frontend/index.html](file:///Users/levanquang/kaisha/frontend/index.html) & [frontend/app.js](file:///Users/levanquang/kaisha/frontend/app.js): Trung tâm điều hành 6 màn hình chức năng chuyên sâu.

### Bảng cấu trúc 10 Table trong Cơ sở Dữ liệu:

| Bảng (Table)             | Mô tả nghiệp vụ                                                       | Khóa & Ràng buộc chính                                         |
| :----------------------- | :-------------------------------------------------------------------- | :------------------------------------------------------------- |
| `machines`               | 22 máy ép nhựa (Khu Bay A 2-13, Khu Bay B 15-25)                      | `id` PK, `tonnage`, `power_kw`, `bay`, `status`                |
| `materials`              | Nguyên liệu hạt nhựa, nhiệt độ sấy, giờ sấy, cờ Dry-coat ($青○$)      | `id` PK, `resin_name`, `dry_temp_celsius`, `dry_time_hours`    |
| `boxes`                  | Quy cách bao bì (Thùng KLT, Carton, Khay xốp), số cái/thùng           | `id` PK, `box_name`, `pcs_per_box`, `staging_lead_hours`       |
| `products`               | 28 con hàng kèm định mức BOM, cavity, cycle time, đệm hao hụt         | `code` PK, FK `material_id`, FK `box_id`, `preferred_mode`     |
| `product_machines`       | Bảng quan hệ tương thích: 1 con hàng có thể chạy trên nhiều máy       | Composite PK (`product_code`, `machine_id`)                    |
| `operators`              | 24 nhân sự: Ca ngày, tăng ca, ca đêm, setup khuôn, người chạy chuyền  | `id` PK, `name`, `shift_type`, `mode_pref`, `skill_level`      |
| `schedules`              | Kế hoạch ngày (11/12, 11/13, AI Tối Ưu Ca Kế Tiếp)                    | `id` PK, `date_str`, `day_of_week`, `is_optimized`, `notes`    |
| `job_blocks`             | Toàn bộ khối công việc trên 22 máy (PROD, ○ 型替, △ 色替, □ 計画停止) | `id` PK, FK `schedule_id`, FK `machine_id`, FK `product_code`  |
| `shipping_orders`        | Lệnh xuất hàng của khách hàng (Hikari Seimitsu, Inoac, Denso...)      | `order_id` PK, FK `product_code`, `ship_date`, `deadline`      |
| `break_schedules`        | Khung giờ nghỉ ngơi và phân bổ người chạy chuyền (Relief) giữ máy     | `id` PK, `name`, `shift`, `start_hour`, `end_hour`, `coverage` |
| `learning_feedback_logs` | Nhật ký học máy: Ghi nhận phế phẩm, tự động cập nhật đệm an toàn      | `id` PK, `product_code`, `machine_id`, `scraps`, `buffer_pct`  |

---

## 2. NGUYÊN TẮC VẬN HÀNH CỦA BỘ NÃO APS

1. **Chủ động chuẩn bị hàng trước lệnh xuất hàng (JIT Backward Planning):**
   - Truy vết ngược: $\text{Giờ xuất} \to \text{Đóng thùng} \to \text{Ép} \to \text{Gá khuôn } (○) \to \text{Sấy nhựa (2-4.5h)} \to \text{Xuất thùng (1h)}$.
   - Nếu phễu sấy chưa hoàn tất chu kỳ nhiệt, hệ thống chặn không cho phép khởi động máy để chống lỗi nứt/bọt khí.
2. **Quy tắc máy & con hàng:**
   - 1 máy chạy nhiều hàng; 1 hàng tương thích nhiều máy; **nhưng 1 hàng CHỈ CHẠY 1 LẦN TRÊN 1 MÁY** trong chu kỳ kế hoạch (tránh chia nhỏ lô, tránh nhân đôi chi phí tháo lắp khuôn).
3. **Quản lý 3 chân kiềng:**
   - Thùng (Đúng loại, đủ số lượng).
   - Nguyên liệu (Sấy đủ nhiệt, kiểm tra cờ Dry-coat $青○$).
   - Người đứng máy (Phân công tự động theo 2 chế độ).
4. **Hai chế độ người đứng máy:**
   - **Theo con hàng (`BY_PRODUCT`):** Dành cho hàng khó, kiểm tra 100%, gọt bavia (Chí, Quỳnh, Quang, Thi, Bình, Tuyến...).
   - **Theo máy cố định (`BY_MACHINE`):** Trông cụm máy tự động robot gắp (Thu, Cẩm, Hoàng, Yến, Soi...).
5. **Nghỉ ngơi & Người chạy chuyền (Relief):**
   - Người chạy chuyền (Giang 8~12h, Kawabata, Linh, Hùng A) thay thế công nhân chính trong giờ ăn trưa và ăn khuya để máy chạy liên tục, nòng không bị nguội.
6. **Tự động ngắt điện tắt máy ($□\ \text{計画停止}$):**
   - Máy hoàn thành sản lượng mà không có việc kế tiếp, hoặc không có người đứng ca đêm, Bộ Não tự động phát lệnh **TẮT NHIỆT & TẮT MÁY** để tiết kiệm điện.
7. **Tự học tối ưu cho lần sau không thiếu hàng:**
   - Mỗi ca báo cáo phế phẩm, AI tự động tăng đệm an toàn ($+2.5\% \to +4.5\% \to +6.0\%$) và ghi nhận vào SQLite để lần chạy sau ép bù dư, cam kết **không bao giờ thiếu hàng giao khách**.

---

## 3. TRUNG TÂM ĐIỀU HÀNH VỚI 6 MÀN HÌNH CHUYÊN SÂU

Truy cập: **`http://localhost:8080`**

1. **📊 Bảng Lập Lịch 24H (Gantt Schedule & JIT Radar):**
   - Bảng Gantt trực quan 22 máy ép tái hiện bảng giấy Nhật Bản.
   - Thanh trượt thời gian giả lập (7:00 $\to$ 31:00).
   - Click vào từng khối để xem chi tiết 3 chân kiềng (Thùng, Sấy nhựa, Thợ đứng máy).
2. **🚚 Lệnh Xuất Hàng (Shipping Orders):**
   - Quản lý đơn hàng khách hàng, hạn giao, số thùng cần thiết.
   - Form "+ Tạo Lệnh Xuất Mới" lưu trực tiếp vào Database SQLite.
3. **🏭 22 Máy Ép (Machines):**
   - Thẻ thông tin 22 máy ép với trọng tải (80T - 350T), công suất kW, khu Bay A/B.
4. **📦 Hàng & BOM (Products & Materials & Boxes):**
   - Danh mục 28 mã hàng kèm định mức nhựa, nhiệt độ sấy, quy cách thùng, cavity và chu kỳ ép.
5. **👥 Nhân Lực (Operators):**
   - Danh sách 24 nhân sự kèm ca làm, phân loại theo con hàng vs theo máy, bậc tay nghề và cờ chạy chuyền.
6. **💾 Cơ Sở Dữ Liệu (Database Explorer):**
   - Thống kê trực tiếp dung lượng file `factory_aps.db`, số lượng dòng của 10 bảng.
   - Bảng nhật ký học máy (Feedback Logs) theo thời gian thực.
   - Nút "Nạp Lại Dữ Liệu Gốc (Reset DB)" để khôi phục dữ liệu ban đầu từ 4 ảnh chụp.

---

## 4. HƯỚNG DẪN LỆNH & KIỂM THỬ

- Khởi động server:
  ```bash
  python3 backend/server.py
  # hoặc: ./start.sh
  ```
- Nạp lại dữ liệu gốc vào Database:
  ```bash
  python3 backend/database/db_seeder.py
  ```
- Chạy bộ kiểm thử tự động (Unit Tests):
  ```bash
  python3 -m unittest discover -s tests -v
  ```
