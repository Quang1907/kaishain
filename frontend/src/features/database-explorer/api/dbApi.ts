import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { DbStats, FeedbackLog } from "@/core/types/factory-common.types";

export const useDbStatsQuery = () => {
  return useQuery<DbStats>({
    queryKey: ["db-stats"],
    queryFn: async () => {
      const res = await apiClient.get<DbStats>(API_ENDPOINTS.DB_STATS);
      return res.data;
    },
  });
};

export const useFeedbackLogsQuery = () => {
  return useQuery<FeedbackLog[]>({
    queryKey: ["feedback-logs"],
    queryFn: async () => {
      const res = await apiClient.get<FeedbackLog[]>(API_ENDPOINTS.FEEDBACK_LOGS);
      return res.data;
    },
  });
};

export const useResetDbMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(API_ENDPOINTS.DB_RESET);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

