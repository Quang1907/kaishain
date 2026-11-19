import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { ShippingOrder } from "@/core/types/factory-common.types";

export const useShippingOrdersQuery = () => {
  return useQuery<ShippingOrder[]>({
    queryKey: ["shipping-orders"],
    queryFn: async () => {
      const res = await apiClient.get<ShippingOrder[]>(API_ENDPOINTS.SHIPPING_ORDERS);
      return res.data;
    },
  });
};

export const useCreateShippingOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newOrder: Partial<ShippingOrder>) => {
      const res = await apiClient.post(API_ENDPOINTS.SHIPPING_ORDERS, newOrder);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipping-orders"] });
    },
  });
};

