"""
Domain & Application Exceptions
Định nghĩa hệ thống ngoại lệ phân lớp chuẩn Clean Architecture
"""

class AppException(Exception):
    """Lớp ngoại lệ cơ sở cho toàn hệ thống"""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class EntityNotFoundException(AppException):
    def __init__(self, entity_name: str, identifier: any):
        super().__init__(f"Không tìm thấy thực thể {entity_name} với khóa [{identifier}]", status_code=404)

class ValidationException(AppException):
    def __init__(self, message: str):
        super().__init__(message, status_code=422)

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Yêu cầu đăng nhập hoặc phiên làm việc đã hết hạn"):
        super().__init__(message, status_code=401)

class ForbiddenException(AppException):
    def __init__(self, message: str = "Bạn không có quyền thực hiện thao tác này"):
        super().__init__(message, status_code=403)

class DatabaseException(AppException):
    def __init__(self, message: str):
        super().__init__(f"Lỗi cơ sở dữ liệu: {message}", status_code=500)
