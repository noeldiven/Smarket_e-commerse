import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "./auth-context";
import type { LoginRequest, User } from "../types";
import { getMe, loginRequest } from "../services/authService";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Si hay token guardado, arrancamos "cargando" hasta verificarlo
  const [loading, setLoading] = useState(() => localStorage.getItem("token") !== null);

  // Al recargar la página, recupera la sesión con /auth/me
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("token")) // token vencido
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials: LoginRequest): Promise<User> => {
    const { access_token } = await loginRequest(credentials);
    localStorage.setItem("token", access_token);
    const me = await getMe();
    setUser(me);
    return me;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isAdmin: user?.role === "admin",
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}