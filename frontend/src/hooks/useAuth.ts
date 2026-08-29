import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading:loading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        return await authApi.getMe();
      } catch (error) {
        return null; 
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.log(e);
    } finally {
      queryClient.setQueryData(["authUser"], null);
      window.location.href = "/login";
    }
  };

  return {
    user,
    loading,
    isAuth: !!user,
    logout,
  };
};