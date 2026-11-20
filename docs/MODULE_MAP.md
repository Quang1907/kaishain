# MODULE MAP: BẢN ĐỒ CÁC MODULE HỆ THỐNG
- **Mục đích:** Danh mục chi tiết các module trong Backend và Frontend, chức năng cốt lõi và các file trực thuộc.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ dự án `kaisha`.
- **Trạng thái:** VERIFIED

---

## 1. BACKEND MODULES
```
backend/
├── api/                   # Điều hướng HTTP và Controllers
│   ├── router.py          # ApiRouter phân giải GET/POST sang Controllers
│   ├── static_handler.py  # Phục vụ file tĩnh Vite dist và SPA fallback
│   └── controllers/       # Các Controller xử lý request/response
│       ├── auth_controller.py        # Đăng nhập, đăng xuất, lấy user hiện tại
│       ├── master_data_controller.py # CRUD Máy, Hàng, Nguyên liệu, Thùng, Nhân sự
│       ├── schedule_controller.py    # Lịch trình, Tối ưu hóa JIT, Lệnh xuất hàng
│       ├── workflow_controller.py    # Nghiệm thu thay khuôn & Cấp phát phễu sấy
│       └── system_controller.py      # Healthcheck, thống kê DB, seed, reset
├── services/              # Tầng xử lý nghiệp vụ trung tâm
│   ├── auth_service.py       # Xác thực mật khẩu salted, session token cache
│   ├── brain_service.py      # Tương tác với bộ não APS Brain Optimizer
│   ├── resource_service.py   # Tương tác với Resource Manager (3 chân kiềng)
│   └── workflow_service.py   # Quy trình ký nghiệm thu thợ máy & nguyên liệu
├── domain/                # Thực thể và logic nghiệp vụ thuần túy
│   ├── entities.py        # Machine, Product, MaterialSpec, BoxSpec, Operator, JobBlock...
│   └── enums.py           # MachineStatus, OperatorMode, ReadinessStatus, EventType...
├── infrastructure/        # Tương tác cơ sở dữ liệu và lưu trữ
│   ├── database/connection.py # Singleton DatabaseManager (SQLite / Postgres)
│   └── repositories/      # Repository Pattern trừu tượng hóa SQL
│       ├── facade.py            # Master Repository Facade
│       ├── base_repository.py   # Base CRUD helper
│       ├── master_data_repo.py  # SQL cho Máy, Hàng, Vật tư, Thùng
│       ├── operator_repo.py     # SQL cho Nhân sự & Phân ca
│       ├── schedule_repo.py     # SQL cho Lịch trình, JobBlocks, Đơn hàng
│       ├── user_repo.py         # SQL cho Bảng Users & Auth
│       ├── workflow_repo.py     # SQL cho Nghiệm thu Khuôn & Cấp sấy
│       └── feedback_repo.py     # SQL cho Vòng lặp học máy phế phẩm
├── core/                  # Tiện ích nền tảng
│   ├── exceptions.py      # AppException, NotFoundException, ValidationException
│   ├── response.py        # Chuẩn hóa JSON Response & HTTP Error payload
│   └── security.py        # Hash mật khẩu SHA256 kèm Salt & Tạo Token
├── config/                # Cấu hình môi trường
│   └── settings.py        # Đọc biến môi trường, đường dẫn DB, port, JWT secret
├── brain_optimizer.py     # Thuật toán cốt lõi lập lịch ngược JIT & Tự học
├── resource_manager.py    # Quản lý 3 chân kiềng (Phễu sấy, Thùng, Thợ)
├── data_store.py          # Seed data ban đầu chuẩn hóa từ 4 ảnh chụp xưởng
└── server.py              # EntryPoint máy chủ HTTP đa luồng
```

---

## 2. FRONTEND MODULES (FEATURE-SLICED DESIGN)
```
frontend/src/
├── app/                   # Cấu hình ứng dụng toàn cục
│   ├── App.tsx            # Root component điều phối 4 Cổng Phân Quyền
│   ├── main.tsx           # EntryPoint gắn kết React DOM
│   ├── store/             # Zustand Store: useAppStore (Date, User, View, Token)
│   └── providers/         # TanStack Query Client Provider
├── core/                  # Thành phần hạ tầng và tiện ích dùng chung
│   ├── api/client.ts      # Axios wrapper có Bearer Token Interceptor
│   ├── api/endpoints.ts   # Hằng số đường dẫn API
│   ├── config/constants.ts# Hằng số màu sắc, nhãn trạng thái xưởng
│   ├── router/useRouter.ts# HTML5 History API Client Router
│   └── types/             # TypeScript Common Interfaces & Entities
├── features/              # Các phân hệ nghiệp vụ độc lập (Bounded Contexts)
│   ├── admin/             # Cổng Quản Lý Điều Hành Tổng Thể
│   ├── auth/              # Đăng nhập, Modal Auth, Phân quyền
│   ├── gantt-schedule/    # Bảng Gantt 22 máy, Timeline Slider 7h-31h
│   ├── technician/        # Cổng Thợ Máy & Nghiệm Thu Thay Khuôn
│   ├── material/          # Cổng Quản Lý Nguyên Liệu & Phễu Sấy
│   ├── operator-workstation/ # Bàn Làm Việc Thợ Đứng Máy & Báo Cáo Ca
│   ├── shipping-orders/   # Quản lý Đơn Hàng Xuất Khẩu JIT
│   ├── machines/          # Danh mục & Trạng thái 22 Máy Ép
│   ├── products-bom/      # Danh mục 28 Con Hàng & Định Mức BOM
│   ├── operators/         # Danh mục 24 Nhân Sự & Phân Ca
│   └── database-explorer/ # Thống kê bảng, Logs Học Máy & Nạp Lại Dữ Liệu
└── shared/                # Thư viện dùng chung
    ├── components/ui/     # Button, Card, Badge, Modal...
    ├── components/layout/ # Header, NavigationTabs, StatusBar
    └── utils/             # Formatters thời gian, Classnames helper (cn)
```
