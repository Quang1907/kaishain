# CODE DEPENDENCY GRAPH: SƠ ĐỒ PHỤ THUỘC CODE
- **Mục đích:** Trực quan hóa quan hệ phụ thuộc giữa các file và tầng kiến trúc bằng Mermaid Graph.
- **Ngày cập nhật:** 2026-11-20
- **Phạm vi:** Toàn bộ dự án `kaisha`.
- **Trạng thái:** VERIFIED

---

## 1. SƠ ĐỒ PHỤ THUỘC TẦNG BACKEND (MERMAID)
```mermaid
graph TD
    Server["server.py (HTTP Server)"] --> Router["api/router.py"]
    Server --> Static["api/static_handler.py"]
    Server --> DBConn["infrastructure/database/connection.py"]
    Server --> Settings["config/settings.py"]

    Router --> AuthCtrl["controllers/auth_controller.py"]
    Router --> SchedCtrl["controllers/schedule_controller.py"]
    Router --> MasterCtrl["controllers/master_data_controller.py"]
    Router --> WorkCtrl["controllers/workflow_controller.py"]
    Router --> SysCtrl["controllers/system_controller.py"]

    AuthCtrl --> AuthService["services/auth_service.py"]
    SchedCtrl --> BrainService["services/brain_service.py"]
    WorkCtrl --> WorkService["services/workflow_service.py"]

    BrainService --> Brain["brain_optimizer.py (APS JIT Brain)"]
    BrainService --> Facade["infrastructure/repositories/facade.py"]
    WorkService --> Facade
    AuthService --> Facade

    Facade --> ScheduleRepo["repositories/schedule_repo.py"]
    Facade --> MasterRepo["repositories/master_data_repo.py"]
    Facade --> UserRepo["repositories/user_repo.py"]
    Facade --> FeedbackRepo["repositories/feedback_repo.py"]

    ScheduleRepo --> DBConn
    MasterRepo --> DBConn
    UserRepo --> DBConn
    FeedbackRepo --> DBConn

    DBConn --> DBFile[("factory_aps.db (SQLite WAL) / PostgreSQL")]
```

---

## 2. SƠ ĐỒ PHỤ THUỘC TẦNG FRONTEND (MERMAID)
```mermaid
graph TD
    App["App.tsx (Root Portal Dispatcher)"] --> RouterHook["core/router/useRouter.ts"]
    App --> Store["app/store/useAppStore.ts"]

    App -->|/login| Login["features/auth/LoginPage.tsx"]
    App -->|/admin| Admin["features/admin/AdminPortalLayout.tsx"]
    App -->|/technician| Tech["features/technician/TechnicianPortalLayout.tsx"]
    App -->|/material| Mat["features/material/MaterialPortalLayout.tsx"]
    App -->|/operator| Op["features/operator-workstation/OperatorPortalLayout.tsx"]

    Admin --> Gantt["features/gantt-schedule/GanttScheduleView.tsx"]
    Admin --> Products["features/products-bom/ProductsBomView.tsx"]
    Admin --> Machines["features/machines/MachineListView.tsx"]
    Admin --> Orders["features/shipping-orders/ShippingOrdersView.tsx"]
    Admin --> DbExp["features/database-explorer/DatabaseExplorerView.tsx"]

    Gantt --> SchedApi["features/gantt-schedule/api/scheduleApi.ts"]
    Products --> ProdApi["features/products-bom/api/productsApi.ts"]
    Machines --> MachApi["features/machines/api/machinesApi.ts"]
    Tech --> TechApi["features/technician/api/technicianApi.ts"]
    Mat --> MatApi["features/material/api/materialApi.ts"]
    Op --> WorkApi["features/operator-workstation/api/workstationApi.ts"]

    SchedApi --> Client["core/api/client.ts (Axios + Bearer Token)"]
    ProdApi --> Client
    MachApi --> Client
    TechApi --> Client
    MatApi --> Client
    WorkApi --> Client
```
