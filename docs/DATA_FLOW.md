# DATA FLOW: LUỒNG DỮ LIỆU NGHIỆP VỤ HỆ THỐNG
- **Mục đích:** Mô tả chi tiết cách thức dữ liệu di chuyển, chuyển hóa và được lưu trữ trong các luồng vận hành chính.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ quy trình xử lý dữ liệu của APS Brain.
- **Trạng thái:** VERIFIED

---

## 1. LUỒNG 1: TỐI ƯU HÓA LẬP LỊCH NGƯỢC JIT (JIT SCHEDULING FLOW)
1. **Khởi tạo:** Quản lý xưởng bấm nút "Tối Ưu Hóa Kế Hoạch JIT" trên Admin Portal (`/admin`).
2. **Frontend Dispatch:** `GanttScheduleView` gọi `scheduleApi.optimizeSchedule(date)` $\to$ gửi HTTP POST `/api/optimize`.
3. **API Routing:** `ApiRouter.handle_post` chuyển tiếp payload tới `schedule_controller.optimize`.
4. **Service Execution:** `schedule_controller` gọi `BrainService.optimize_for_date`:
   - Đọc danh sách lệnh xuất hàng (`shipping_orders`) trong ngày từ `schedule_repo`.
   - Đọc Master Data (22 máy, 28 con hàng, BOM, nhân sự) từ `master_data_repo`.
   - Đọc hệ số hao hụt tự học từ `feedback_repo`.
5. **Brain Optimization:**
   - Sắp xếp đơn hàng theo deadline xuất hàng tăng dần.
   - Với mỗi đơn hàng, tính toán tổng số shot ép cần thiết:
     $$\text{Tổng Shot} = \left\lceil \frac{\text{Số lượng Đơn} \times (1 + \text{Buffer})}{\text{Cavity}} \right\rceil$$
   - Tính thời gian ép: $\text{Giờ Ép} = \frac{\text{Tổng Shot} \times \text{Cycle Time}}{3600}$.
   - Truy vết lùi thời điểm bắt đầu ép: $\text{Start} = \text{Deadline} - 1.0 - \text{Giờ Ép}$.
   - Tìm máy phù hợp trong danh sách `compatible_machines` tuân thủ ràng buộc **1 hàng chỉ chạy 1 máy**.
   - Bổ sung khối thay khuôn (○ 1.0h) hoặc đổi màu (△ 0.5h) nếu con hàng trước đó khác khuôn/màu.
   - Thêm khối ngắt điện tắt máy (□ 計画停止) nếu sau đó máy không còn việc.
6. **Persistence:** Lưu lịch trình mới vào bảng `schedules` và các khối công việc vào `job_blocks`.
7. **Phản hồi:** Trả về mã 200 kèm danh sách `JobBlockDTO` cho giao diện cập nhật bảng Gantt.

---

## 2. LUỒNG 2: VÒNG LẶP HỌC MÁY BÙ HÀO HỤT PHẾ PHẨM (FEEDBACK LOOP)
```mermaid
sequenceDiagram
    autonumber
    actor Op as Thợ Đứng Máy (Workstation)
    participant UI as Operator Workstation UI
    participant API as ApiRouter & Controllers
    participant Service as SystemController & Repositories
    participant DB as Database (feedback_logs)
    participant Brain as APS Brain Optimizer

    Op->>UI: Báo cáo kết thúc ca: Máy 5, Hàng W165, Sản xuất: 2000, Phế phẩm: 60
    UI->>API: POST /api/feedback {machine_id: '5号機', product_code: 'W165', scraps: 60}
    API->>Service: feedback_submit(payload)
    Service->>DB: INSERT INTO learning_feedback_logs (product_code, scraps, new_buffer_pct)
    Note over Service,DB: Đệm an toàn tăng từ 2.5% lên 3.0%
    DB-->>Service: Ghi nhận thành công (id, timestamp)
    Service-->>UI: Response 200 {status: 'success', buffer_pct: 3.0}
    UI-->>Op: Hiển thị thông báo: "Đã cập nhật đệm an toàn tự học!"

    Note over Brain,DB: Lần lập lịch tiếp theo cho mã W165
    Brain->>DB: Query đệm an toàn mới nhất cho W165
    DB-->>Brain: Trả về buffer_pct = 3.0% (thay vì mặc định 2.5%)
    Brain->>Brain: Tính toán tăng sản lượng ép bù phế phẩm -> Đảm bảo 100% đủ hàng giao khách!
```
