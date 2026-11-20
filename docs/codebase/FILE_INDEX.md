# FILE INDEX: DANH MỤC TỆP TIN DỰ ÁN
- **Mục đích:** Lập danh mục chi tiết từng tệp tin trong dự án, ngôn ngữ, module sở hữu, vai trò và trạng thái.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ repository `kaisha`.
- **Trạng thái:** VERIFIED

---

| STT | Đường dẫn tệp tin | Ngôn ngữ | Module | Vai trò & Mục đích | Trạng thái |
| :---: | :--- | :---: | :--- | :--- | :---: |
| 1 | `backend/server.py` | Python | Backend Core | EntryPoint HTTP Server đa luồng, xử lý CORS, Token và định tuyến tĩnh/API | `COMPLETED` |
| 2 | `backend/brain_optimizer.py` | Python | APS Brain | Thuật toán lập lịch ngược JIT, ràng buộc 1 hàng 1 máy, tự học bù phế phẩm | `COMPLETED` |
| 3 | `backend/resource_manager.py` | Python | Services | Đánh giá 3 chân kiềng (Phễu sấy nhựa, Thùng đóng gói, Thợ đứng máy) | `COMPLETED` |
| 4 | `backend/data_store.py` | Python | Seed Data | Dữ liệu gốc chuẩn hóa từ 4 ảnh chụp xưởng ngày 11/12 và 11/13 | `COMPLETED` |
| 5 | `backend/config/settings.py` | Python | Config | Cấu hình tham số môi trường, đường dẫn DB, port, JWT secret | `COMPLETED` |
| 6 | `backend/core/exceptions.py` | Python | Core | Định nghĩa các lớp ngoại lệ nghiệp vụ (AppException, Validation...) | `COMPLETED` |
| 7 | `backend/core/response.py` | Python | Core | Chuẩn hóa JSON Response envelope và serialize dữ liệu | `COMPLETED` |
| 8 | `backend/core/security.py` | Python | Core | Băm mật khẩu SHA256 kèm Salt ngẫu nhiên và quản lý Session Token | `COMPLETED` |
| 9 | `backend/domain/entities.py` | Python | Domain | Data classes: Machine, Product, MaterialSpec, BoxSpec, Operator, JobBlock | `COMPLETED` |
| 10 | `backend/domain/enums.py` | Python | Domain | Enums: MachineStatus, OperatorMode, ReadinessStatus, EventType, UserRole | `COMPLETED` |
| 11 | `backend/infrastructure/database/connection.py` | Python | Infra | Singleton DatabaseManager kết nối SQLite WAL hoặc PostgreSQL | `COMPLETED` |
| 12 | `backend/infrastructure/repositories/base_repository.py` | Python | Infra | Lớp Repository cơ sở thực thi câu lệnh SQL | `COMPLETED` |
| 13 | `backend/infrastructure/repositories/facade.py` | Python | Infra | Master Repository Facade gom cụm toàn bộ repositories con | `COMPLETED` |
| 14 | `backend/infrastructure/repositories/master_data_repo.py` | Python | Infra | Thao tác SQL với Máy, Hàng, Vật tư, Thùng | `COMPLETED` |
| 15 | `backend/infrastructure/repositories/operator_repo.py` | Python | Infra | Thao tác SQL với Nhân sự và Khung giờ nghỉ ngơi | `COMPLETED` |
| 16 | `backend/infrastructure/repositories/schedule_repo.py` | Python | Infra | Thao tác SQL với Lịch trình, JobBlocks và Lệnh xuất hàng | `COMPLETED` |
| 17 | `backend/infrastructure/repositories/user_repo.py` | Python | Infra | Thao tác SQL với Bảng Users và phân quyền | `COMPLETED` |
| 18 | `backend/infrastructure/repositories/workflow_repo.py` | Python | Infra | Thao tác SQL với Nhật ký nghiệm thu khuôn và cấp sấy | `COMPLETED` |
| 19 | `backend/infrastructure/repositories/feedback_repo.py` | Python | Infra | Thao tác SQL với Nhật ký học máy bù phế phẩm | `COMPLETED` |
| 20 | `backend/services/auth_service.py` | Python | Services | Xác thực đăng nhập, kiểm tra mật khẩu salted và quản lý token | `COMPLETED` |
| 21 | `backend/services/brain_service.py` | Python | Services | Kết nối Controller với APS Production Brain Optimizer | `COMPLETED` |
| 22 | `backend/services/resource_service.py` | Python | Services | Kết nối Controller với Resource Manager 3 chân kiềng | `COMPLETED` |
| 23 | `backend/services/workflow_service.py` | Python | Services | Thực thi quy trình ký duyệt nghiệm thu thợ máy & cấp nguyên liệu | `COMPLETED` |
| 24 | `backend/api/router.py` | Python | API | Dispatcher phân phối yêu cầu HTTP GET/POST tới Controllers | `COMPLETED` |
| 25 | `backend/api/static_handler.py` | Python | API | Phục vụ các tệp tin tĩnh Vite dist và hỗ trợ routing SPA | `COMPLETED` |
| 26 | `backend/api/controllers/auth_controller.py` | Python | API | Xử lý request Login, Logout, Current User | `COMPLETED` |
| 27 | `backend/api/controllers/master_data_controller.py` | Python | API | Xử lý request CRUD Máy, Hàng, Vật tư, Thùng, Nhân sự | `COMPLETED` |
| 28 | `backend/api/controllers/schedule_controller.py` | Python | API | Xử lý request Lịch trình, Tối ưu hóa JIT, Đơn hàng | `COMPLETED` |
| 29 | `backend/api/controllers/workflow_controller.py` | Python | API | Xử lý request Nghiệm thu thay khuôn & Cấp phễu sấy | `COMPLETED` |
| 30 | `backend/api/controllers/system_controller.py` | Python | API | Xử lý request Healthcheck, Thống kê DB, Seed, Reset | `COMPLETED` |
| 31 | `backend/database/factory_aps.db` | SQLite | Database | Cơ sở dữ liệu SQLite vật lý chế độ WAL | `COMPLETED` |
| 32 | `backend/database/postgres_schema.sql` | SQL | Database | Cấu trúc DDL hoàn chỉnh cho PostgreSQL Enterprise | `COMPLETED` |
| 33 | `frontend/src/app/App.tsx` | TypeScript | App Core | Root component điều phối 4 Portals theo URL thực tế | `COMPLETED` |
| 34 | `frontend/src/core/router/useRouter.ts` | TypeScript | Router | Custom HTML5 History API Client Router | `COMPLETED` |
| 35 | `frontend/src/app/store/useAppStore.ts` | TypeScript | State | Zustand global store: ngày, người dùng, token, view | `COMPLETED` |
| 36 | `frontend/src/features/admin/components/AdminPortalLayout.tsx` | TypeScript | Admin Portal | Layout tổng thể Cổng Quản Lý Điều Hành (/admin) | `COMPLETED` |
| 37 | `frontend/src/features/technician/components/TechnicianPortalLayout.tsx`| TypeScript | Tech Portal | Layout Cổng Thợ Máy Nghiệm Thu Thay Khuôn (/technician) | `COMPLETED` |
| 38 | `frontend/src/features/material/components/MaterialPortalLayout.tsx` | TypeScript | Mat Portal | Layout Cổng Quản Lý Nguyên Liệu & Phễu Sấy (/material) | `COMPLETED` |
| 39 | `frontend/src/features/operator-workstation/components/OperatorPortalLayout.tsx`| TypeScript | Op Portal | Layout Bàn Làm Việc Đứng Máy & Báo Cáo Ca (/operator) | `COMPLETED` |
| 40 | `frontend/src/features/auth/components/LoginPage.tsx` | TypeScript | Auth | Trang đăng nhập phân quyền chuyên dụng có bộ chọn demo | `COMPLETED` |
| 41 | `frontend/src/features/gantt-schedule/components/GanttBoard.tsx` | TypeScript | Gantt | Bảng Gantt trực quan 22 máy ép với trục thời gian 7h-31h | `COMPLETED` |
| 42 | `tests/test_brain.py` | Python | QA Tests | Unit test 22 máy, JIT, 3 chân kiềng, tự học | `COMPLETED` |
| 43 | `tests/test_enterprise_postgres.py` | Python | QA Tests | Unit test toàn vẹn quan hệ & Stress test 10 luồng | `COMPLETED` |
| 44 | `tests/test_rbac_and_roles.py` | Python | QA Tests | Unit test xác thực mật khẩu, session token & RBAC | `COMPLETED` |
