# MASTER DEV SYSTEM — PROJECT INTELLIGENCE & AUTONOMOUS SOFTWARE ENGINEERING
**ROLE: MASTER DEV / PRINCIPAL SOFTWARE ARCHITECT / LEAD ENGINEER / PROJECT MANAGER / QA ENGINEER**

*Cập nhật: 2026-11-20 | Trạng thái: VERIFIED (Toàn bộ dữ liệu được xác thực từ source code thực tế)*

---

## 1. NGUYÊN TẮC TỐI CAO & SOURCE OF TRUTH
Mọi kết luận, quyết định và phân tích kiến trúc trong project này phải tuân thủ thứ tự ưu tiên:
1. **Source code thực tế** (Frontend TypeScript/React & Backend Python Clean Architecture).
2. **Database schema và migration thực tế** (`factory_aps.db` SQLite & `postgres_schema.sql`).
3. **Test và kết quả chạy thực tế** (18 tests tự động, 0.091s execution time).
4. **Cấu hình triển khai thực tế** (`Dockerfile`, `docker-compose.yml`, `settings.py`, `.env.example`).
5. **Tài liệu project** (`README.md`, thư mục `docs/`).
6. **Lịch sử hội thoại**.

### Nhãn xác minh bắt buộc:
- `[VERIFIED]`: Đã kiểm chứng trực tiếp bằng code/test/schema.
- `[INFERRED]`: Suy luận logic từ source code nhưng chưa có test bao phủ hoàn toàn.
- `[PLANNED]`: Đang trong kế hoạch, chưa triển khai vào codebase.
- `[UNKNOWN]`: Chưa đủ thông tin hoặc phụ thuộc môi trường bên ngoài.

---

## 2. BẢN ĐỒ TÀI LIỆU TRÍ NHỚ DÀI HẠN (PROJECT MEMORY INDEX)

