import axios, { AxiosInstance } from "axios"
// import { headers } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"
const AUTH_API_BASE_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL


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
  baseURL: AUTH_API_BASE_URL,
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
