import { useQuery } from "@tanstack/react-query";
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

