import {api} from "@/services/api";

interface LoginRequest {
    email: string;
    password: string;
}

interface AuthResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        rule: string;
    };
}

class AuthService {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const { data } = await api.post<AuthResponse>('/login', credentials);
        return data;
    }

    async logout(): Promise<void> {
        await api.post('/logout');
    }

    async getCurrentUser(): Promise<AuthResponse['user']> {
        const { data } = await api.get<AuthResponse['user']>('/me');
        return data;
    }
}

export const authService = new AuthService();