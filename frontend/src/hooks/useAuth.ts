import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { getCookie } from "../api/axiosClient";
import axios from "axios";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const hasSessionCookie = Boolean(getCookie("csrf_token"));

  const { data: user = null, isLoading: loading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        return await authApi.getMe();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    enabled: hasSessionCookie,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error(error);
    } finally {
      document.cookie = "csrf_token=; Max-Age=0; path=/;";
      queryClient.clear();
      window.location.href = "/login";
    }
  };

  return {
    user,
    loading: hasSessionCookie ? loading : false,
    isAuth: !!user,
    logout,
  };
};