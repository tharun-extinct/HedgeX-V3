const API_URL = 'http://localhost:8000';  // Update this to match your backend URL

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
    async setToken(token: string) {
        // @ts-ignore - Chrome API
        await chrome.storage.local.set({ authToken: token });
        // Notify background script
        // @ts-ignore - Chrome API
        await chrome.runtime.sendMessage({ type: 'SET_AUTH_TOKEN', token });
    },

    // Get the stored token
    async getToken(): Promise<string | null> {
        // @ts-ignore - Chrome API
        const result = await chrome.storage.local.get(['authToken']);
        return result.authToken || null;
    },

    // Remove the token
    async removeToken() {
        // @ts-ignore - Chrome API
        await chrome.storage.local.remove('authToken');
        // Notify background script
        // @ts-ignore - Chrome API
        await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.getToken();
    }
};
