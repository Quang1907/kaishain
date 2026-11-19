"""
Enterprise HTTP Application Server
EntryPoint sạch gọn chuẩn Clean Architecture:
- Định tuyến API thông qua ApiRouter
- Phục vụ Static SPA thông qua StaticHandler
- Hỗ trợ CORS, Ghi log, Quản lý Token Auth và Socket Reuse
"""
import os
import sys

# Đảm bảo root directory luôn có trong sys.path để import chuẩn package
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import json
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
from typing import Optional, Dict, Any

from backend.config.settings import settings
from backend.infrastructure.database.connection import db_manager
from backend.api.router import api_router
from backend.api.static_handler import static_handler

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Máy chủ HTTP đa luồng hiệu năng cao hỗ trợ tái sử dụng socket ngay lập tức"""
    allow_reuse_address = True
    daemon_threads = True

class EnterpriseRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_HEAD(self):
        self.do_GET()

    def _extract_token(self, params: Dict[str, Any]) -> Optional[str]:
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header.replace("Bearer ", "").strip()
        if "token" in params:
            return params["token"][0]
        cookie = self.headers.get("Cookie", "")
        for item in cookie.split(";"):
            item_clean = item.strip()
            if item_clean.startswith("aps_token="):
                return item_clean.split("aps_token=")[1].strip()
        return None

    def _send_response_payload(self, status_code: int, payload: bytes, content_type: str = "application/json; charset=utf-8"):
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        # 1. API Route
        if path.startswith("/api/"):
            if path == "/api/db/download":
                db_path = settings.SQLITE_PATH
                if os.path.exists(db_path):
                    with open(db_path, "rb") as f:
                        content = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "application/octet-stream")
                    self.send_header("Content-Disposition", 'attachment; filename="factory_aps.db"')
                    self.send_header("Content-Length", str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
                    return
            token = self._extract_token(params)
            status_code, body = api_router.handle_get(path, params, token)
            self._send_response_payload(status_code, body)
            return

        # 2. Static / SPA Assets
        resolved = static_handler.resolve_file(path)
        if resolved:
            file_path, mime_type = resolved
            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                self._send_response_payload(200, content, mime_type)
            except Exception as e:
                self.send_error(500, f"Error reading file: {str(e)}")
            return

        self.send_error(404, f"File not found: {path}")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)
        token = self._extract_token(params)

        length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(length) if length > 0 else b"{}"

        try:
            payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        except Exception:
            payload = {}

        status_code, body = api_router.handle_post(path, payload, params, token)
        self._send_response_payload(status_code, body)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        status_code, body = api_router.handle_delete(path, params)
        self._send_response_payload(status_code, body)

    def log_message(self, format, *args):
        # Clean logging: suppress favicon or asset noise in production
        if "GET /assets/" in args[0] or "GET /favicon" in args[0]:
            return
        super().log_message(format, *args)

def run_server(port: int = settings.SERVER_PORT):
    for p in range(port, port + 10):
        try:
            server = ThreadedHTTPServer((settings.SERVER_HOST, p), EnterpriseRequestHandler)
            health = db_manager.check_health()
            print("=" * 66)
            print(f"🏭 Factory Intelligent Production Brain (APS 2.0) Server Started!")
            print(f"📍 Local URL: http://localhost:{p}")
            print(f"🐘 Database: {health['backend'].upper()} Server | Host: {health['host']}:{health['port']} ({health['database_name']})")
            print(f"⚡ Architecture: Clean Architecture + Modular Domain Repositories")
            print("=" * 66)
            server.serve_forever()
            break
        except OSError as e:
            if "Address already in use" in str(e):
                print(f"⚠️ Cổng {p} đang bận, tự động thử cổng kế tiếp {p + 1}...")
                continue
            raise

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else settings.SERVER_PORT
    run_server(port)
