import axios from "axios";
import type { ApiErrorResponse } from "../types";

export const api = axios.create({
  baseURL: "https://api-funval-g6.onrender.com",
});

// Agrega el token automáticamente a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Convierte cualquier error en un mensaje legible
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) return "No se pudo conectar con el servidor";
    const detail = error.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail[0]?.msg ?? "Datos inválidos";
  }
  return "Ocurrió un error inesperado";
}