"""
Legacy Database Repository Facade
Toàn bộ repository đã được phân chia mô-đun hóa rõ ràng theo chuẩn Clean Architecture tại `backend.infrastructure.repositories`
"""
from backend.infrastructure.repositories.facade import DatabaseRepositoryFacade, repository

DatabaseRepository = DatabaseRepositoryFacade

__all__ = ["DatabaseRepository", "repository"]
