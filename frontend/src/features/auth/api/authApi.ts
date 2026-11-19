import apiClient from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { User } from "@/core/types/factory-common.types";

export interface LoginResponse {
  status: "success" | "error";
  token?: string;
  user?: User;
  permissions?: Record<string, boolean>;
  message?: string;
}

export interface MeResponse {
  status: "success" | "guest";
  user: User | null;
  permissions: Record<string, boolean>;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH_LOGIN, {
      username,
      password,
    });
    return res.data;
  },

  getMe: async (): Promise<MeResponse> => {
    const res = await apiClient.get<MeResponse>(API_ENDPOINTS.AUTH_ME);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
    localStorage.removeItem("aps_token");
  },

  getAllUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>(API_ENDPOINTS.USERS);
    return res.data;
  },
};
