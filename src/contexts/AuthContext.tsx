import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CredentialResponse } from '@react-oauth/google';
import { postGoogleAuth, getUserProfile, setAuthToken, postLogout } from '../services/api';

// User interface matching the database schema
export interface User {
  id: string;
  google_id?: string; // optional in frontend, backend returns id/email/name/picture
  email: string;
  name: string;
  profile_picture_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentialResponse: CredentialResponse) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check authentication status
  const checkAuth = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        setAuthToken(storedToken);
        // Try fetching profile to validate token
        const profile = await getUserProfile();
        setUser(profile as User);
        localStorage.setItem('user', JSON.stringify(profile));
      } else {
        // Clear any stale auth
        setAuthToken(null);
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setAuthToken(null);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const login = async (credentialResponse: CredentialResponse): Promise<void> => {
    setIsLoading(true);
    try {
      const credential = credentialResponse.credential;
      if (!credential) throw new Error('Missing Google credential');

      const data = await postGoogleAuth(credential);

      // Store token
      localStorage.setItem('authToken', data.token);
      setToken(data.token);
      setAuthToken(data.token);

      // Store user
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        profile_picture_url: data.user.profile_picture_url ?? null,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const logout = async (): Promise<void> => {
    try {
      await postLogout();
    } catch (err) {
      // ignore network errors during logout
      console.warn('Logout call failed, proceeding to clear local state');
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};