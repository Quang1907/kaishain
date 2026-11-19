import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Schedule } from "@/core/types/factory-common.types";

export const useScheduleQuery = (date: string, currentHour: number) => {
  return useQuery<Schedule>({
    queryKey: ["schedule", date, currentHour],
    queryFn: async () => {
      const res = await apiClient.get<Schedule>(API_ENDPOINTS.SCHEDULE, {
        params: { date, current_hour: currentHour },
      });
      return res.data;
    },
  });
};

export const useOptimizeScheduleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetDate: string) => {
      const res = await apiClient.post(API_ENDPOINTS.OPTIMIZE, { target_date: targetDate });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};

