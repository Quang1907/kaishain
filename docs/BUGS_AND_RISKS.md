# BUGS AND RISKS: DANH MỤC LỖI VÀ RỦI RO HỆ THỐNG
- **Mục đích:** Nhận diện các điểm nghẽn tiềm ẩn, rủi ro kỹ thuật, lỗ hổng bảo mật và biện pháp khắc phục.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ dự án `kaisha`.
- **Trạng thái:** VERIFIED

---

## 1. RỦI RO ĐÃ KIỂM SOÁT (MITIGATED RISKS)
| ID | Rủi ro nhận diện | Mức độ | Biện pháp kỹ thuật đã áp dụng | Trạng thái |
| :--- | :--- | :---: | :--- | :---: |
| **RSK-01** | Deadlock khi nhiều luồng ghi đồng thời vào SQLite | Cao | Kích hoạt chế độ `WAL (Write-Ahead Logging)` và `busy_timeout = 5000ms`. Stress test 10 luồng đồng thời đạt 100% thành công. | `RESOLVED` |
| **RSK-02** | Dữ liệu mồ côi khi xóa Schedule | Trung bình | Kích hoạt `PRAGMA foreign_keys = ON;` và ràng buộc `ON DELETE CASCADE` trên bảng `job_blocks`. | `RESOLVED` |
| **RSK-03** | Rò rỉ thông tin đăng nhập trong LocalStorage | Trung bình | Sử dụng Salted SHA256 mật khẩu, token có thời hạn 24H, tự động xóa token khi phiên làm việc không hợp lệ. | `RESOLVED` |
| **RSK-04** | Trễ hạn giao hàng do phế phẩm không lường trước | Cao | Cơ chế Tự học đệm an toàn tự động tăng `buffer_pct` ngay sau khi công nhân báo phế phẩm cuối ca. | `RESOLVED` |

---

## 2. RỦI RO TIỀM ẨN VÀ KẾ HOẠCH DỰ PHÒNG (OPEN RISKS)
| ID | Rủi ro tiềm ẩn | Mức độ | Kế hoạch dự phòng |
| :--- | :--- | :---: | :--- |
| **RSK-05** | Mất kết nối mạng tại xưởng khi công nhân báo ca | Trung bình | Cần bổ sung Offline Cache (Service Worker / PWA) để lưu tạm báo cáo tại LocalStorage khi mất mạng, tự động đẩy lên khi có mạng lại. |
| **RSK-06** | Thao tác nhầm lẫn do trùng tên tài khoản công nhân | Thấp | Bổ sung hình ảnh avatar và mã thẻ nhân viên (Badge ID) hiển thị rõ trên thanh Header của Operator Portal. |
