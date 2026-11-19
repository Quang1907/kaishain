"""
Unit Tests for Factory Production Planning & Intelligent Scheduling Brain (APS)
Kiểm thử toàn diện các ràng buộc và thuật toán tối ưu của bộ não nhà máy
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.data_store import (
    get_master_machines,
    get_master_products,
    get_master_operators,
    get_schedule_day1_nov12,
    get_schedule_day2_nov13,
    get_master_shipping_orders
)
from backend.resource_manager import ResourceManager
from backend.brain_optimizer import FactoryBrainOptimizer

class TestFactoryBrain(unittest.TestCase):
    def setUp(self):
        self.machines = get_master_machines()
        self.products = get_master_products()
        self.operators = get_master_operators()
        self.orders = get_master_shipping_orders()
        self.resource_mgr = ResourceManager(self.products, self.operators)
        self.brain = FactoryBrainOptimizer(self.machines, self.products, self.operators)

    def test_22_machines_loaded(self):
        """Kiểm tra đủ 22 máy ép (Máy 2-13 và Máy 15-25)"""
        self.assertEqual(len(self.machines), 22)
        machine_ids = [m["id"] for m in self.machines]
        self.assertIn("2号機", machine_ids)
        self.assertIn("13号機", machine_ids)
        self.assertIn("15号機", machine_ids)
        self.assertIn("25号機", machine_ids)

    def test_schedule_data_accuracy(self):
        """Kiểm tra lịch trình ngày 11/12 và 11/13 được nạp đầy đủ"""
        d1 = get_schedule_day1_nov12()
        d2 = get_schedule_day2_nov13()
        self.assertEqual(d1["date"], "2026-11-12")
        self.assertEqual(d2["date"], "2026-11-13")
        self.assertTrue(len(d1["jobs"]) > 30)
        self.assertTrue(len(d2["jobs"]) > 30)

    def test_three_pillars_evaluation(self):
        """Kiểm tra đánh giá 3 chân kiềng: Thùng, Sấy nhựa, Người đứng máy"""
        test_job = {
            "id": "test_job_1",
            "machine": "15号機",
            "product": "W165",
            "start": 10.0,
            "end": 18.0,
            "event": "PROD",
            "op": "チー (Chí)"
        }
        # Tại thời điểm 8.0h (trước giờ chạy 2 tiếng)
        prereq = self.resource_mgr.evaluate_job_prerequisites(test_job, current_hour=8.0)
        self.assertEqual(prereq["product_name"], "Nắp ốp vỏ điện tử W165")
        self.assertIn("material", prereq)
        self.assertIn("box", prereq)
        self.assertIn("operator", prereq)
        # Sấy nhựa yêu cầu 3.0h -> Bắt đầu sấy từ 7.0h -> lúc 8.0h đang sấy
        self.assertEqual(prereq["material"]["status"], "PREPARING")
        self.assertIn("チー", prereq["operator"]["assigned"])

    def test_one_product_one_machine_constraint(self):
        """RÀNG BUỘC CỐT LÕI: 1 hàng chỉ chạy 1 lần trên 1 máy trong đợt tối ưu"""
        result = self.brain.auto_optimize_schedule(self.orders, "2026-11-14")
        jobs = result["jobs"]
        prod_jobs = [j for j in jobs if j["event"] == "PROD"]
        
        # Đếm số lần mỗi sản phẩm xuất hiện trong các công đoạn PROD
        product_machine_mapping = {}
        for pj in prod_jobs:
            p = pj["product"]
            m = pj["machine"]
            if p not in product_machine_mapping:
                product_machine_mapping[p] = []
            product_machine_mapping[p].append(m)

        for prod_code, machine_list in product_machine_mapping.items():
            # Mỗi sản phẩm chỉ được gán đúng 1 máy duy nhất!
            self.assertEqual(len(set(machine_list)), 1, f"Sản phẩm {prod_code} bị phân bổ vào nhiều máy: {machine_list}")
            # Và chỉ chạy đúng 1 lần (1 continuous block)!
            self.assertEqual(len(machine_list), 1, f"Sản phẩm {prod_code} bị chia nhỏ chạy nhiều lần: {machine_list}")

    def test_auto_shutdown_planned_stop(self):
        """Kiểm tra tự động ngắt điện dừng máy (□ 計画停止) khi hết hàng để tiết kiệm điện"""
        result = self.brain.auto_optimize_schedule(self.orders, "2026-11-14")
        jobs = result["jobs"]
        stop_jobs = [j for j in jobs if j["event"] == "STOP"]
        self.assertTrue(len(stop_jobs) > 0, "Hệ thống phải tự động tạo lệnh tắt máy □ 計画停止")
        self.assertTrue(result["summary"]["estimated_power_saved_kwh"] > 0)

    def test_dynamic_learning_prevents_stockouts(self):
        """Kiểm tra bộ não tự học: sau khi báo cáo phế phẩm, đệm an toàn tự động tăng"""
        initial_buffer = self.brain.learning_profile["dynamic_safety_stock_pct"]["21-61/62"]
        # Giả lập phát hiện 25 phế phẩm trong ca trước
        self.brain.update_learning_feedback("21-61/62", "21号機", actual_scraps=25, actual_run_time_h=9.0, planned_run_time_h=8.0)
        new_buffer = self.brain.learning_profile["dynamic_safety_stock_pct"]["21-61/62"]
        self.assertGreater(new_buffer, initial_buffer, "Đệm an toàn phải tự động tăng để không bao giờ bị thiếu hàng")

if __name__ == "__main__":
    unittest.main()

