"""
Master Data Controller
Xử lý các endpoint quản lý 22 Máy ép, Danh mục Sản phẩm & BOM, Nguyên liệu, Thùng và Nhân sự
"""
from typing import Dict, Any
from backend.infrastructure.repositories.facade import repository
from backend.services.resource_service import ResourceManager
from backend.core.response import success_response

class MasterDataController:
    # --- MACHINES ---
    def get_machines(self) -> Any:
        return repository.get_all_machines()

    def upsert_machine(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        repository.upsert_machine(payload)
        return success_response({"machine": payload})

    def delete_machine(self, payload: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
        m_id = payload.get("id") or params.get("id", [None])[0]
        if m_id:
            repository.delete_machine(m_id)
        return success_response({"deleted_id": m_id})

    # --- PRODUCTS ---
    def get_products(self) -> Any:
        return repository.get_all_products()

    def upsert_product(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        comp_m = payload.get("compatible_machines", [])
        repository.upsert_product(payload, comp_m)
        return success_response({"product": payload})

    def delete_product(self, payload: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
        code = payload.get("code") or params.get("code", [None])[0]
        if code:
            repository.delete_product(code)
        return success_response({"deleted_code": code})

    # --- MATERIALS ---
    def get_materials(self) -> Any:
        return repository.get_all_materials()

    def upsert_material(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        repository.upsert_material(payload)
        return success_response({"material": payload})

    def delete_material(self, payload: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
        mat_id = payload.get("id") or params.get("id", [None])[0]
        if mat_id:
            repository.delete_material(mat_id)
        return success_response({"deleted_material_id": mat_id})

    # --- BOXES ---
    def get_boxes(self) -> Any:
        return repository.get_all_boxes()

    def upsert_box(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        repository.upsert_box(payload)
        return success_response({"box": payload})

    def delete_box(self, payload: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
        b_id = payload.get("id") or params.get("id", [None])[0]
        if b_id:
            repository.delete_box(b_id)
        return success_response({"deleted_box_id": b_id})

    # --- OPERATORS ---
    def get_operators(self) -> Any:
        return repository.get_all_operators()

    def upsert_operator(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        repository.upsert_operator(payload)
        return success_response({"operator": payload})

    def delete_operator(self, payload: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
        op_id = payload.get("id") or payload.get("name") or params.get("id", [None])[0] or params.get("name", [None])[0]
        if op_id:
            repository.delete_operator(op_id)
        return success_response({"deleted_operator": op_id})

    # --- BREAKS ---
    def get_breaks(self, params: Dict[str, Any]) -> Any:
        hour = float(params.get("hour", [8.0])[0])
        products = repository.get_all_products()
        operators = repository.get_all_operators()
        res_mgr = ResourceManager(products, operators)
        return res_mgr.get_break_schedule(hour)

master_data_controller = MasterDataController()
