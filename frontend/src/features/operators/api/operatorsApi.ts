import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const useUpsertOperatorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (operator: Partial<Operator>) => {
      const res = await apiClient.post(API_ENDPOINTS.OPERATORS, operator);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};

export const useDeleteOperatorMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (operatorIdOrName: string | number) => {
      const res = await apiClient.post("/operators/delete", { id: operatorIdOrName });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operators"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};
