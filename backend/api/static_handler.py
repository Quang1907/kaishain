"""
SPA & Static Assets Handler
Phục vụ toàn bộ tài nguyên giao diện Vite / React SPA và tệp tĩnh với MIME Types chuẩn
"""
import os
import mimetypes
from typing import Optional, Tuple
from backend.config.settings import settings

MIME_MAP = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
}

class StaticHandler:
    def __init__(self):
        self.dist_dir = settings.FRONTEND_DIST_DIR
        self.source_dir = settings.FRONTEND_DIR

    def resolve_file(self, request_path: str) -> Optional[Tuple[str, str]]:
        """
        Tìm tệp tin tĩnh phù hợp:
        - Ưu tiên build production tại `frontend/dist`
        - Hỗ trợ routing SPA (Single Page Application fallback index.html)
        - Trả về tuple: (file_path, mime_type)
        """
        base_dir = self.dist_dir if os.path.exists(os.path.join(self.dist_dir, "index.html")) else self.source_dir

        clean_path = request_path.split("?")[0]

        # 1. Root / index.html
        if clean_path in ("/", "/index.html"):
            index_path = os.path.join(base_dir, "index.html")
            if os.path.exists(index_path):
                return index_path, "text/html; charset=utf-8"

        # 2. Direct assets / static files
        candidate_path = os.path.join(base_dir, clean_path.lstrip("/"))
        if os.path.exists(candidate_path) and os.path.isfile(candidate_path):
            ext = os.path.splitext(candidate_path)[1].lower()
            mime = MIME_MAP.get(ext, mimetypes.guess_type(candidate_path)[0] or "application/octet-stream")
            return candidate_path, mime

        # 3. SPA Fallback cho các đường dẫn giao diện (không bắt đầu bằng /api/)
        if not clean_path.startswith("/api/"):
            index_path = os.path.join(base_dir, "index.html")
            if os.path.exists(index_path):
                return index_path, "text/html; charset=utf-8"

        return None

static_handler = StaticHandler()
