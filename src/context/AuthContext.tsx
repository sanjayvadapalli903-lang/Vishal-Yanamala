import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (
    identifier: string,
    password: string,
    selectedRole: UserRole,
    rememberMe: boolean
  ) => Promise<{ success: boolean; message?: string; roleMismatch?: boolean; actualRole?: UserRole }>;
  logout: () => Promise<void>;
  resetPassword: (identifier: string, newPassword?: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: { name?: string; department?: string; avatarUrl?: string }) => Promise<{ success: boolean; message: string; user?: User }>;
  clearError: () => void;
  setUserDirectly: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const initSession = async () => {
      const savedToken = localStorage.getItem('smartcampus_token') || sessionStorage.getItem('smartcampus_token');
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setRole(data.user.role);
            setToken(savedToken);
          } else {
            localStorage.removeItem('smartcampus_token');
            sessionStorage.removeItem('smartcampus_token');
          }
        } else {
          localStorage.removeItem('smartcampus_token');
          sessionStorage.removeItem('smartcampus_token');
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const login = async (
    identifier: string,
    password: string,
    selectedRole: UserRole,
    rememberMe: boolean
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier,
          password,
          selectedRole,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Authentication failed. Please try again.';
        setError(errorMsg);
        setIsLoading(false);
        return {
          success: false,
          message: errorMsg,
          roleMismatch: data.roleMismatch || false,
          actualRole: data.userActualRole,
        };
      }

      // Successful login
      setUser(data.user);
      setRole(data.user.role);
      setToken(data.token);

      if (rememberMe) {
        localStorage.setItem('smartcampus_token', data.token);
      } else {
        sessionStorage.setItem('smartcampus_token', data.token);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Network error occurred during login.';
      setError(errorMsg);
      setIsLoading(false);
      return { success: false, message: errorMsg };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('smartcampus_token');
      sessionStorage.removeItem('smartcampus_token');
      setUser(null);
      setRole(null);
      setToken(null);
      setError(null);
    }
  };

  const resetPassword = async (identifier: string, newPassword?: string) => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, newPassword }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (err: any) {
      return { success: false, message: 'Password reset request failed. Please check your network.' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) return { success: false, message: 'Not authenticated.' };
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (err: any) {
      return { success: false, message: 'Failed to update password. Please check your connection.' };
    }
  };

  const updateProfile = async (updates: { name?: string; department?: string; avatarUrl?: string }) => {
    if (!token) return { success: false, message: 'Not authenticated.' };
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      }
      return { success: data.success, message: data.message, user: data.user };
    } catch (err: any) {
      return { success: false, message: 'Failed to update profile.' };
    }
  };

  const clearError = () => setError(null);

  const setUserDirectly = (newUser: User, newToken: string) => {
    setUser(newUser);
    setRole(newUser.role);
    setToken(newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        logout,
        resetPassword,
        changePassword,
        updateProfile,
        clearError,
        setUserDirectly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
