"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "ADMIN" | "USER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("studenthub_token");
    if (token) {
      // Validate token and fetch user data
      fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          const isSuccess = data.success === true || data.status === "success" || (data.code >= 200 && data.code < 300);
          if (isSuccess && data.data) {
            const userData = data.data.user || data.data;
            setUser({ ...userData, token });
          } else {
            localStorage.removeItem("studenthub_token");
          }
        })
        .catch(err => {
          console.error("Failed to fetch user", err);
          localStorage.removeItem("studenthub_token");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [API_URL]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      console.log("RESPON ASLI BACKEND:", data);

      const isSuccess = data.success === true || data.status === "success" || (res.ok && (data.code >= 200 && data.code < 300));

      if (res.ok && isSuccess) {
        const token = data.data?.access_token || data.data?.token || data.access_token || data.token;
        const userData = data.data?.user || (data.data?.id ? data.data : null); 
        
        if (token) {
          localStorage.setItem("studenthub_token", token);
        }
        
        if (userData && userData.id) {
          const finalUser = { ...userData, token };
          setUser(finalUser);
          setIsLoading(false);
          return { success: true, user: finalUser };
        } else if (token) {
          const meRes = await fetch(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const meData = await meRes.json();
          const isMeSuccess = meData.success === true || meData.status === "success" || (meRes.ok && (meData.code >= 200 && meData.code < 300));
          if (isMeSuccess) {
            const fetchedUser = meData.data?.user || meData.data;
            const finalUser = { ...fetchedUser, token };
            setUser(finalUser);
            setIsLoading(false);
            return { success: true, user: finalUser };
          }
        }

        const fallbackUser = { ...userData, token };
        setIsLoading(false);
        return { success: true, user: fallbackUser };
      } else {
        setIsLoading(false);
        return { success: false, error: data.message || "Email atau password salah." };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Terjadi kesalahan pada server saat login." };
    }
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      const isSuccess = data.success === true || data.status === "success" || (res.ok && (data.code >= 200 && data.code < 300));

      if (res.ok && isSuccess) {
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        let errorMsg = data.message;
        if (Array.isArray(data.message)) {
          errorMsg = data.message.join(", ");
        }
        return { success: false, error: errorMsg || "Gagal mendaftar." };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Terjadi kesalahan pada server saat mendaftar." };
    }
  };

  const logout = () => {
    localStorage.removeItem("studenthub_token");
    setUser(null);
  };

  const updateProfile = async (name: string, email: string) => {
    if (!user) return { success: false, error: "Not logged in" };
    setIsLoading(true);
    try {
      const token = localStorage.getItem("studenthub_token");
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });
      const data = await res.json();
      
      const isSuccess = data.success === true || data.status === "success" || (res.ok && (data.code >= 200 && data.code < 300));
      
      if (res.ok && isSuccess) {
        setUser(prev => prev ? { ...prev, name, email } : null);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.message || "Gagal memperbarui profil." };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Terjadi kesalahan pada server saat update." };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
