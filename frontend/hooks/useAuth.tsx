"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  signup: (name: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  saveOnboarding: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const formatAuthError = (detail: any, defaultMsg: string): string => {
  if (!detail) return defaultMsg;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => (d && d.msg ? d.msg : typeof d === "string" ? d : JSON.stringify(d))).join("; ");
  }
  if (typeof detail === "object") {
    return detail.msg || detail.message || JSON.stringify(detail);
  }
  return String(detail);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user on initial render from token
  const loadUser = useCallback(async (authToken: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.user;
      } else {
        localStorage.removeItem("echohire_token");
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn("Could not fetch user profile:", err);
    }
    return null;
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("echohire_token");
    if (savedToken) {
      setToken(savedToken);
      loadUser(savedToken).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.access_token) {
        localStorage.setItem("echohire_token", data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        setIsLoading(false);
        return { success: true, user: data.user };
      } else {
        setIsLoading(false);
        const errMsg = formatAuthError(data.detail, "Invalid email or password");
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { 
        success: false, 
        error: "Unable to connect to EchoHire backend. Please ensure the backend server is running on port 8000." 
      };
    }
  };

  const signup = async (name: string, email: string, password: string, confirmPassword: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim(), 
          password, 
          confirm_password: confirmPassword 
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.access_token) {
        localStorage.setItem("echohire_token", data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        setIsLoading(false);
        return { success: true, user: data.user };
      } else {
        setIsLoading(false);
        const errMsg = formatAuthError(data.detail, "Signup failed. Please verify your details.");
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      setIsLoading(false);
      return { 
        success: false, 
        error: "Unable to connect to EchoHire backend. Please ensure the backend server is running on port 8000." 
      };
    }
  };

  const saveOnboarding = async (onboardingData: Partial<UserProfile>) => {
    const currentToken = token || localStorage.getItem("echohire_token");
    if (!currentToken) return { success: false, error: "Not authenticated" };
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify(onboardingData)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        const errMsg = formatAuthError(data.detail, "Could not save onboarding");
        return { success: false, error: errMsg };
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Network error" };
    }
  };

  const logout = () => {
    localStorage.removeItem("echohire_token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem("echohire_token");
    if (currentToken) {
      await loadUser(currentToken);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, saveOnboarding, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

