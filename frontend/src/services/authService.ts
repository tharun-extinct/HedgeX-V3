const API_URL = 'http://localhost:8000';  // Update this to match your backend URL
import { SessionManager } from '@/utils/sessionManager';

interface LoginResponse {
    access_token: string;
    token_type: string;
}

interface UserRegisterData {
    name: string;
    email: string;
    password: string;
}

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        return response.json();
    },

    async register(data: UserRegisterData): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        return response.json();
    },    // Store the token
    setToken(token: string) {
        // This method is kept for compatibility but SessionManager handles storage
        // Just send message to background script if available
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage({ type: 'SET_AUTH_TOKEN', token }).catch(console.error);
            }
        } catch (error) {
            console.error('Error setting token:', error);
        }
    },

    // Get the stored token
    async getToken(): Promise<string | null> {
        return await SessionManager.getToken();
    },

    // Remove the token
    async removeToken() {
        await SessionManager.clearAuthSession();
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage({ type: 'LOGOUT' }).catch(console.error);
            }
        } catch (error) {
            console.error('Error removing token:', error);
        }
    },

    // Check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        return await SessionManager.isAuthenticated();
    }
};
