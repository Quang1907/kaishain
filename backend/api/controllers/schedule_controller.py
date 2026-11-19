"""
Schedule & Shipping Orders Controller
Xử lý các endpoint /api/schedule, /api/optimize, /api/readiness, /api/jobs, /api/shipping-orders
"""
from typing import Dict, Any, List
from backend.infrastructure.repositories.facade import repository
from backend.services.resource_service import ResourceManager
from backend.services.brain_service import FactoryBrainOptimizer
from backend.core.response import success_response

class ScheduleController:
    def _get_managers(self):
        machines = repository.get_all_machines()
        products = repository.get_all_products()
        operators = repository.get_all_operators()
        res_mgr = ResourceManager(products, operators)
        brain = FactoryBrainOptimizer(machines, products, operators)
        return machines, products, operators, res_mgr, brain

    def get_all_schedules(self) -> List[Dict[str, Any]]:
        return repository.get_all_schedules()

    def get_schedule(self, params: Dict[str, Any]) -> Dict[str, Any]:
        date_req = params.get("date", ["2026-11-12"])[0]
        curr_h = float(params.get("current_hour", [8.0])[0])
        _, _, _, res_mgr, brain = self._get_managers()

        sched = repository.get_schedule_by_date(date_req)
        if not sched:
            if date_req == "optimized":
                orders = repository.get_all_shipping_orders()
                sched = brain.auto_optimize_schedule(orders)
            else:
                sched = repository.get_schedule_by_date("2026-11-12")

        if not sched:
            sched = {"id": date_req, "date": date_req, "day_of_week": "", "jobs": [], "notes": []}

        enriched_jobs = []
        for job in sched.get("jobs", []):
            j_copy = dict(job)
            prereq = res_mgr.evaluate_job_prerequisites(j_copy, curr_h)
            j_copy["prerequisites"] = prereq
            enriched_jobs.append(j_copy)

        resp = dict(sched)
        resp["jobs"] = enriched_jobs
        return resp

    def optimize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        target_date = payload.get("target_date", "2026-11-14")
        _, _, _, _, brain = self._get_managers()
        orders = repository.get_all_shipping_orders()
        return brain.auto_optimize_schedule(orders, target_date)

    def readiness(self, params: Dict[str, Any]) -> Any:
        date_req = params.get("date", ["2026-11-13"])[0]
        curr_h = float(params.get("current_hour", [8.0])[0])
        _, _, _, _, brain = self._get_managers()

        sched = repository.get_schedule_by_date(date_req)
        jobs = sched["jobs"] if sched else []
        orders = repository.get_all_shipping_orders()
        return brain.analyze_shipping_readiness(orders, jobs, curr_h)

    def upsert_job(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        sched_id = payload.get("schedule_id") or payload.get("date", "2026-11-12")
        j_id = repository.upsert_job_block(sched_id, payload)
        return success_response({"job_id": j_id})

    def delete_job(self, payload: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
        j_id = payload.get("id") or payload.get("job_id") or params.get("id", [None])[0]
        if j_id:
            repository.delete_job_block(j_id)
        return success_response({"deleted_job_id": j_id})

    def get_shipping_orders(self) -> Any:
        return repository.get_all_shipping_orders()

    def upsert_shipping_order(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        order = {
            "order_id": payload.get("order_id", "SO-NEW"),
            "customer": payload.get("customer", "Khách hàng mới"),
            "product": payload.get("product", "W165"),
            "order_qty": int(payload.get("order_qty", 500)),
            "ship_date": payload.get("ship_date", "2026-11-14"),
            "ship_deadline_hour": float(payload.get("ship_deadline_hour", 17.0)),
            "status": payload.get("status", "PREPARING"),
            "safety_buffer_units": int(payload.get("safety_buffer_units", 0))
        }
        repository.upsert_shipping_order(order)
        return success_response({"order": order})

    def delete_shipping_order(self, payload: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
        order_id = payload.get("order_id") or params.get("order_id", [None])[0]
        if order_id:
            repository.delete_shipping_order(order_id)
        return success_response({"deleted_order_id": order_id})

schedule_controller = ScheduleController()
