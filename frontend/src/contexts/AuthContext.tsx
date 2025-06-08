
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { authService } from '@/services/authService';
import { SessionManager } from '@/utils/sessionManager';

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
  loading:boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  loading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);  // Check if user is already logged in on mount
  const [loading, setLoading] = useState(true);  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await SessionManager.getAuthSession();
        if (session && session.token) {
          setUser(session.user);
          setIsAuthenticated(true);
          // Set token in authService
          authService.setToken(session.token);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Clear invalid auth data
        await SessionManager.clearAuthSession();
      }finally {
          setLoading(false);
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
      
      // Store session data
      await SessionManager.setAuthSession(response.access_token, user);
      
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
      return false;    }
  };
  
  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.register({ name, email, password });
      authService.setToken(response.access_token);
        // Save user info
      const user = { email, name };
      setUser(user);
      setIsAuthenticated(true);
      
      // Store session data
      await SessionManager.setAuthSession(response.access_token, user);
      
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
    }  };  // Logout function
  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear session data
    await SessionManager.clearAuthSession();
    
    authService.removeToken();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout,loading }}>
      {children}
    </AuthContext.Provider>
  );
};
