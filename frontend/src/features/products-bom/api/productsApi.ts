import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export const useUpsertProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post(API_ENDPOINTS.PRODUCTS, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const res = await apiClient.post("/products/delete", { code });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
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

export const useUpsertMaterialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Material>) => {
      const res = await apiClient.post(API_ENDPOINTS.MATERIALS, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
};

export const useDeleteMaterialMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post("/materials/delete", { id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
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

export const useUpsertBoxMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Box>) => {
      const res = await apiClient.post(API_ENDPOINTS.BOXES, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
    },
  });
};

export const useDeleteBoxMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post("/boxes/delete", { id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boxes"] });
    },
  });
};
