import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue = [];

function processQueue(error) {
  pendingQueue.forEach((resolve) => resolve(error));
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/refresh-token")) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((refreshError) => {
            if (refreshError) {
              reject(error);
            } else {
              resolve(api(originalRequest));
            }
          });
        });
      }

      isRefreshing = true;
      try {
        await api.post("/refresh-token");
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
  }
);

export function getApiErrorMessage(error, fallback = "Something went wrong") {
  return error?.response?.data?.message || fallback;
}
