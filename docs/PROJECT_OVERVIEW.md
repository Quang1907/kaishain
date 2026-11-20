# PROJECT OVERVIEW: PLASTIC INJECTION APS BRAIN 2.0
- **Mục đích:** Đặc tả tổng quan bài toán nghiệp vụ, giá trị cốt lõi và mục tiêu của hệ thống điều hành sản xuất và lập lịch thông minh APS Brain 2.0.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ hệ thống nhà máy sản xuất linh kiện ép nhựa chính xác (22 máy ép, Bay A & Bay B).
- **Trạng thái:** VERIFIED (Khớp 100% với source code, database và quy chuẩn vận hành nhà máy).

---

## 1. BÀI TOÁN KINH DOANH & MỤC TIÊU CỐT LÕI
Nhà máy ép nhựa kỹ thuật cao hoạt động với 22 máy ép (trọng tải từ 50T đến 350T), gia công linh kiện chính xác cho các khách hàng lớn (Hikari Seimitsu, Inoac, Denso, v.v.). Trước đây, việc lập lịch biểu được thực hiện thủ công trên giấy hoặc Excel, dẫn đến các vấn đề nghiêm trọng:
1. **Thiếu hàng giao khách (Stockouts):** Không tính toán chính xác tỉ lệ phế phẩm và thời gian bù hàng, dẫn đến trễ deadline xuất hàng.
2. **Lãng phí chi phí gá khuôn & đổi màu:** 1 con hàng bị phân bổ chạy ngắt quãng nhiều lần trên cùng 1 máy hoặc nhảy máy tùy tiện, nhân đôi chi phí dừng máy thay khuôn (型替 ○) và tẩy nòng đổi màu (色替 △).
3. **Vi phạm điều kiện tiên quyết (3 Chân kiềng):** Máy bật lên chạy nhưng hạt nhựa chưa sấy đủ giờ/nhiệt, hoặc bao bì/thùng (KLT/Carton) chưa xuất kho, gây gián đoạn dây chuyền hoặc phát sinh phế phẩm hàng loạt.
4. **Lãng phí điện năng:** Máy chạy xong không có lệnh ngắt điện sấy/tắt máy (計画停止 □), tiêu tốn điện năng vô ích trong ca đêm.

**Mục tiêu của APS Brain 2.0:** Xây dựng hệ thống điều hành thông minh tự động hóa hoàn toàn chu trình lập lịch JIT (Just-In-Time), kiểm soát nghiêm ngặt 3 chân kiềng, phân bổ nhân sự theo 2 chế độ, tự động ngắt điện tiết kiệm năng lượng và tự học đệm an toàn qua từng ca sản xuất.

---

## 2. NGUYÊN TẮC VẬN HÀNH CỐT LÕI (CORE BUSINESS RULES)

### Quy tắc 1: Lập lịch ngược JIT (Backward JIT Propagation)
Mọi kế hoạch bắt đầu từ thời điểm xuất hàng (`ship_deadline_hour`):
$$\text{Deadline Xuất Hàng} \longleftarrow \text{Đóng gói/Xuất thùng (-1h)} \longleftarrow \text{Thời gian Ép} \longleftarrow \text{Gá khuôn/Đổi màu (0.5h - 1.5h)} \longleftarrow \text{Sấy nhựa (2.0h - 4.5h)}$$
Nếu phễu sấy chưa hoàn tất chu kỳ nhiệt, hệ thống phát cờ cảnh báo `ALERT_SHORTAGE` hoặc `PREPARING`, chặn không cho phép khởi động máy.

### Quy tắc 2: Ràng buộc 1 con hàng - 1 máy trong kỳ kế hoạch
Một máy có thể chạy nhiều con hàng; một con hàng có thể tương thích nhiều máy; **nhưng trong 1 chu kỳ kế hoạch (24H), 1 con hàng CHỈ ĐƯỢC CHẠY 1 LẦN TRÊN 1 MÁY DUY NHẤT**. Ràng buộc này loại bỏ hoàn toàn việc chia nhỏ lô sản xuất, giảm thiểu số lần tháo lắp khuôn.

### Quy tắc 3: Quản lý 3 Chân kiềng (Three Pillars)
Trước khi phát lệnh chạy máy (`PROD`), hệ thống kiểm tra 3 điều kiện tiên quyết:
1. **Nguyên liệu (Material):** Hạt nhựa đã được nạp vào phễu sấy, đạt nhiệt độ quy định (80°C - 140°C), sấy đủ thời gian và kiểm tra cờ Dry-coat ($青○$).
2. **Bao bì (Box):** Đúng quy cách thùng (KLT, Carton, Khay xốp) và số lượng đã được chuẩn bị tại khu vực đệm trước ít nhất 1 giờ (`staging_lead_hours`).
3. **Nhân sự (Operator):** Có nhân sự trực ca phù hợp kỹ năng và phương thức vận hành.

### Quy tắc 4: Phân loại 2 chế độ đứng máy
- **Đứng theo con hàng (`BY_PRODUCT`):** Áp dụng cho các chi tiết khó, dung sai nhỏ, yêu cầu kiểm tra ngoại quan 100%, gọt bavia (ví dụ: các thợ tay nghề cao: Chí, Quỳnh, Quang, Thi, Bình, Tuyến).
- **Đứng theo cụm máy (`BY_MACHINE`):** Áp dụng cho máy tự động có robot gắp, công nhân kiểm soát cụm máy và thu gom sản phẩm (ví dụ: Thu, Cẩm, Hoàng, Yến, Soi).

### Quy tắc 5: Cơ chế Người chạy chuyền (Relief Operators)
Trong các khung giờ nghỉ ngơi (ăn trưa 12:00-13:00, ăn tối/ăn khuya), thợ chạy chuyền (Relief: Kawabata, Linh, Hùng A, Giang) sẽ thay thế thợ chính vận hành máy để duy trì nhiệt độ nòng ép, ngăn ngừa phế phẩm do nguội nòng.

### Quy tắc 6: Tự động ngắt điện tắt máy ($□$ 計画停止)
Khi hoàn thành sản lượng theo đơn hàng mà không có kế hoạch kế tiếp trong ca, hoặc khi thiếu người đứng máy ca đêm, Bộ Não tự động lên kế hoạch ngắt điện gia nhiệt và tắt máy để bảo vệ thiết bị và tiết kiệm điện năng.

### Quy tắc 7: Vòng lặp Tự học đệm an toàn (Self-Learning Safety Buffer Loop)
Cuối mỗi ca làm việc, thợ đứng máy báo cáo sản lượng thực tế và số lượng phế phẩm (`scraps`). Bộ Não tự động tính toán lại tỉ lệ hao hụt thực tế:
$$\text{Buffer Mới} = \min(15.0\%, \text{Buffer Cũ} + \text{Hao Hụt Phế Phẩm Thực Tế})$$
Giá trị này được lưu vĩnh viễn vào Database (`learning_feedback_logs`), đảm bảo các lần lập lịch tiếp theo tự động ép bù thêm sản lượng, cam kết **không bao giờ giao thiếu hàng cho khách**.
