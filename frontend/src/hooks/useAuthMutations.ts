
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/auth";
import type { LoginPayload, RegisterPayload, User, ApiResponse,ApiError } from "../types";




export const useAuthMutations = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSuccess = (res: ApiResponse<User>) => {
    queryClient.setQueryData(["authUser"], res.data);
    toast.success(res.message || "Welcome back!");
    navigate("/");
  };

  const handleError = (error: ApiError) => {
    const message = error.response?.data?.message || "Something went wrong. Please try again.";
    toast.error(message);
  };

  // 1. Login Mutation
  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: handleSuccess,
    onError: handleError,
  });

  // 2. Register Mutation
  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: handleSuccess,
    onError: handleError,
  });

  // 3. Google Auth Mutation
  const googleMutation = useMutation({
    mutationFn: (credential: string) => authApi.googleAuth(credential),
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return {
    loginMutation,
    registerMutation,
    googleMutation,
  };
};