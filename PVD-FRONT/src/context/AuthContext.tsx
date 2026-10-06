import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface UserPayload {
  id: string; // UUID
  role: 'admin' | 'user';
  status: 'active' | 'off';
  name: string;
}

interface AuthContextType {
  token: string | null;
  user: UserPayload | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UserPayload | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode<UserPayload & { exp?: number }>(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }
        setUser(decoded);
        localStorage.setItem('token', token);
      } catch (err) {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
  };
  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
