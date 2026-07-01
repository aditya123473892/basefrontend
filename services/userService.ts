import { User, CreateUserData, UpdateUserData } from '@/types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

class UserService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
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

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await this.request<{ success: boolean; data: User[] }>('/api/users');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Get all users failed:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await this.request<{ success: boolean; data: User }>(`/api/users/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Get user by ID failed:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      const response = await this.request<{ success: boolean; data: User }>('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return response.data;
    } catch (error) {
      console.error('Create user failed:', error);
      throw error;
    }
  }

  async updateUser(id: string, updateData: UpdateUserData): Promise<User> {
    try {
      const response = await this.request<{ success: boolean; data: User }>(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      return response.data;
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.request<{ success: boolean; message: string }>(`/api/users/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;
