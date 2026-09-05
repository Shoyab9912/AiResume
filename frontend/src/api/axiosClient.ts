import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

export const server = "http://localhost:4000/api/v1";

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

const SKIP_REFRESH_PATHS = [
  "/login",
  "/register",
  "/refresh-token",
  "/auth/google",
];

api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const isExemptRequest = SKIP_REFRESH_PATHS.some((path) =>
      originalRequest.url?.includes(path),
    );
    if (isExemptRequest) {
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
        await axios.get(`${server}/auth/refresh-token`, {
          withCredentials: true,
        });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        const isAuthCheck = originalRequest.url?.includes("/auth/me");
        if (!isAuthCheck && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
