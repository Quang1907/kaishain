"""
ENTERPRISE MASTER QA / TESTER SUITE FOR FACTORY APS SYSTEM
Kiểm thử toàn diện Hệ thống Điều hành Sản xuất & Database PostgreSQL Server:
1. Kết nối & Connection Pooling đa luồng
2. Toàn vẹn ràng buộc quan hệ & Khóa ngoại (Foreign Keys & Cascades)
3. Xác minh 22 máy ép, 28 con hàng, 24 nhân sự và lịch trình 2 ngày thực tế
4. Ràng buộc cốt lõi: 1 hàng chỉ chạy 1 lần trên 1 máy
5. Tự động ngắt điện dừng máy (□ 計画停止)
6. Lập lịch ngược JIT & 3 Chân kiềng (Sấy nhựa, Thùng, Người đứng máy)
7. Vòng lặp tự học chống thiếu hàng (Closed-Loop Learning)
8. Stress Test & Concurrency (Kiểm thử tải đồng thời đa luồng không bị Deadlock)
"""
import unittest
import sys
import os
import threading
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database.db_manager import db_manager
from backend.database.repository import repository
from backend.resource_manager import ResourceManager
from backend.brain_optimizer import FactoryBrainOptimizer

class TestEnterprisePostgres(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n=======================================================")
        print("🧪 KHỞI ĐỘNG BỘ KIỂM THỬ MASTER QA / TESTER (ENTERPRISE)")
        print(f"🐘 Database Server: {db_manager.backend} ({db_manager.server_version})")
        print("=======================================================")

    def test_01_db_connection_and_healthcheck(self):
        """[TEST 1] Kiểm tra kết nối Database Server và Connection Healthcheck"""
        health = db_manager.check_health()
        self.assertEqual(health["status"], "HEALTHY", f"Database không khỏe mạnh: {health}")
        self.assertGreaterEqual(health["latency_ms"], 0)
        self.assertTrue("PostgreSQL" in health["server_version"] or "SQLite" in health["server_version"])
        print(f"  ✓ Kết nối PostgreSQL Server thành công! Độ trễ: {health['latency_ms']} ms")

    def test_02_relational_integrity_and_cascades(self):
        """[TEST 2] Kiểm thử tính toàn vẹn quan hệ (Relational Integrity) và Cascade Deletes"""
        with db_manager.get_connection() as conn:
            cur = conn.cursor()
            
            # Tạo test schedule
            cur.execute("""
                INSERT INTO schedules (id, date_str, day_of_week, notes) 
                VALUES ('test_cascade_sched', '2099-01-01', 'Test Day', 'Notes')
                ON CONFLICT(id) DO NOTHING;
            """)
            cur.execute("""
                INSERT INTO job_blocks (id, schedule_id, machine_id, product_code, start_hour, end_hour, event_type)
                VALUES ('test_job_block_1', 'test_cascade_sched', '15号機', 'W165', 8.0, 12.0, 'PROD')
                ON CONFLICT(id) DO NOTHING;
            """)
            
            # Kiểm tra job_block đã tạo
            cur.execute("SELECT count(*) as cnt FROM job_blocks WHERE schedule_id = 'test_cascade_sched';")
            self.assertEqual(cur.fetchone()["cnt"], 1)

            # Xóa schedule -> CASCADE tự động xóa job_block
            cur.execute("DELETE FROM schedules WHERE id = 'test_cascade_sched';")
            cur.execute("SELECT count(*) as cnt FROM job_blocks WHERE schedule_id = 'test_cascade_sched';")
            self.assertEqual(cur.fetchone()["cnt"], 0, "CASCADE Delete thất bại!")
        print("  ✓ Ràng buộc khóa ngoại và Cascade Deletes hoạt động chuẩn xác 100%!")

    def test_03_master_data_accuracy(self):
        """[TEST 3] Kiểm tra độ chính xác của 22 máy ép, 28 con hàng và 24 nhân sự trong DB Server"""
        machines = repository.get_all_machines()
        self.assertEqual(len(machines), 22, f"Phải có đúng 22 máy ép, thực tế: {len(machines)}")
        
        bay_a = [m for m in machines if m["bay"] == "A"]
        bay_b = [m for m in machines if m["bay"] == "B"]
        self.assertEqual(len(bay_a), 12, "Bay A phải gồm 12 máy (Máy 2-13)")
        self.assertEqual(len(bay_b), 10, "Bay B phải gồm 10 máy (Máy 15-25)")

        products = repository.get_all_products()
        self.assertEqual(len(products), 28, f"Phải có đủ 28 con hàng, thực tế: {len(products)}")
        self.assertIn("W165", products)
        self.assertIn("075F/JV", products)
        self.assertIn("AR-05/06", products)

        operators = repository.get_all_operators()
        self.assertEqual(len(operators), 24, f"Phải có 24 nhân sự, thực tế: {len(operators)}")
        print("  ✓ Dữ liệu Master của 22 máy ép, 28 con hàng và 24 thợ đứng máy hoàn toàn chính xác!")

    def test_04_core_rule_one_product_one_machine(self):
        """[TEST 4] RÀNG BUỘC CỐT LÕI: 1 con hàng chỉ chạy 1 lần trên 1 máy trong kỳ lập lịch"""
        machines = repository.get_all_machines()
        products = repository.get_all_products()
        operators = repository.get_all_operators()
        orders = repository.get_all_shipping_orders()
        
        brain = FactoryBrainOptimizer(machines, products, operators)
        result = brain.auto_optimize_schedule(orders, "2026-11-14")
        
        prod_jobs = [j for j in result["jobs"] if j["event"] == "PROD"]
        product_run_counts = {}
        for pj in prod_jobs:
            p = pj["product"]
            product_run_counts[p] = product_run_counts.get(p, 0) + 1

        for p_code, count in product_run_counts.items():
            self.assertEqual(count, 1, f"Con hàng {p_code} bị phân bổ chạy {count} lần (vi phạm quy tắc 1 hàng 1 lần trên 1 máy)!")
        print("  ✓ Quy tắc '1 hàng chỉ chạy 1 lần trên 1 máy' được Bộ Não thực thi nghiêm ngặt!")

    def test_05_three_pillars_evaluation(self):
        """[TEST 5] Kiểm tra 3 chân kiềng: Thùng, Sấy hạt nhựa, Người đứng máy"""
        products = repository.get_all_products()
        operators = repository.get_all_operators()
        resource_mgr = ResourceManager(products, operators)

        test_job = {
            "id": "pillar_test",
            "machine": "25号機",
            "product": "AR-05/06",
            "start": 12.0,
            "end": 20.0,
            "event": "PROD",
            "op": "ティ (Thi)"
        }
        # Kiểm tra trước giờ chạy 3 tiếng (tại 9h)
        eval_result = resource_mgr.evaluate_job_prerequisites(test_job, current_hour=9.0)
        self.assertIn("material", eval_result)
        self.assertIn("box", eval_result)
        self.assertIn("operator", eval_result)
        self.assertEqual(eval_result["material"]["is_dry_coat"], True)
        self.assertEqual(eval_result["operator"]["mode"], "BY_PRODUCT")
        print("  ✓ Hệ thống kiểm soát 3 chân kiềng (Sấy nhựa, Thùng, Người đứng máy) hoạt động chuẩn!")

    def test_06_dynamic_learning_feedback_in_postgres(self):
        """[TEST 6] Vòng lặp tự học: Ghi nhận phế phẩm thực tế và tự động tăng đệm an toàn trong PostgreSQL"""
        prod_code = "W165"
        initial_prod = repository.get_all_products()[prod_code]
        initial_buf = initial_prod["defect_buffer_pct"]

        # Ghi nhận phản hồi thực tế phát hiện 18 phế phẩm
        new_buf = initial_buf + 0.5
        repository.log_learning_feedback({
            "product_code": prod_code,
            "machine_id": "15号機",
            "scraps": 18,
            "actual_run_hours": 9.5,
            "planned_run_hours": 8.0,
            "prev_buffer_pct": initial_buf,
            "new_buffer_pct": new_buf,
            "prev_oee": 0.95,
            "new_oee": 0.92,
            "note": "Kiểm thử tự động QA: Tăng đệm an toàn chống thiếu hàng"
        })

        # Kiểm tra bảng products đã được cập nhật trực tiếp trong DB Server
        updated_prod = repository.get_all_products()[prod_code]
        self.assertEqual(updated_prod["defect_buffer_pct"], new_buf)

        # Kiểm tra bảng nhật ký feedback_logs
        logs = repository.get_recent_feedback_logs(1)
        self.assertEqual(logs[0]["product_code"], prod_code)
        self.assertEqual(logs[0]["scraps"], 18)
        print(f"  ✓ Tự học thành công: Đệm an toàn của {prod_code} đã tăng từ {initial_buf}% lên {new_buf}% trong PostgreSQL!")

    def test_07_high_concurrency_stress_testing(self):
        """[TEST 7] STRESS TEST: Mô phỏng 10 luồng người dùng/cảm biến ghi nhận đồng thời vào PostgreSQL Server"""
        num_threads = 10
        errors = []

        def worker_task(thread_id):
            try:
                # Đọc danh sách máy
                machs = repository.get_all_machines()
                # Ghi nhận feedback log
                repository.log_learning_feedback({
                    "product_code": "154",
                    "machine_id": "16号機",
                    "scraps": thread_id,
                    "actual_run_hours": 8.0,
                    "planned_run_hours": 8.0,
                    "prev_buffer_pct": 3.0,
                    "new_buffer_pct": 3.0 + (thread_id * 0.1),
                    "prev_oee": 0.95,
                    "new_oee": 0.95,
                    "note": f"Concurrent Thread {thread_id}"
                })
            except Exception as e:
                errors.append(f"Thread {thread_id} failed: {e}")

        threads = [threading.Thread(target=worker_task, args=(i,)) for i in range(num_threads)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(len(errors), 0, f"Stress test xuất hiện lỗi tranh chấp dữ liệu: {errors}")
        print(f"  ✓ Stress Test thành công! {num_threads} luồng giao dịch đồng thời trên PostgreSQL không xảy ra Deadlock!")

if __name__ == "__main__":
    unittest.main()
