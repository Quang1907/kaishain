import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";

export interface OperatorReportPayload {
  machine_id: string;
  product_code: string;
  actual_qty: number;
  scraps: number;
  operator_name: string;
  note?: string;
}

export const workstationApi = {
  submitShiftReport: async (
    payload: OperatorReportPayload
  ): Promise<{ status: string; message: string }> => {
    const res = await apiClient.post(API_ENDPOINTS.OPERATOR_REPORT, payload);
    return res.data;
  },
};

