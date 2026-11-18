import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Workspace, UserRole } from '@innovia/shared';
import { apiRequest } from '../lib/api';
import { sseClient } from '../lib/sse';

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    const token = localStorage.getItem('innovia_access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiRequest<{ user: User; workspace: Workspace }>('/auth/me');
      setUser(data.user);
      setWorkspace(data.workspace);
      sseClient.connect();
    } catch {
      localStorage.removeItem('innovia_access_token');
      localStorage.removeItem('innovia_refresh_token');
      setUser(null);
      setWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();

    const handleExpired = () => {
      logout();
    };

    window.addEventListener('auth_expired', handleExpired);
    return () => window.removeEventListener('auth_expired', handleExpired);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem('innovia_access_token', res.accessToken);
    localStorage.setItem('innovia_refresh_token', res.refreshToken);
    setUser(res.user);
    setWorkspace(res.workspace);
    sseClient.connect();
  };

  const register = async (formData: any) => {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    localStorage.setItem('innovia_access_token', res.accessToken);
    localStorage.setItem('innovia_refresh_token', res.refreshToken);
    setUser(res.user);
    setWorkspace(res.workspace);
    sseClient.connect();
  };

  const logout = () => {
    localStorage.removeItem('innovia_access_token');
    localStorage.removeItem('innovia_refresh_token');
    setUser(null);
    setWorkspace(null);
    sseClient.disconnect();
  };

  const switchDemoRole = async (role: UserRole) => {
    let email = 'creator@innovia.io';
    if (role === 'COLLABORATOR') email = 'sponsor@innovia.io';
    if (role === 'TEAM_MEMBER') email = 'editor@innovia.io';

    await login(email, 'Password123!');
  };

  const refreshProfile = async () => {
    try {
      const data = await apiRequest<{ user: User; workspace: Workspace }>('/auth/me');
      setUser(data.user);
      setWorkspace(data.workspace);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