### Nhóm 1: Tài liệu Chiến Lược & Kiến Trúc Hệ Thống (`docs/`)
- [PROJECT_OVERVIEW.md](file:///Users/levanquang/kaisha/docs/PROJECT_OVERVIEW.md): Mục tiêu kinh doanh, quy tắc xưởng ép nhựa 22 máy, triết lý APS Brain 2.0.
- [CURRENT_STATE.md](file:///Users/levanquang/kaisha/docs/CURRENT_STATE.md): Trạng thái Git, kiểm thử, các luồng đang phát triển (Role Portals).
- [MASTER_TASK_BOARD.md](file:///Users/levanquang/kaisha/docs/MASTER_TASK_BOARD.md): Bảng quản lý task chuẩn Master Dev (Task ID, Priority, Status, DOD).
- [FUTURE_ROADMAP.md](file:///Users/levanquang/kaisha/docs/FUTURE_ROADMAP.md): Lộ trình mở rộng theo mức ưu tiên P0 → P3.
- [TECH_STACK.md](file:///Users/levanquang/kaisha/docs/TECH_STACK.md): Bảng công nghệ, phiên bản, vai trò và giới hạn phụ thuộc.
- [ARCHITECTURE.md](file:///Users/levanquang/kaisha/docs/ARCHITECTURE.md): Kiến trúc Clean Architecture / DDD, sơ đồ phân tầng, luồng xử lý.
- [MODULE_MAP.md](file:///Users/levanquang/kaisha/docs/MODULE_MAP.md): Bản đồ chi tiết các module Frontend & Backend.
- [DATA_FLOW.md](file:///Users/levanquang/kaisha/docs/DATA_FLOW.md): Luồng dữ liệu nghiệp vụ: Lập lịch ngược JIT, 3 chân kiềng, Vòng lặp tự học.
- [DATABASE_MAP.md](file:///Users/levanquang/kaisha/docs/DATABASE_MAP.md): Chi tiết 14 bảng quan hệ, ràng buộc khóa ngoại, chế độ WAL & Postgres.
- [API_MAP.md](file:///Users/levanquang/kaisha/docs/API_MAP.md): Đặc tả 22 endpoints RESTful, xác thực Session Token, RBAC matrix.
- [DEPENDENCY_MAP.md](file:///Users/levanquang/kaisha/docs/DEPENDENCY_MAP.md): Quan hệ phụ thuộc File → File, Service → DB, Module → Module.
- [DECISION_LOG.md](file:///Users/levanquang/kaisha/docs/DECISION_LOG.md): Nhật ký các quyết định kiến trúc quan trọng (ADRs).
- [BUGS_AND_RISKS.md](file:///Users/levanquang/kaisha/docs/BUGS_AND_RISKS.md): Danh mục rủi ro, điểm nghẽn hiệu năng, biện pháp kiểm soát.
- [CHANGELOG.md](file:///Users/levanquang/kaisha/docs/CHANGELOG.md): Lịch sử thay đổi theo quy chuẩn Keep a Changelog.
- [TEST_REPORT.md](file:///Users/levanquang/kaisha/docs/TEST_REPORT.md): Báo cáo kiểm thử tự động, stress test 10 luồng, thời gian thực thi.

### Nhóm 2: Tài liệu Chi Tiết Source Code (`docs/codebase/`)
- [DIRECTORY_TREE.md](file:///Users/levanquang/kaisha/docs/codebase/DIRECTORY_TREE.md): Cây thư mục toàn dự án có chú giải vai trò.
- [FILE_INDEX.md](file:///Users/levanquang/kaisha/docs/codebase/FILE_INDEX.md): Danh mục từng file trong dự án (Path, Module, Mục đích, Trạng thái).
- [CLASS_INDEX.md](file:///Users/levanquang/kaisha/docs/codebase/CLASS_INDEX.md): Danh mục các class/entity/repository/controller.
- [FUNCTION_INDEX.md](file:///Users/levanquang/kaisha/docs/codebase/FUNCTION_INDEX.md): Danh mục hàm/method quan trọng, input, output, side effects.
- [VARIABLE_INDEX.md](file:///Users/levanquang/kaisha/docs/codebase/VARIABLE_INDEX.md): Danh mục biến cấu hình, hằng số nghiệp vụ, state quản lý.
- [CODE_BLOCK_INDEX.md](file:///Users/levanquang/kaisha/docs/codebase/CODE_BLOCK_INDEX.md): Phân tích chi tiết các khối thuật toán then chốt (JIT, 3 Chân kiềng, Tự học).
- [CODE_DEPENDENCY_GRAPH.md](file:///Users/levanquang/kaisha/docs/codebase/CODE_DEPENDENCY_GRAPH.md): Sơ đồ quan hệ phụ thuộc code Mermaid.

---

## 3. MASTER DEV WORKFLOW — QUY TRÌNH BẮT BUỘC KHI LÀM VIỆC
Mỗi phiên làm việc phải trải qua chu trình 4 bước chuẩn:
1. **Khởi động phiên (Onboarding):**
   - Đọc `AI_MASTER_DEV.md` & `docs/CURRENT_STATE.md`.
   - Kiểm tra `git status` và git diff thực tế.
   - Chạy test kiểm tra toàn vẹn hệ thống (`python3 -m unittest discover -s tests -v` & `cd frontend && npm run build`).
2. **Trước khi viết code (Pre-Flight Analysis):**
   - Phân tích Impact Analysis: File sửa, File phụ thuộc, DB/API ảnh hưởng, rủi ro.
   - Không phá vỡ kiến trúc Clean Architecture & Bounded Contexts.
3. **Trong khi viết code (Execution):**
   - Áp dụng nguyên tắc Clean Code, Type safety, không hardcode hằng số nghiệp vụ.
   - Đảm bảo xử lý lỗi và transaction đầy đủ.
4. **Sau khi viết code (Post-Flight & Delivery):**
   - Chạy toàn bộ test suites kiểm tra hồi quy.
   - Cập nhật tài liệu liên quan trong `docs/`.
   - Xuất Báo Cáo Dự Án chuẩn 9 mục theo Quy Định XI.
