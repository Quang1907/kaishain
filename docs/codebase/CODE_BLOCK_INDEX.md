# CODE BLOCK INDEX: PHÂN TÍCH KHỐI THUẬT TOÁN THEN CHỐT
- **Mục đích:** Phân tích chi tiết các đoạn logic phức tạp nhất trong hệ thống: công thức, ràng buộc, trường hợp biên và độ phức tạp.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Các thuật toán trong `backend/brain_optimizer.py` và `backend/resource_manager.py`.
- **Trạng thái:** VERIFIED

---

## 1. THUẬT TOÁN 1: LẬP LỊCH NGƯỢC JIT (BACKWARD JIT PROPAGATION)
- **Vị trí file:** `backend/brain_optimizer.py` (Method `_schedule_orders_backward`)
- **Mục tiêu:** Đảm bảo từng đơn hàng hoàn thành đúng hạn xuất kho mà không bắt đầu ép quá sớm gây tồn kho, cũng không ép quá trễ gây trễ hạn.
- **Công thức tính toán:**
  1. Sản lượng cần ép có đệm phế phẩm:
     $$Q_{\text{planned}} = \left\lceil Q_{\text{order}} \times \left(1 + \frac{\text{buffer\_pct}}{100}\right) \right\rceil$$
  2. Số lần dập (Shot):
     $$N_{\text{shot}} = \left\lceil \frac{Q_{\text{planned}}}{\text{cavity}} \right\rceil$$
  3. Thời gian chạy máy thuần túy ($H_{\text{run}}$):
     $$H_{\text{run}} = \frac{N_{\text{shot}} \times \text{cycle\_time}}{3600}$$
  4. Mốc bắt đầu ép ($T_{\text{start}}$):
     $$T_{\text{start}} = T_{\text{deadline}} - 1.0 - H_{\text{run}}$$
- **Ràng buộc:**
  - $T_{\text{start}} \ge 7.0$ (không được lùi vượt quá giờ bắt đầu ca).
  - Máy được chọn phải nằm trong `compatible_machines` của con hàng.
  - **Ràng buộc 1 hàng - 1 máy:** Nếu con hàng đã được xếp lịch trên máy $M_i$, toàn bộ sản lượng của nó phải chạy trên máy $M_i$, không chia tách sang máy khác.

---

## 2. THUẬT TOÁN 2: TỰ HỌC ĐỆM AN TOÀN TRÁNH THIẾU HÀNG (SELF-LEARNING BUFFER)
- **Vị trí file:** `backend/brain_optimizer.py` (Method `record_learning_feedback`)
- **Mục tiêu:** Học từ các lỗi phế phẩm thực tế để kỳ lập lịch sau tự động tăng sản lượng ép bù, cam kết không giao thiếu hàng cho khách.
- **Logic xử lý:**
  ```python
  defect_pct = (scraps / (actual_qty + scraps)) * 100.0 if (actual_qty + scraps) > 0 else 2.5
  new_buffer = min(15.0, max(2.5, old_buffer + (defect_pct * 0.5)))
  ```
- **Trường hợp biên (Edge Cases):**
  - Nếu `scraps == 0`: Hệ số đệm không giảm đột ngột về 0 mà giữ nguyên hoặc giảm chậm 0.1% để chống biến động.
  - Nếu `new_buffer > 15.0%`: Cắt ngọn ở mức 15.0% để tránh ép thừa quá nhiều gây lãng phí nguyên liệu.
