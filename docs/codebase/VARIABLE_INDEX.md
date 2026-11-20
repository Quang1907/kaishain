# VARIABLE INDEX: DANH MỤC BIẾN VÀ HẰNG SỐ NGHIỆP VỤ
- **Mục đích:** Danh mục các biến toàn cục, hằng số cấu hình, biến môi trường và biến trạng thái then chốt.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ dự án `kaisha`.
- **Trạng thái:** VERIFIED

---

## 1. BIẾN MÔI TRƯỜNG & HẰNG SỐ CẤU HÌNH (SETTINGS)
| Tên biến / Hằng số | Kiểu dữ liệu | Giá trị mặc định | Ý nghĩa nghiệp vụ |
| :--- | :---: | :--- | :--- |
| `DATABASE_BACKEND` | string | `"sqlite"` | Chọn cơ sở dữ liệu thực thi: `"sqlite"` (chuyên dụng WAL) hoặc `"postgres"`. |
| `SQLITE_PATH` | string | `backend/database/factory_aps.db` | Đường dẫn vật lý của file SQLite Enterprise. |
| `POSTGRES_HOST` | string | `"localhost"` | Địa chỉ máy chủ PostgreSQL khi chạy ở chế độ doanh nghiệp. |
| `POSTGRES_PORT` | integer | `5432` | Cổng kết nối PostgreSQL Server. |
| `SERVER_HOST` | string | `"0.0.0.0"` | Địa chỉ lắng nghe của HTTP Application Server. |
| `SERVER_PORT` | integer | `8080` | Cổng mạng phục vụ ứng dụng (truy cập: http://localhost:8080). |
| `JWT_SECRET` | string | `"aps-brain-ultra-secure-key"` | Khóa bí mật dùng cho mã hóa token phiên. |
| `DEFAULT_TOKEN_EXPIRY_HOURS`| integer | `24` | Thời gian sống tối đa của một phiên đăng nhập (tiếng). |

---

## 2. HẰNG SỐ NGHIỆP VỤ XƯỞNG ÉP NHỰA
| Tên hằng số | Kiểu dữ liệu | Giá trị | Ý nghĩa nghiệp vụ |
| :--- | :---: | :---: | :--- |
| `MOLD_CHANGE_HOURS` | float | `1.0` | Thời gian chuẩn bị và gá khuôn (○ 型替) trên 1 máy ép. |
| `COLOR_CHANGE_HOURS` | float | `0.5` | Thời gian vệ sinh nòng và đổi màu hạt nhựa (△ 色替). |
| `BOX_STAGING_LEAD_HOURS`| float | `1.0` | Thời gian yêu cầu bao bì/thùng phải sẵn sàng trước giờ chạy. |
| `DEFAULT_DEFECT_BUFFER_PCT`| float | `3.0` | Tỉ lệ phế phẩm đệm ban đầu (%) khi chưa có dữ liệu tự học. |
| `MAX_DEFECT_BUFFER_PCT` | float | `15.0` | Giới hạn trần tối đa cho phép của đệm an toàn tự học. |
| `PLAN_START_HOUR` | float | `7.0` | Mốc thời gian bắt đầu một ngày kế hoạch xưởng (7:00 sáng). |
| `PLAN_END_HOUR` | float | `31.0` | Mốc thời gian kết thúc một ngày kế hoạch xưởng (7:00 sáng hôm sau). |
