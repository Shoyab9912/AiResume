import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";




function getCookie(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
}



const apiBaseUrl = import.meta.env.VITE_API_URL;

if (!apiBaseUrl) {
  throw new Error("vite api url is missing");
}


export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});



api.interceptors.request.use((config) => {
  const method = (config.method || "get").toUpperCase();

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfToken = getCookie("csrf_token");

    if (csrfToken) {
      config.headers = config.headers || {};
      config.headers["x-csrf-token"] = csrfToken;
    }
  }

  return config;
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
        await axios.get(`${apiBaseUrl}/auth/refresh-token`, {
          withCredentials: true,
        });
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
