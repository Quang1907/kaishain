import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { MoldChangeLog } from "@/core/types/factory-common.types";

export interface MoldConfirmPayload {
  log_id: number;
  technician_name: string;
  notes?: string;
  checks: {
    cooling_water: boolean;
    clamping_force: boolean;
    barrel_temp: boolean;
    first_shot_qc: boolean;
  };
}

export const technicianApi = {
  getMoldLogs: async (scheduleId?: string, status?: string): Promise<MoldChangeLog[]> => {
    const params: Record<string, string> = {};
    if (scheduleId) params.schedule_id = scheduleId;
    if (status) params.status = status;
    const res = await apiClient.get<MoldChangeLog[]>(API_ENDPOINTS.MOLD_LOGS, { params });
    return res.data;
  },

  confirmMoldChange: async (payload: MoldConfirmPayload): Promise<{ status: string; message: string }> => {
    const res = await apiClient.post(API_ENDPOINTS.MOLD_CONFIRM, payload);
    return res.data;
  },
};

