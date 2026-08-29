
import type {
  LoginPayload,
  RegisterPayload,
  User,
  ApiResponse
} from "../types";

import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

export const server = "http://localhost:4000";

export const api = axios.create({
  baseURL: server,
  withCredentials: true,
});

interface QueueItem {
  resolve: (value?: void) => void;
  reject: (reason?: unknown) => void;
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (originalRequest.url?.includes("/me") || originalRequest.url?.includes("/login") || originalRequest.url?.includes("/refresh-token")) {
    return Promise.reject(error);
  }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.get(`${server}/api/v1/users/refresh-token`, {
          withCredentials: true,
        });

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);




export const authApi = {
  register: (payload: RegisterPayload): Promise<ApiResponse<User>> => {
    return api.post("/api/v1/users/register", payload);
  },

  login: (payload: LoginPayload): Promise<ApiResponse<User>> => {
    return api.post("/api/v1/users/login", payload);
  },

  googleAuth: (credential: string): Promise<ApiResponse<User>> => {
    return api.post("/api/v1/auth/google", { credential });
  },

  getMe: async (): Promise<User> => {
    const res: ApiResponse<User> = await api.get("/api/v1/users/me");
    return res.data; 
  },

  logout: (): Promise<ApiResponse<null>> => {
    return api.post("/api/v1/users/logout");
  },
};