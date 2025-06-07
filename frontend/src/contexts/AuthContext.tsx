
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { authService } from '@/services/authService';

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we're in an extension context
        if (typeof chrome !== 'undefined' && chrome.storage) {
          const result = await chrome.storage.local.get(['user', 'authToken']);
          if (result.user && result.authToken) {
            const parsedUser = JSON.parse(result.user);
            setUser(parsedUser);
            setIsAuthenticated(true);
            // Set token in authService
            authService.setToken(result.authToken);
          }
        } else {
          // Fallback for development/testing
          const storedUser = localStorage.getItem('user');
          const storedToken = localStorage.getItem('authToken');
          if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            authService.setToken(storedToken);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear invalid auth data
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.remove(['user', 'authToken']);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
        }
      }
    };
    checkAuth();
  }, []);  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login(email, password);
      authService.setToken(response.access_token);
      
      // Get user info from token or separate API call
      const user = { email, name: email.split('@')[0] }; // You can decode JWT to get more user info
      setUser(user);
      setIsAuthenticated(true);
      
      // Store in Chrome storage if available, otherwise localStorage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          user: JSON.stringify(user),
          authToken: response.access_token
        });
      } else {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', response.access_token);
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back!`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.register({ name, email, password });
      authService.setToken(response.access_token);
      
      // Save user info
      const user = { email, name };
      setUser(user);
      setIsAuthenticated(true);
      
      // Store in Chrome storage if available, otherwise localStorage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          user: JSON.stringify(user),
          authToken: response.access_token
        });
      } else {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', response.access_token);
      }
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${name}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Email may already be in use. Please try another email.",
      });
      return false;
    }  };
  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear from Chrome storage if available, otherwise localStorage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(['user', 'authToken']);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
    }
    
    authService.removeToken();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
