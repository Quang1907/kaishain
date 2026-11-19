import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Schedule, JobBlock } from "@/core/types/factory-common.types";

export interface ScheduleMeta {
  id: string;
  date: string;
  day_of_week: string;
  is_optimized: boolean;
}

// Lấy danh sách toàn bộ ngày lịch trình thực tế từ Database
export const useSchedulesQuery = () => {
  return useQuery<ScheduleMeta[]>({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await apiClient.get<ScheduleMeta[]>(API_ENDPOINTS.SCHEDULES);
      return res.data;
    },
  });
};

// Lấy chi tiết lịch và các khối việc thực tế từ Database
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

// Cập nhật hoặc Thêm mới Job Block trực tiếp vào Database
export const useUpsertJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { schedule_id: string; job: Partial<JobBlock> }) => {
      const res = await apiClient.post(API_ENDPOINTS.JOBS, {
        schedule_id: payload.schedule_id,
        ...payload.job,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};

// Xóa Job Block trực tiếp khỏi Database
export const useDeleteJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const res = await apiClient.post(API_ENDPOINTS.JOBS_DELETE, { id: jobId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};

// Kích hoạt thuật toán AI tối ưu lịch trình và lưu vào Database
export const useOptimizeScheduleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetDate: string) => {
      const res = await apiClient.post(API_ENDPOINTS.OPTIMIZE, { target_date: targetDate });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    },
  });
};
