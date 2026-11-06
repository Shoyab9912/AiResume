import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "../api/auth";
import type {
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
  User,
  ApiResponse,
  ApiError,
} from "../types";

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

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (res: ApiResponse<User>) => {
      toast.success(res.message || "Check your email for a verification code");
    },
    onError: handleError,
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),
    onSuccess: handleSuccess,
    onError: handleError,
  });

  const resendOtpMutation = useMutation({
    mutationFn: (payload: ResendOtpPayload) => authApi.resendOtp(payload),
    onSuccess: (res: ApiResponse<null>) => {
      toast.success(res.message || "Code resent");
    },
    onError: handleError,
  });

  const googleMutation = useMutation({
    mutationFn: (credential: string) => authApi.googleAuth(credential),
    onSuccess: handleSuccess,
    onError: handleError,
  });

  return {
    loginMutation,
    registerMutation,
    verifyOtpMutation,
    resendOtpMutation,
    googleMutation,
  };
};