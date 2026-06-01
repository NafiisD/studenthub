"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { logApiCall } from "@/data/mockData";

export type UserRole = "ADMIN" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token?: string; // JWT Bearer Token Simulation
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Generate dummy token (Base64 simulated JWT)
const generateMockToken = (userId: string, role: string) => {
  if (typeof window === "undefined") return "";
  const payload = { sub: userId, role, iss: "studenthub-auth-server", exp: Date.now() + 3600000 };
  return btoa(JSON.stringify(payload));
};

// Mock database for users
const MOCK_USERS = [
  { id: "usr-admin", name: "Administrator StudentHub", email: "admin@studenthub.id", password: "admin123", role: "ADMIN" as UserRole },
  { id: "usr-stud", name: "Budi Santoso", email: "mahasiswa@studenthub.id", password: "student123", role: "USER" as UserRole },
  { id: "usr-client", name: "Sinar Jaya Corp", email: "client@studenthub.id", password: "client123", role: "USER" as UserRole }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = localStorage.getItem("studenthub_session");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        if (parsed && parsed.role) {
          const normalized = parsed.role.toUpperCase();
          parsed.role = (normalized === "ADMIN" || normalized === "SUPER_ADMIN" || normalized === "SUPER ADMIN") ? "ADMIN" : "USER";
        }
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse saved session", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Get registered users from localStorage (in case user registered a new account)
    const localUsersStr = localStorage.getItem("studenthub_registered_users");
    const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
    const allUsers = [...MOCK_USERS, ...localUsers];

    const foundUser = allUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const generatedToken = generateMockToken(foundUser.id, foundUser.role);
      const sessionUser: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        token: generatedToken,
      };
      localStorage.setItem("studenthub_session", JSON.stringify(sessionUser));
      setUser(sessionUser);

      // Log the AUTH login endpoint
      logApiCall(
        "POST",
        "/auth/login",
        {},
        { email, password: "[HIDDEN]" },
        200,
        "OK",
        { success: true, user: { id: foundUser.id, name: foundUser.name, role: foundUser.role }, token: generatedToken }
      );

      setIsLoading(false);
      return { success: true };
    }

    logApiCall(
      "POST",
      "/auth/login",
      {},
      { email, password: "[HIDDEN]" },
      401,
      "Unauthorized",
      { success: false, error: "Invalid credentials" }
    );

    setIsLoading(false);
    return { success: false, error: "Email atau password yang Anda masukkan salah." };
  };

  const register = async (name: string, email: string, role: UserRole) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const localUsersStr = localStorage.getItem("studenthub_registered_users");
    const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
    const allUsers = [...MOCK_USERS, ...localUsers];

    // Check if email already exists
    if (allUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      logApiCall(
        "POST",
        "/auth/register",
        {},
        { name, email, role },
        400,
        "Bad Request",
        { success: false, error: "Email already registered" }
      );
      setIsLoading(false);
      return { success: false, error: "Email sudah terdaftar. Silakan gunakan email lain." };
    }

    // Create new mock user (using standard password for mock registration demo)
    const newUser = {
      id: `usr-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      password: "password123", // Default password for new accounts in this mock
      role,
    };

    localStorage.setItem("studenthub_registered_users", JSON.stringify([...localUsers, newUser]));

    // Auto login
    const generatedToken = generateMockToken(newUser.id, newUser.role);
    const sessionUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: generatedToken,
    };
    localStorage.setItem("studenthub_session", JSON.stringify(sessionUser));
    setUser(sessionUser);

    // Log register and otp verification
    logApiCall(
      "POST",
      "/auth/register",
      {},
      { name, email, role },
      201,
      "Created",
      { success: true, user: { id: newUser.id, name: newUser.name, role: newUser.role } }
    );
    
    logApiCall(
      "POST",
      "/auth/verify-otp",
      {},
      { email, code: "123456" },
      200,
      "OK",
      { success: true, message: "OTP Verified successfully" }
    );

    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem("studenthub_session");
    setUser(null);
  };

  // Implement GET /users/me and PATCH /users/me
  const updateProfile = async (name: string, email: string) => {
    if (!user) return { success: false, error: "Not logged in" };

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Update in MOCK_USERS / localStorage registered users
    const localUsersStr = localStorage.getItem("studenthub_registered_users");
    const localUsers = localUsersStr ? JSON.parse(localUsersStr) : [];
    
    const idx = localUsers.findIndex((u: any) => u.id === user.id);
    if (idx !== -1) {
      localUsers[idx].name = name;
      localUsers[idx].email = email;
      localStorage.setItem("studenthub_registered_users", JSON.stringify(localUsers));
    }

    const updatedUser: User = {
      ...user,
      name,
      email,
    };
    localStorage.setItem("studenthub_session", JSON.stringify(updatedUser));
    setUser(updatedUser);

    logApiCall(
      "PATCH",
      "/users/me",
      { Authorization: `Bearer ${user.token || ""}` },
      { name, email },
      200,
      "OK",
      { success: true, user: updatedUser }
    );

    setIsLoading(false);
    return { success: true };
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
