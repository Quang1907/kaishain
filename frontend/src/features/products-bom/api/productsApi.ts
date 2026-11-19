import { useQuery } from "@tanstack/react-query";
import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { ProductDetail, Material, Box } from "@/core/types/factory-common.types";

export const useProductsQuery = () => {
  return useQuery<ProductDetail[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await apiClient.get<Record<string, ProductDetail> | ProductDetail[]>(
        API_ENDPOINTS.PRODUCTS
      );
      if (res.data && !Array.isArray(res.data) && typeof res.data === "object") {
        return Object.values(res.data);
      }
      return Array.isArray(res.data) ? res.data : [];
    },
  });
};

export const useMaterialsQuery = () => {
  return useQuery<Material[]>({
    queryKey: ["materials"],
    queryFn: async () => {
      const res = await apiClient.get<Material[]>(API_ENDPOINTS.MATERIALS);
      return res.data;
    },
  });
};

export const useBoxesQuery = () => {
  return useQuery<Box[]>({
    queryKey: ["boxes"],
    queryFn: async () => {
      const res = await apiClient.get<Box[]>(API_ENDPOINTS.BOXES);
      return res.data;
    },
  });
};
