// frontend/services/authService.ts
import { AuthResponse, SignupData } from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

class AuthService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Request failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔍 Sending login request...', { email });
      const response = await this.request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      console.log('📥 Login response:', response);
      
      // Handle the nested response structure
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('❌ Login request failed:', error);
      throw error;
    }
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await this.request<any>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      // Handle the nested response structure
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('❌ Signup request failed:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
