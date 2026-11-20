# DIRECTORY TREE: CÂY THƯ MỤC DỰ ÁN CÓ CHÚ GIẢI
- **Mục đích:** Đặc tả cấu trúc tổ chức toàn bộ thư mục của dự án, module sở hữu và vai trò kiến trúc.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ repository `kaisha`.
- **Trạng thái:** VERIFIED

---

```
kaisha/
├── AI_MASTER_DEV.md         # Hiến chương Master Dev System & Điều hành cao nhất
├── README.md                # Tài liệu tổng quan gốc của dự án
├── Dockerfile               # Cấu hình containerization cho ứng dụng
├── docker-compose.yml       # Điều phối dịch vụ (App Server + PostgreSQL)
├── start.sh                 # Script tiện ích khởi động server nhanh
├── .env.example             # Mẫu biến môi trường cấu hình hệ thống
├── .gitignore               # Bộ lọc loại trừ file build, cache, dependencies
│
├── backend/                 # TẦNG BACKEND (Clean Architecture Python)
│   ├── server.py            # EntryPoint HTTP Server đa luồng (ThreadingMixIn)
│   ├── brain_optimizer.py   # Thuật toán cốt lõi APS Brain JIT & Tự học
│   ├── resource_manager.py  # Quản lý 3 chân kiềng (Sấy nhựa, Thùng, Nhân sự)
│   ├── data_store.py        # Seed data gốc chuẩn hóa từ 4 ảnh chụp bảng kế hoạch
│   ├── models.py            # Legacy models tương thích ngược
│   ├── auth.py              # Legacy auth adapter
│   ├── requirements.txt     # Danh mục phụ thuộc (psycopg2-binary...)
│   │
│   ├── config/              # Cấu hình môi trường
│   │   ├── __init__.py
│   │   └── settings.py      # Đọc biến môi trường, đường dẫn DB, port, secret
│   │
│   ├── core/                # Tiện ích cốt lõi dùng chung
│   │   ├── exceptions.py    # Phân cấp ngoại lệ ứng dụng (AppException...)
│   │   ├── response.py      # Chuẩn hóa JSON Response & Error wrapper
│   │   └── security.py      # Hash SHA256 kèm Salt & Tạo Token phiên
│   │
│   ├── domain/              # Thực thể và mô hình nghiệp vụ (DDD)
│   │   ├── entities.py      # Data classes (Machine, Product, Order, User...)
│   │   └── enums.py         # Enums chuẩn (MachineStatus, OperatorMode...)
│   │
│   ├── infrastructure/      # Tầng hạ tầng dữ liệu và lưu trữ
│   │   ├── database/
│   │   │   └── connection.py # Singleton DatabaseManager (SQLite / Postgres)
│   │   └── repositories/    # Triển khai Repository Pattern
│   │       ├── base_repository.py   # Lớp cơ sở hỗ trợ CRUD và mapping
│   │       ├── facade.py            # Master Repository Facade
│   │       ├── master_data_repo.py  # Quản lý Máy, Hàng, Vật liệu, Thùng
│   │       ├── operator_repo.py     # Quản lý Nhân sự & Phân ca
│   │       ├── schedule_repo.py     # Quản lý Lịch trình & JobBlocks
│   │       ├── user_repo.py         # Quản lý Tài khoản & Phân quyền
│   │       ├── workflow_repo.py     # Quản lý Nghiệm thu Khuôn & Cấp sấy
│   │       └── feedback_repo.py     # Quản lý Nhật ký học máy phế phẩm
│   │
│   ├── services/            # Tầng xử lý nghiệp vụ (Application Services)
│   │   ├── auth_service.py     # Xử lý đăng nhập, phiên và quyền hạn
│   │   ├── brain_service.py    # Dịch vụ tối ưu hóa lịch trình JIT
│   │   ├── resource_service.py # Dịch vụ đánh giá 3 chân kiềng
│   │   └── workflow_service.py # Dịch vụ phê duyệt thợ máy & nguyên liệu
│   │
│   ├── api/                 # Giao diện lập trình RESTful & Static Assets
│   │   ├── router.py        # ApiRouter điều phối URL tới Controllers
│   │   ├── static_handler.py# Phục vụ Single Page Application & Static files
│   │   └── controllers/     # Các controller đón nhận và phản hồi HTTP
│   │       ├── auth_controller.py
│   │       ├── master_data_controller.py
│   │       ├── schedule_controller.py
│   │       ├── workflow_controller.py
│   │       └── system_controller.py
│   │
│   └── database/            # DDL, Migrations & SQLite database vật lý
│       ├── factory_aps.db   # File cơ sở dữ liệu SQLite chuyên dụng
│       ├── config.py        # Cấu hình kết nối DB nội bộ
│       ├── db_manager.py    # Quản lý kết nối tương thích
│       ├── db_manager_sqlite_ddl.py # Tạo cấu trúc bảng SQLite
│       ├── db_seeder.py     # Nạp dữ liệu ban đầu vào DB
│       ├── repository.py    # Repository tương thích cũ
│       └── postgres_schema.sql # Schema chuẩn mực cho PostgreSQL Enterprise
│
├── frontend/                # TẦNG FRONTEND (React 18 + Vite + TypeScript)
│   ├── index.html           # File HTML gốc của SPA
│   ├── package.json         # Danh mục dependencies và scripts build
│   ├── tsconfig.json        # Cấu hình biên dịch TypeScript
│   ├── vite.config.ts       # Cấu hình đóng gói Vite & chunk splitting
│   ├── tailwind.config.js   # Cấu hình theme Dark Mode xưởng sản xuất
│   ├── postcss.config.js    # Cấu hình PostCSS
│   │
│   ├── dist/                # Thư mục build production (HTML, CSS, JS chunks)
│   │
│   └── src/                 # Toàn bộ mã nguồn giao diện
│       ├── app/             # Cấu hình ứng dụng toàn cục
│       │   ├── App.tsx      # Root component điều phối 4 Portals theo URL/Role
│       │   ├── main.tsx     # EntryPoint ReactDOM
│       │   ├── store/       # Zustand Store toàn cục (useAppStore.ts)
│       │   └── providers/   # React Query Provider
│       │
│       ├── core/            # Hạ tầng dùng chung
│       │   ├── api/         # Axios client & danh mục endpoints
│       │   ├── config/      # Hằng số cấu hình toàn cục
│       │   ├── router/      # Custom HTML5 History Router (useRouter.ts)
│       │   └── types/       # Kiểu dữ liệu TypeScript dùng chung
│       │
│       ├── features/        # Các phân hệ nghiệp vụ độc lập (Bounded Contexts)
│       │   ├── admin/       # Cổng Quản Lý Điều Hành Tổng Thể (/admin)
│       │   ├── auth/        # Đăng nhập & Xác thực (/login)
│       │   ├── gantt-schedule/ # Bảng Gantt 22 máy & Trục thời gian 7h-31h
│       │   ├── technician/  # Cổng Thợ Máy Nghiệm Thu Thay Khuôn (/technician)
│       │   ├── material/    # Cổng Quản Lý Nguyên Liệu & Phễu Sấy (/material)
│       │   ├── operator-workstation/ # Bàn Làm Việc Đứng Máy (/operator)
│       │   ├── shipping-orders/   # Quản lý Lệnh Xuất Hàng JIT
│       │   ├── machines/    # Danh mục & Trạng thái 22 Máy Ép
│       │   ├── products-bom/# Danh mục 28 Con Hàng & Định Mức BOM
│       │   ├── operators/   # Danh mục 24 Nhân Sự & Phân Ca
│       │   └── database-explorer/ # Thống kê DB, Feedback Logs & Reset
│       │
│       └── shared/          # Thư viện UI và tiện ích dùng chung
│           ├── components/ui/     # Button, Card, Badge, Modal...
│           ├── components/layout/ # Header, NavigationTabs, StatusBar
│           └── utils/             # Formatters, class merge helper (cn)
│
├── tests/                   # BỘ KIỂM THỬ TỰ ĐỘNG (Automated Test Suites)
│   ├── test_brain.py        # Kiểm thử 22 máy, JIT, 3 chân kiềng, tự học
│   ├── test_enterprise_postgres.py # Kiểm thử toàn vẹn quan hệ & Stress test 10 luồng
│   └── test_rbac_and_roles.py      # Kiểm thử mã hóa mật khẩu, session token & RBAC
│
└── docs/                    # HỆ THỐNG TRÍ NHỚ DÀI HẠN (Project Memory)
    ├── PROJECT_OVERVIEW.md
    ├── CURRENT_STATE.md
    ├── MASTER_TASK_BOARD.md
    ├── FUTURE_ROADMAP.md
    ├── TECH_STACK.md
    ├── ARCHITECTURE.md
    ├── MODULE_MAP.md
    ├── DATA_FLOW.md
    ├── DATABASE_MAP.md
    ├── API_MAP.md
    ├── DEPENDENCY_MAP.md
    ├── DECISION_LOG.md
    ├── BUGS_AND_RISKS.md
    ├── CHANGELOG.md
    ├── TEST_REPORT.md
    └── codebase/            # Danh mục chi tiết mã nguồn
        ├── DIRECTORY_TREE.md
        ├── FILE_INDEX.md
        ├── CLASS_INDEX.md
        ├── FUNCTION_INDEX.md
        ├── VARIABLE_INDEX.md
        ├── CODE_BLOCK_INDEX.md
        └── CODE_DEPENDENCY_GRAPH.md
```
