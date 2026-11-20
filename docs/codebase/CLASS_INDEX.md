# CLASS INDEX: DANH MỤC LỚP VÀ THỰC THỂ
- **Mục đích:** Danh mục chi tiết các class, dataclass, interface, trách nhiệm và quan hệ kế thừa.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ hệ thống Backend và Frontend.
- **Trạng thái:** VERIFIED

---

## 1. BACKEND CLASSES

### Tầng Domain (Domain Entities & Value Objects)
- `MaterialSpec` (`backend/domain/entities.py`):
  - *Trách nhiệm:* Chứa thông số kỹ thuật của hạt nhựa: mã hạt, màu, cờ Dry-coat ($青○$), nhiệt độ sấy bắt buộc (°C), giờ sấy bắt buộc, phễu sấy được gán.
- `BoxSpec` (`backend/domain/entities.py`):
  - *Trách nhiệm:* Quy cách bao bì: số cái/thùng, thời gian xuất thùng trước giờ chạy (`staging_lead_hours`).
- `Product` (`backend/domain/entities.py`):
  - *Trách nhiệm:* Chi tiết con hàng: cavity, cycle time (giây/shot), danh sách máy tương thích, chế độ đứng máy ưu tiên, đệm hao hụt an toàn (`defect_buffer_pct`).
- `Operator` (`backend/domain/entities.py`):
  - *Trách nhiệm:* Nhân sự: ca làm việc (Day/Night/Part-time), giờ vào/tan ca, bậc thợ, cờ chạy chuyền (`is_relief_operator`).
- `Machine` (`backend/domain/entities.py`):
  - *Trách nhiệm:* 22 máy ép nhựa: trọng tải (tonnage), công suất điện (kW), trạng thái hiện tại (`MachineStatus`).
- `JobBlock` (`backend/domain/entities.py`):
  - *Trách nhiệm:* Khối công việc trên Gantt: thời gian bắt đầu/kết thúc (7.0 - 31.0), loại sự kiện (PROD, ○, △, □), trạng thái 3 chân kiềng.
- `ShippingOrder` (`backend/domain/entities.py`):
  - *Trách nhiệm:* Lệnh xuất hàng: deadline giao hàng, khách hàng, số lượng đặt, đệm bảo hiểm sản lượng.
- `UserEntity` (`backend/domain/entities.py`):
  - *Trách nhiệm:* Tài khoản người dùng: username, role (`UserRole`), full_name, máy/nhiệm vụ được giao.

### Tầng Service & Algorithms
- `APSProductionBrain` (`backend/brain_optimizer.py`):
  - *Trách nhiệm:* Bộ não lập lịch ngược JIT, giải quyết bài toán tối ưu 1 hàng 1 máy, ngắt điện tắt máy tự động và vòng lặp tự học tăng đệm an toàn khi có phế phẩm.
- `FactoryResourceManager` (`backend/resource_manager.py`):
  - *Trách nhiệm:* Kiểm soát 3 chân kiềng: đánh giá nhiệt độ sấy, thùng đóng gói và nhân sự trực ca/chạy chuyền.
- `AuthService` (`backend/services/auth_service.py`):
  - *Trách nhiệm:* Xác thực đăng nhập, kiểm tra hash SHA256 kèm Salt, cấp phát và thu hồi Bearer Session Tokens.
- `WorkflowService` (`backend/services/workflow_service.py`):
  - *Trách nhiệm:* Thực thi nghiệp vụ thợ máy nghiệm thu thay khuôn 4 bước và quản lý nguyên liệu cấp phễu sấy.

### Tầng Infrastructure & Repositories
- `DatabaseManager` (`backend/infrastructure/database/connection.py`):
  - *Trách nhiệm:* Singleton quản lý kết nối cơ sở dữ liệu SQLite (WAL mode) hoặc PostgreSQL, xử lý connection pooling và transaction.
- `BaseRepository` (`backend/infrastructure/repositories/base_repository.py`):
  - *Trách nhiệm:* Cung cấp các hàm tiện ích thực thi câu lệnh SQL an toàn (execute, fetchall, fetchone, transaction context).
- `RepositoryFacade` (`backend/infrastructure/repositories/facade.py`):
  - *Trách nhiệm:* Cổng hợp nhất toàn bộ repositories con (ScheduleRepo, MasterDataRepo, WorkflowRepo, UserRepo, FeedbackRepo).

### Tầng Presentation & Routing
- `ThreadedHTTPServer` (`backend/server.py`):
  - *Trách nhiệm:* Server HTTP đa luồng hỗ trợ `allow_reuse_address` và `daemon_threads`.
- `EnterpriseRequestHandler` (`backend/server.py`):
  - *Trách nhiệm:* Xử lý request HTTP, đính kèm headers CORS, phân tách Bearer token từ Authorization header/Query params.
- `ApiRouter` (`backend/api/router.py`):
  - *Trách nhiệm:* Điều phối request GET/POST tới các Controllers chuyên biệt.
- `StaticHandler` (`backend/api/static_handler.py`):
  - *Trách nhiệm:* Phục vụ tài nguyên tĩnh của Vite dist và fallback SPA về `index.html`.
