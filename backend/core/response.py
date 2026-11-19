"""
HTTP Response & JSON Serialization Layer
Đảm bảo chuyển đổi dữ liệu an toàn 100% cho mọi kiểu dữ liệu PostgreSQL (datetime, Decimal, UUID)
"""
import json
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from typing import Any, Dict, Optional

class CustomJsonEncoder(json.JSONEncoder):
    """Bộ chuyển đổi JSON chuyên biệt cho kiểu dữ liệu hệ quản trị cơ sở dữ liệu"""
    def default(self, obj: Any) -> Any:
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, UUID):
            return str(obj)
        if hasattr(obj, "to_dict"):
            return obj.to_dict()
        if hasattr(obj, "__dict__"):
            return obj.__dict__
        return super().default(obj)

def serialize_json(data: Any, indent: Optional[int] = None) -> bytes:
    """Serialize dữ liệu sang UTF-8 bytes với khả năng tương thích cao"""
    return json.dumps(data, cls=CustomJsonEncoder, ensure_ascii=False, indent=indent).encode("utf-8")

def success_response(data: Any = None, message: Optional[str] = None) -> Dict[str, Any]:
    """Tạo response thành công chuẩn RESTful"""
    resp = {"status": "success"}
    if message is not None:
        resp["message"] = message
    if data is not None:
        if isinstance(data, dict):
            resp.update(data)
        else:
            resp["data"] = data
    return resp

def error_response(message: str, code: str = "ERROR", details: Any = None) -> Dict[str, Any]:
    """Tạo response lỗi chuẩn RESTful"""
    resp = {
        "status": "error",
        "code": code,
        "message": message
    }
    if details:
        resp["details"] = details
    return resp
