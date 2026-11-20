# FUTURE ROADMAP: LỘ TRÌNH PHÁT TRIỂN DÀI HẠN
- **Mục đích:** Định hướng chiến lược kỹ thuật và tính năng tương lai theo thứ tự ưu tiên P0 $\to$ P3.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ hệ thống Kaisha APS Brain.
- **Trạng thái:** PLANNED / INFERRED

---

## 1. PHÂN LOẠI MỨC ĐỘ ƯU TIÊN
- **P0 (Nghiêm trọng / Cốt lõi):** Ảnh hưởng trực tiếp đến tính toàn vẹn dữ liệu, an ninh bảo mật và độ chính xác của kế hoạch giao hàng.
- **P1 (Quan trọng / Vận hành):** Nâng cao hiệu suất trực tiếp của công nhân xưởng, thợ máy và quản lý nguyên liệu.
- **P2 (Cải tiến / Tối ưu hóa):** Tiện ích mở rộng, tự động hóa tương tác thời gian thực và giảm thao tác thủ công.
- **P3 (Tương lai / Mở rộng quy mô):** Trí tuệ nhân tạo dự đoán bảo trì (PdM), tích hợp ERP đám mây và tối ưu hóa năng lượng toàn diện.

---

## 2. CHI TIẾT CÁC HẠNG MỤC LỘ TRÌNH

### Giai đoạn 1: Ổn định hóa & Vận hành Chuyên sâu (P0 & P1) - Quý 4/2026
1. **[P0] Hoàn thiện đồng bộ dữ liệu PostgreSQL Production:**
   - *Lý do:* Khi nhà máy mở rộng sang nhiều phân xưởng, việc chuyển từ SQLite WAL sang PostgreSQL cụm (Cluster) là bắt buộc.
   - *Chi phí/Rủi ro:* Cần kiểm soát biến môi trường `DATABASE_BACKEND=postgres` và kiểm tra connection pooling.
2. **[P1] Kích hoạt Audit Logging toàn diện cho các thao tác Nghiệm thu:**
   - *Lý do:* Đảm bảo tính minh bạch khi thợ máy ký nghiệm thu thay khuôn và quản lý nguyên liệu cấp phễu sấy.
   - *Tác động:* Thêm bảng `audit_trails` ghi nhận IP, thiết bị, thời gian và chữ ký số nội bộ.

### Giai đoạn 2: Tự động hóa & Tương tác Thời gian thực (P2) - Quý 1/2027
1. **[P2] WebSocket / SSE Live Feed cho Bảng Gantt:**
   - *Lý do:* Khi công nhân tại máy 5 báo phế phẩm hoặc thợ máy hoàn tất gá khuôn trên máy 12, bảng Gantt tại phòng điều hành tự động cập nhật mà không cần bấm Refresh.
   - *Rủi ro:* Quản lý socket kết nối đồng thời trên hạ tầng mạng xưởng.
2. **[P2] Tích hợp Quét Mã Vạch QR Code cho Khuôn & Bao Bì:**
   - *Lý do:* Loại bỏ hoàn toàn lỗi gá nhầm khuôn hoặc đóng nhầm thùng KLT bằng cách quét camera trước khi bấm chạy máy.

### Giai đoạn 3: Trí tuệ Công nghiệp & Mở Rộng Quy Mô (P3) - Quý 2/2027
1. **[P3] Mô-đun Dự đoán Bảo Trì Khuôn & Máy (Predictive Maintenance):**
   - *Lý do:* Dự báo hỏng hóc chốt đẩy, rò rỉ dầu gia nhiệt dựa trên số lượng shot ép tích lũy của từng con hàng.
2. **[P3] Tối ưu hóa Chi phí Năng lượng theo Biểu Giá Điện Giờ Cao Điểm:**
   - *Lý do:* Thuật toán APS Brain tự động ưu tiên ép các con hàng có công suất lớn vào khung giờ thấp điểm (đêm), tự động dừng máy công suất cao vào khung giờ cao điểm để tiết kiệm 15-20% hóa đơn tiền điện.
