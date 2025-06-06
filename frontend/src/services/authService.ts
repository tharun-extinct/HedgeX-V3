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
    },

    // Store the token
    setToken(token: string) {
        localStorage.setItem('token', token);
    },

    // Get the stored token
    getToken(): string | null {
        return localStorage.getItem('token');
    },

    // Remove the token
    removeToken() {
        localStorage.removeItem('token');
    },

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!this.getToken();
    }
};
