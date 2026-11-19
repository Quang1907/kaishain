"""
Database Repository Facade (Clean Architecture Aggregator)
Hợp nhất các repository chuyên biệt thành một Facade duy nhất, đảm bảo tính mô-đun hóa nhưng tương thích 100%
"""
from typing import Optional
from backend.infrastructure.database.connection import DatabaseManager, db_manager
from backend.infrastructure.repositories.master_data_repo import MasterDataRepository
from backend.infrastructure.repositories.operator_repo import OperatorRepository
from backend.infrastructure.repositories.schedule_repo import ScheduleRepository
from backend.infrastructure.repositories.user_repo import UserRepository
from backend.infrastructure.repositories.workflow_repo import WorkflowRepository
from backend.infrastructure.repositories.feedback_repo import FeedbackRepository

class DatabaseRepositoryFacade(
    MasterDataRepository,
    OperatorRepository,
    ScheduleRepository,
    UserRepository,
    WorkflowRepository,
    FeedbackRepository,
):
    """Facade hợp nhất toàn bộ truy vấn cơ sở dữ liệu chuyên ngành xưởng ép nhựa"""
    def __init__(self, database_manager: Optional[DatabaseManager] = None):
        super().__init__(database_manager or db_manager)

repository = DatabaseRepositoryFacade()
