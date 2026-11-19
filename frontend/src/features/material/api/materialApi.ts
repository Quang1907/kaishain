import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { MaterialPrepLog } from "@/core/types/factory-common.types";

export interface MaterialConfirmPayload {
  log_id: number;
  manager_name: string;
  actual_temp: number;
  notes?: string;
  boxes_ready: boolean;
}

export const materialApi = {
  getMaterialLogs: async (scheduleId?: string, status?: string): Promise<MaterialPrepLog[]> => {
    const params: Record<string, string> = {};
    if (scheduleId) params.schedule_id = scheduleId;
    if (status) params.status = status;
    const res = await apiClient.get<MaterialPrepLog[]>(API_ENDPOINTS.MATERIAL_LOGS, { params });
    return res.data;
  },

  confirmMaterialPrep: async (payload: MaterialConfirmPayload): Promise<{ status: string; message: string }> => {
    const res = await apiClient.post(API_ENDPOINTS.MATERIAL_CONFIRM, payload);
    return res.data;
  },
};

