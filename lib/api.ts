import axios, { AxiosRequestConfig } from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, 
});

export async function fetchAPI(endpoint: string, options: AxiosRequestConfig = {}) {
  try {
    const response = await api(endpoint, options);
    return response.data;
  } catch (error: any) {
    // Si axios lanza un error, intentamos extraer el mensaje
    if (axios.isAxiosError(error)) {
      throw new Error(
        `API Error: ${error.response?.status} ${error.response?.statusText || error.message}`
      );
    }
    throw error;
  }
}
