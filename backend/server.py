"""
Master REST API & Web Server for Factory Planning & Dispatching Brain
Hệ thống máy chủ điều hành sản xuất & API Bộ não AI kết nối Cơ sở Dữ liệu SQLite chuyên dụng
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
from typing import Any, Dict, List, Optional
import json
import urllib.parse
import os
import sys

# Ensure backend package can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database.repository import repository
from backend.database.db_seeder import seed_database
from backend.resource_manager import ResourceManager
from backend.brain_optimizer import FactoryBrainOptimizer
from backend.auth import (
    hash_password,
    verify_password,
    create_session,
    get_session,
    destroy_session,
    ROLE_PERMISSIONS
)

# Load master entities from Database
def get_fresh_managers():
    machines = repository.get_all_machines()
    products = repository.get_all_products()
    operators = repository.get_all_operators()
    resource_mgr = ResourceManager(products, operators)
    brain = FactoryBrainOptimizer(machines, products, operators)
    return machines, products, operators, resource_mgr, brain

FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
FRONTEND_DIST_DIR = os.path.join(FRONTEND_DIR, "dist")

class FactoryRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable cache for live updates
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

    def get_auth_token(self, params=None) -> Optional[str]:
        auth_header = self.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            return auth_header.replace("Bearer ", "").strip()
        if params and "token" in params:
            return params["token"][0]
        cookie = self.headers.get("Cookie", "")
        for item in cookie.split(";"):
            item_clean = item.strip()
            if item_clean.startswith("aps_token="):
                return item_clean.split("aps_token=")[1].strip()
        return None

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        # 1. Routing static frontend files (Supports Modern React Vite Dist & Legacy)
        base_serve_dir = FRONTEND_DIST_DIR if os.path.exists(os.path.join(FRONTEND_DIST_DIR, "index.html")) else FRONTEND_DIR

        if path == "/" or path == "/index.html":
            file_path = os.path.join(base_serve_dir, "index.html")
            self.serve_file(file_path, "text/html; charset=utf-8")
            return
        elif path.startswith("/assets/"):
            file_path = os.path.join(base_serve_dir, path.lstrip("/"))
            if os.path.exists(file_path):
                ext = os.path.splitext(file_path)[1]
                mime_map = {
                    ".html": "text/html; charset=utf-8",
                    ".js": "application/javascript; charset=utf-8",
                    ".css": "text/css; charset=utf-8",
                    ".json": "application/json",
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".svg": "image/svg+xml"
                }
                self.serve_file(file_path, mime_map.get(ext, "application/octet-stream"))
                return
        elif path.startswith("/static/") or path.startswith("/frontend/"):
            clean_path = path.replace("/static/", "").replace("/frontend/", "")
            file_path = os.path.join(base_serve_dir, clean_path)
            if os.path.exists(file_path):
                ext = os.path.splitext(file_path)[1]
                mime_map = {
                    ".html": "text/html; charset=utf-8",
                    ".js": "application/javascript; charset=utf-8",
                    ".css": "text/css; charset=utf-8",
                    ".json": "application/json",
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".svg": "image/svg+xml"
                }
                self.serve_file(file_path, mime_map.get(ext, "application/octet-stream"))
                return
        elif os.path.exists(os.path.join(base_serve_dir, path.lstrip("/"))):
            file_path = os.path.join(base_serve_dir, path.lstrip("/"))
            ext = os.path.splitext(file_path)[1]
            mime_map = {
                ".html": "text/html; charset=utf-8",
                ".js": "application/javascript; charset=utf-8",
                ".css": "text/css; charset=utf-8",
                ".json": "application/json",
                ".svg": "image/svg+xml"
            }
            self.serve_file(file_path, mime_map.get(ext, "application/octet-stream"))
            return

        # 2. REST API endpoints kết nối trực tiếp DATABASE
        try:
            if path == "/api/health":
                from backend.database.db_manager import db_manager
                self.send_json(db_manager.check_health())
            elif path == "/api/db/download" or path == "/api/db/export":
                db_file = os.path.abspath(os.path.join(os.path.dirname(__file__), "database", "factory_aps.db"))
                if os.path.exists(db_file):
                    self.send_response(200)
                    self.send_header("Content-Type", "application/octet-stream")
                    self.send_header("Content-Disposition", 'attachment; filename="factory_aps_backup.db"')
                    self.send_header("Content-Length", str(os.path.getsize(db_file)))
                    self.end_headers()
                    with open(db_file, "rb") as f:
                        self.wfile.write(f.read())
                    return
                else:
                    self.send_error(404, "Database file not found")
                    return
            elif path == "/api/db/stats":
                self.send_json(repository.get_db_stats())
            elif path == "/api/machines":
                self.send_json(repository.get_all_machines())
            elif path == "/api/products":
                self.send_json(repository.get_all_products())
            elif path == "/api/materials":
                self.send_json(repository.get_all_materials())
            elif path == "/api/boxes":
                self.send_json(repository.get_all_boxes())
            elif path == "/api/operators":
                self.send_json(repository.get_all_operators())
            elif path == "/api/shipping-orders":
                self.send_json(repository.get_all_shipping_orders())
            elif path == "/api/breaks":
                hour = float(params.get("hour", [8.0])[0])
                _, _, _, res_mgr, _ = get_fresh_managers()
                self.send_json(res_mgr.get_break_schedule(hour))
            elif path == "/api/feedback/logs":
                limit = int(params.get("limit", [20])[0])
                self.send_json(repository.get_recent_feedback_logs(limit))
            elif path == "/api/schedule":
                date_req = params.get("date", ["2026-11-12"])[0]
                curr_h = float(params.get("current_hour", [8.0])[0])
                _, products, operators, res_mgr, brain = get_fresh_managers()

                sched = repository.get_schedule_by_date(date_req)
                if not sched:
                    if date_req == "optimized":
                        orders = repository.get_all_shipping_orders()
                        sched = brain.auto_optimize_schedule(orders)
                    else:
                        sched = repository.get_schedule_by_date("2026-11-12")

                # Bổ sung thông tin 3 chân kiềng (Thùng, Sấy nhựa, Nhân công)
                enriched_jobs = []
                for job in sched.get("jobs", []):
                    j_copy = dict(job)
                    prereq = res_mgr.evaluate_job_prerequisites(j_copy, curr_h)
                    j_copy["prerequisites"] = prereq
                    enriched_jobs.append(j_copy)

                resp = dict(sched)
                resp["jobs"] = enriched_jobs
                self.send_json(resp)
            elif path == "/api/readiness":
                date_req = params.get("date", ["2026-11-13"])[0]
                curr_h = float(params.get("current_hour", [8.0])[0])
                _, _, _, _, brain = get_fresh_managers()
                
                sched = repository.get_schedule_by_date(date_req)
                jobs = sched["jobs"] if sched else []
                orders = repository.get_all_shipping_orders()
                
                readiness = brain.analyze_shipping_readiness(orders, jobs, curr_h)
                self.send_json(readiness)
            elif path == "/api/learning-profile":
                _, _, _, _, brain = get_fresh_managers()
                self.send_json(brain.learning_profile)
            elif path == "/api/auth/me":
                token = self.get_auth_token(params)
                sess = get_session(token)
                if sess:
                    perms = ROLE_PERMISSIONS.get(sess["role"], {})
                    self.send_json({"status": "success", "user": sess, "permissions": perms})
                else:
                    self.send_json({"status": "guest", "user": None, "permissions": {}})
            elif path == "/api/users":
                self.send_json(repository.get_all_users())
            elif path == "/api/mold/logs":
                sched_id = params.get("schedule_id", [None])[0]
                status_filter = params.get("status", [None])[0]
                self.send_json(repository.get_mold_change_logs(sched_id, status_filter))
            elif path == "/api/material/logs":
                sched_id = params.get("schedule_id", [None])[0]
                status_filter = params.get("status", [None])[0]
                self.send_json(repository.get_material_prep_logs(sched_id, status_filter))
            else:
                self.send_error(404, f"Endpoint not found: {path}")
        except Exception as e:
            self.send_error(500, f"Internal Server Error: {str(e)}")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else b"{}"

        try:
            payload = json.loads(body.decode("utf-8")) if body else {}
        except Exception:
            payload = {}

        try:
            if path == "/api/optimize":
                target_date = payload.get("target_date", "2026-11-14")
                _, _, _, _, brain = get_fresh_managers()
                orders = repository.get_all_shipping_orders()
                result = brain.auto_optimize_schedule(orders, target_date)
                self.send_json(result)
            elif path == "/api/feedback":
                p_code = payload.get("product_code")
                m_id = payload.get("machine_id")
                scraps = int(payload.get("scraps", 0))
                act_run = float(payload.get("actual_run_hours", 0.0))
                plan_run = float(payload.get("planned_run_hours", 8.0))
                
                _, _, _, _, brain = get_fresh_managers()
                brain.update_learning_feedback(p_code, m_id, scraps, act_run, plan_run)
                self.send_json({
                    "status": "success",
                    "message": "Đã ghi nhận dữ liệu thực tế và lưu vào Database SQLite. Đệm an toàn đã được cập nhật vĩnh viễn!",
                    "updated_profile": brain.learning_profile
                })
            elif path == "/api/shipping-orders":
                new_order = {
                    "order_id": payload.get("order_id", f"SO-{int(os.times().elapsed*1000)%100000:05d}"),
                    "customer": payload.get("customer", "Khách hàng mới"),
                    "product": payload.get("product", "W165"),
                    "order_qty": int(payload.get("order_qty", 500)),
                    "ship_date": payload.get("ship_date", "2026-11-14"),
                    "ship_deadline_hour": float(payload.get("ship_deadline_hour", 17.0)),
                    "status": "PREPARING",
                    "safety_buffer_units": int(payload.get("safety_buffer_units", 0))
                }
                repository.upsert_shipping_order(new_order)
                self.send_json({"status": "success", "order": new_order})
            elif path == "/api/db/seed":
                seed_database(force_reseed=True)
                self.send_json({"status": "success", "stats": repository.get_db_stats()})
            elif path == "/api/machines":
                repository.upsert_machine(payload)
                self.send_json({"status": "success", "machine": payload})
            elif path == "/api/machines/delete":
                m_id = payload.get("id")
                if m_id:
                    repository.delete_machine(m_id)
                self.send_json({"status": "success", "deleted_id": m_id})
            elif path == "/api/products":
                comp_m = payload.get("compatible_machines", [])
                repository.upsert_product(payload, comp_m)
                self.send_json({"status": "success", "product": payload})
            elif path == "/api/products/delete":
                code = payload.get("code")
                if code:
                    repository.delete_product(code)
                self.send_json({"status": "success", "deleted_code": code})
            elif path == "/api/operators":
                repository.upsert_operator(payload)
                self.send_json({"status": "success", "operator": payload})
            elif path == "/api/operators/delete":
                op_id = payload.get("id") or payload.get("name")
                if op_id is not None:
                    repository.delete_operator(op_id)
                self.send_json({"status": "success", "deleted_operator": op_id})
            elif path == "/api/shipping-orders/delete":
                order_id = payload.get("order_id")
                if order_id:
                    repository.delete_shipping_order(order_id)
                self.send_json({"status": "success", "deleted_order_id": order_id})
            elif path == "/api/jobs":
                sched_id = payload.get("schedule_id") or payload.get("date", "2026-11-12")
                j_id = repository.upsert_job_block(sched_id, payload)
                self.send_json({"status": "success", "job_id": j_id})
            elif path == "/api/jobs/delete":
                j_id = payload.get("id") or payload.get("job_id")
                if j_id:
                    repository.delete_job_block(j_id)
                self.send_json({"status": "success", "deleted_job_id": j_id})
            elif path == "/api/materials":
                repository.upsert_material(payload)
                self.send_json({"status": "success", "material": payload})
            elif path == "/api/materials/delete":
                mat_id = payload.get("id")
                if mat_id:
                    repository.delete_material(mat_id)
                self.send_json({"status": "success", "deleted_material_id": mat_id})
            elif path == "/api/boxes":
                repository.upsert_box(payload)
                self.send_json({"status": "success", "box": payload})
            elif path == "/api/boxes/delete":
                b_id = payload.get("id")
                if b_id:
                    repository.delete_box(b_id)
                self.send_json({"status": "success", "deleted_box_id": b_id})
            elif path == "/api/auth/login":
                username = payload.get("username", "").strip()
                password = payload.get("password", "")
                user = repository.get_user_by_username(username)
                if user and verify_password(password, user["password_hash"]):
                    token = create_session(user)
                    repository.update_user_last_login(user["id"])
                    perms = ROLE_PERMISSIONS.get(user["role"], {})
                    self.send_json({
                        "status": "success",
                        "token": token,
                        "user": {
                            "id": user["id"],
                            "username": user["username"],
                            "full_name": user["full_name"],
                            "role": user["role"],
                            "avatar_url": user.get("avatar_url", ""),
                            "assigned_machine_or_task": user.get("assigned_machine_or_task", "")
                        },
                        "permissions": perms
                    })
                else:
                    self.send_response(401)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "error", "message": "Sai tài khoản hoặc mật khẩu!"}).encode("utf-8"))
            elif path == "/api/auth/logout":
                token = self.get_auth_token()
                if token:
                    destroy_session(token)
                self.send_json({"status": "success", "message": "Đã đăng xuất"})
            elif path == "/api/mold/confirm":
                log_id = int(payload.get("log_id", 0))
                tech_name = payload.get("technician_name", "宮地 (Miyaji)")
                notes = payload.get("notes", "")
                checks = payload.get("checks", {})
                ok = repository.confirm_mold_change(log_id, tech_name, notes, checks)
                self.send_json({"status": "success", "message": "Thợ máy đã ký duyệt & nghiệm thu thay khuôn (○ 型替) thành công! Máy đã sẵn sàng chạy."})
            elif path == "/api/material/confirm":
                log_id = int(payload.get("log_id", 0))
                mgr_name = payload.get("manager_name", "エジソン (Edison)")
                actual_temp = int(payload.get("actual_temp", 80))
                notes = payload.get("notes", "")
                boxes_ready = bool(payload.get("boxes_ready", True))
                ok = repository.confirm_material_prep(log_id, mgr_name, actual_temp, notes, boxes_ready)
                self.send_json({"status": "success", "message": "Quản lý nguyên liệu đã ký xác nhận độ ẩm sấy nhựa đạt chuẩn và cấp liệu thành công!"})
            elif path == "/api/operator/report":
                m_id = payload.get("machine_id", "15号機")
                p_code = payload.get("product_code", "W165")
                act_qty = int(payload.get("actual_qty", 0))
                scraps = int(payload.get("scraps", 0))
                op_name = payload.get("operator_name", "Chí (チー)")
                note = payload.get("note", f"Nhân viên {op_name} báo cáo ca: {act_qty} đạt, {scraps} phế phẩm")
                
                _, _, _, _, brain = get_fresh_managers()
                brain.update_learning_feedback(p_code, m_id, scraps, 8.0, 8.0)
                self.send_json({"status": "success", "message": f"Nhân viên {op_name} đã gửi báo cáo thành công! AI đã ghi nhận phế phẩm vào DB và tự tính đệm an toàn."})
            elif path == "/api/users":
                repository.upsert_user(payload)
                self.send_json({"status": "success", "user": payload})
            else:
                self.send_error(404, f"POST endpoint not found: {path}")
        except Exception as e:
            self.send_error(500, f"Error processing POST: {str(e)}")

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        params = urllib.parse.parse_qs(parsed.query)

        try:
            if path.startswith("/api/machines"):
                m_id = params.get("id", [""])[0]
                if m_id: repository.delete_machine(m_id)
                self.send_json({"status": "success", "deleted_id": m_id})
            elif path.startswith("/api/products"):
                code = params.get("code", [""])[0]
                if code: repository.delete_product(code)
                self.send_json({"status": "success", "deleted_code": code})
            elif path.startswith("/api/operators"):
                op_id = params.get("id", [""])[0] or params.get("name", [""])[0]
                if op_id: repository.delete_operator(op_id)
                self.send_json({"status": "success", "deleted_operator": op_id})
            elif path.startswith("/api/shipping-orders"):
                order_id = params.get("order_id", [""])[0]
                if order_id: repository.delete_shipping_order(order_id)
                self.send_json({"status": "success", "deleted_order_id": order_id})
            elif path.startswith("/api/jobs"):
                j_id = params.get("id", [""])[0] or params.get("job_id", [""])[0]
                if j_id: repository.delete_job_block(j_id)
                self.send_json({"status": "success", "deleted_job_id": j_id})
            else:
                self.send_error(404, f"DELETE endpoint not found: {path}")
        except Exception as e:
            self.send_error(500, f"Error processing DELETE: {str(e)}")

    def serve_file(self, file_path: str, content_type: str):
        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Error reading file: {str(e)}")

    def send_json(self, data: Any):
        payload = json.dumps(data, ensure_ascii=False, indent=2, default=str).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True

def run_server(port: int = 8080):
    max_tries = 10
    httpd = None
    actual_port = port

    for i in range(max_tries):
        current_port = port + i
        try:
            server_address = ("", current_port)
            httpd = ReusableHTTPServer(server_address, FactoryRequestHandler)
            actual_port = current_port
            break
        except OSError as e:
            if e.errno == 48: # Address already in use
                continue
            raise

    if httpd is None:
        print(f"❌ Không thể tìm được cổng trống từ {port} đến {port + max_tries - 1}!")
        return

    db_stats = repository.get_db_stats()
    print(f"================================================================")
    print(f"🏭 Factory Intelligent Production Brain (APS) Server is running!")
    print(f"📍 Local URL: http://localhost:{actual_port}")
    db_desc = f"{db_stats.get('db_type')} | {db_stats.get('host')}:{db_stats.get('port')}/{db_stats.get('database_name')} (Dung lượng: {db_stats.get('file_size_kb')})"
    print(f"🐘 Database Server: {db_desc}")
    if actual_port != port:
        print(f"ℹ️ (Cổng {port} đang bận nên hệ thống đã tự chuyển sang cổng {actual_port})")
    print(f"================================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    run_server(port)
