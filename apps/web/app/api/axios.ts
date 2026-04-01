import axios, { AxiosInstance } from "axios"
// import { headers } from "next/headers";

const API_BASE_URL =
  "/api/proxy"
// Authenticated Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // headers: Object.fromEntries(await headers()),
})


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error)
  }
)

export default api

export const apiWithAuth = axios.create({
  baseURL: "",
  withCredentials: true,
})

apiWithAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data) {
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error)
  }
)
