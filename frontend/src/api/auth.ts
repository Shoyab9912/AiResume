
import type {
  LoginPayload,
  RegisterPayload,
  User,
  ApiResponse
} from "../types";

import {api} from './axiosClient'


export const authApi = {
  register: (payload: RegisterPayload): Promise<ApiResponse<User>> => {
    return api.post("/users/register", payload);
  },

  login: (payload: LoginPayload): Promise<ApiResponse<User>> => {
    return api.post("/users/login", payload);
  },

  googleAuth: (credential: string): Promise<ApiResponse<User>> => {
    return api.post("/auth/google", { credential });
  },

  getMe: async (): Promise<User> => {
    const res: ApiResponse<User> = await api.get("/users/me");
    return res.data; 
  },

  logout: (): Promise<ApiResponse<null>> => {
    return api.post("/users/logout");
  },
};