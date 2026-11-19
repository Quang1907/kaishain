import { useQuery } from "@tanstack/react-query";
import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Operator } from "@/core/types/factory-common.types";

export const useOperatorsQuery = () => {
  return useQuery<Operator[]>({
    queryKey: ["operators"],
    queryFn: async () => {
      const res = await apiClient.get<Operator[]>(API_ENDPOINTS.OPERATORS);
      return res.data;
    },
  });
};

