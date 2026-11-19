import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Machine } from "@/core/types/factory-common.types";

export const useMachinesQuery = () => {
  return useQuery<Machine[]>({
    queryKey: ["machines"],
    queryFn: async () => {
      const res = await apiClient.get<Machine[]>(API_ENDPOINTS.MACHINES);
      return res.data;
    },
  });
};

export const useUpsertMachineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (machine: Partial<Machine>) => {
      const res = await apiClient.post(API_ENDPOINTS.MACHINES, machine);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};

export const useDeleteMachineMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (machineId: string) => {
      const res = await apiClient.post("/machines/delete", { id: machineId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["machines"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};
