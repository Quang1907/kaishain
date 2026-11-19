"""
Bộ kiểm thử Toàn diện Phân quyền (RBAC) & Quy trình Nghiệp vụ 4 Vai trò:
1. admin (Quản lý)
2. technician (Thợ máy thay khuôn ○)
3. material_manager (Quản lý nguyên liệu & phễu sấy)
4. user (Nhân viên đứng máy)
"""
import unittest
from backend.auth import hash_password, verify_password, create_session, get_session, destroy_session, ROLE_PERMISSIONS
from backend.database.repository import repository

class TestRBACAndRoleWorkflows(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        from backend.database.db_seeder import seed_database
        seed_database(force_reseed=False)

    def test_01_password_hashing_and_verification(self):
        """Kiểm tra mã hóa mật khẩu SHA256 kèm muối bảo mật (Salt)"""
        pwd = "SecretPassword123!"
        hashed = hash_password(pwd)
        self.assertIn("$", hashed)
        self.assertTrue(verify_password(pwd, hashed))
        self.assertFalse(verify_password("WrongPassword", hashed))

    def test_02_session_tokens_lifecycle(self):
        """Kiểm tra vòng đời session token: tạo, lấy thông tin và hủy session"""
        mock_user = {
            "id": 99,
            "username": "test_user",
            "full_name": "Test Engineer",
            "role": "technician",
            "assigned_machine_or_task": "Mold Maintenance"
        }
        token = create_session(mock_user)
        self.assertIsNotNone(token)
        
        session = get_session(token)
        self.assertIsNotNone(session)
        self.assertEqual(session["username"], "test_user")
        self.assertEqual(session["role"], "technician")
        
        destroy_session(token)
        self.assertIsNone(get_session(token))

    def test_03_role_permissions_matrix(self):
        """Kiểm tra ma trận phân quyền 4 vai trò tuân thủ nghiêm ngặt chuẩn doanh nghiệp"""
        # 1. Admin
        admin_perms = ROLE_PERMISSIONS["admin"]
        self.assertTrue(admin_perms["can_manage_users"])
        self.assertTrue(admin_perms["can_trigger_ai"])
        self.assertTrue(admin_perms["can_edit_schedule"])

        # 2. Thợ máy (technician)
        tech_perms = ROLE_PERMISSIONS["technician"]
        self.assertTrue(tech_perms["can_confirm_mold"])
        self.assertFalse(tech_perms["can_edit_schedule"])
        self.assertFalse(tech_perms["can_confirm_material"])

        # 3. Quản lý nguyên liệu (material_manager)
        mat_perms = ROLE_PERMISSIONS["material_manager"]
        self.assertTrue(mat_perms["can_confirm_material"])
        self.assertFalse(mat_perms["can_confirm_mold"])
        self.assertFalse(mat_perms["can_trigger_ai"])

        # 4. Nhân viên đứng máy (user)
        user_perms = ROLE_PERMISSIONS["user"]
        self.assertTrue(user_perms["can_report_scraps"])
        self.assertFalse(user_perms["can_manage_machines"])
        self.assertFalse(user_perms["can_manage_users"])

    def test_04_technician_mold_change_signoff(self):
        """Kiểm tra quy trình thợ máy nghiệm thu thay khuôn (○ 型替) 4 bước"""
        logs = repository.get_mold_change_logs("2026-11-13")
        self.assertGreater(len(logs), 0)
        target_log = logs[0]
        log_id = target_log["id"]

        checks = {
            "cooling_water": True,
            "clamping_force": True,
            "barrel_temp": True,
            "first_shot_qc": True
        }
        success = repository.confirm_mold_change(log_id, "宮地 (Miyaji)", "Nghiệm thu đạt chuẩn 100%", checks)
        self.assertTrue(success)

        # Kiểm tra lại DB xem trạng thái đã chuyển thành CONFIRMED chưa
        updated_logs = repository.get_mold_change_logs("2026-11-13")
        matching = [l for l in updated_logs if l["id"] == log_id]
        self.assertEqual(len(matching), 1)
        self.assertEqual(matching[0]["status"], "CONFIRMED")
        self.assertTrue(matching[0]["cooling_line_checked"])
        self.assertTrue(matching[0]["first_shot_passed"])

    def test_05_material_manager_prep_signoff(self):
        """Kiểm tra quy trình Quản lý nguyên liệu nghiệm thu phễu sấy & thùng"""
        mat_logs = repository.get_material_prep_logs("2026-11-13")
        self.assertGreater(len(mat_logs), 0)
        target = mat_logs[0]
        log_id = target["id"]

        success = repository.confirm_material_prep(log_id, "エジソン (Edison)", 85, "Đã đo độ ẩm 0.014%", True)
        self.assertTrue(success)

        updated_mat_logs = repository.get_material_prep_logs("2026-11-13")
        matching = [m for m in updated_mat_logs if m["id"] == log_id]
        self.assertEqual(len(matching), 1)
        self.assertEqual(matching[0]["status"], "READY")
        self.assertEqual(matching[0]["actual_temp"], 85)
        self.assertTrue(matching[0]["staging_boxes_ready"])

if __name__ == "__main__":
    unittest.main()
