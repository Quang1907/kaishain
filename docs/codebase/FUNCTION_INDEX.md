# FUNCTION INDEX: DANH MỤC HÀM VÀ PHƯƠNG THỨC
- **Mục đích:** Danh mục các hàm, phương thức quan trọng, tham số, giá trị trả về và tác động phụ (Side effects).
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ hệ sinh thái Kaisha APS.
- **Trạng thái:** VERIFIED

---

## 1. CÁC HÀM THUẬT TOÁN & BỘ NÃO APS
- `APSProductionBrain.optimize_schedule(date_str: str) -> Dict[str, Any]`
  - *Mục đích:* Lập lịch sản xuất tự động cho 22 máy ép theo phương pháp lùi JIT.
  - *Input:* `date_str` (ngày cần tối ưu, ví dụ: '2026-11-13').
  - *Output:* Dictionary chứa lịch trình mới tối ưu, danh sách job blocks, và chỉ số hiệu năng.
  - *Side effects:* Ghi bản ghi mới vào bảng `schedules` và `job_blocks`.
- `APSProductionBrain.record_learning_feedback(machine_id: str, product_code: str, scraps: int) -> float`
  - *Mục đích:* Tự động tính toán lại tỉ lệ hao hụt an toàn dựa trên số phế phẩm thực tế phát sinh.
  - *Input:* `machine_id`, `product_code`, `scraps` (số lượng phế phẩm báo cáo).
  - *Output:* Hệ số đệm an toàn mới (`new_buffer_pct`).
  - *Side effects:* Lưu lịch sử vào `learning_feedback_logs` và cập nhật trường `defect_buffer_pct` trong bảng `products`.
- `FactoryResourceManager.evaluate_job_readiness(job: JobBlock) -> Dict[str, ReadinessStatus]`
  - *Mục đích:* Đánh giá độc lập 3 chân kiềng trước giờ khởi động máy ép.
  - *Input:* Khối công việc `job`.
  - *Output:* Trạng thái sẵn sàng của: `material` (READY/PREPARING/SHORTAGE), `box`, `operator`.

---

## 2. CÁC HÀM XÁC THỰC & BẢO MẬT
- `backend.core.security.hash_password(password: str, salt: str) -> str`
  - *Mục đích:* Băm mật khẩu bằng thuật toán SHA256 kết hợp muối (Salt) bảo mật cao.
- `backend.core.security.verify_password(password: str, salt: str, password_hash: str) -> bool`
  - *Mục đích:* Kiểm tra mật khẩu người dùng nhập vào có khớp với hash trong Database hay không.
- `backend.core.security.create_session_token(user: UserEntity) -> str`
  - *Mục đích:* Cấp phát chuỗi token phiên ngẫu nhiên (UUID4 hex), lưu vào cache phiên với thời hạn 24 giờ.
- `backend.core.security.verify_token(token: str) -> Optional[UserEntity]`
  - *Mục đích:* Xác thực token gửi lên trong header Authorization Bearer, trả về thực thể User nếu hợp lệ.

---

## 3. CÁC HÀM PHÍA FRONTEND
- `useRouter()` (`frontend/src/core/router/useRouter.ts`)
  - *Mục đích:* Trả về `{ currentPath, navigate, isPath }` điều hướng URL không reload trang.
- `useAppStore()` (`frontend/src/app/store/useAppStore.ts`)
  - *Mục đích:* Zustand hook quản lý: `currentDate`, `currentHour`, `currentUser`, `token`, `setDate`, `setCurrentUser`, `logout`.
