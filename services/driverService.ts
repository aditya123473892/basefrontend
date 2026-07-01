import { Driver, CreateDriverData, UpdateDriverData } from '@/types/driver';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

class DriverService {
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

  async getAllDrivers(): Promise<Driver[]> {
    try {
      const response = await this.request<{ success: boolean; data: Driver[] }>('/api/drivers');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Get all drivers failed:', error);
      throw error;
    }
  }

  async getDriverById(id: string): Promise<Driver | null> {
    try {
      const response = await this.request<{ success: boolean; data: Driver }>(`/api/drivers/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Get driver by ID failed:', error);
      throw error;
    }
  }

  async createDriver(driverData: CreateDriverData): Promise<Driver> {
    try {
      const response = await this.request<{ success: boolean; data: Driver }>('/api/drivers', {
        method: 'POST',
        body: JSON.stringify(driverData),
      });
      return response.data;
    } catch (error) {
      console.error('Create driver failed:', error);
      throw error;
    }
  }

  async updateDriver(id: string, updateData: UpdateDriverData): Promise<Driver> {
    try {
      const response = await this.request<{ success: boolean; data: Driver }>(`/api/drivers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      return response.data;
    } catch (error) {
      console.error('Update driver failed:', error);
      throw error;
    }
  }

  async deleteDriver(id: string): Promise<void> {
    try {
      await this.request<{ success: boolean; message: string }>(`/api/drivers/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete driver failed:', error);
      throw error;
    }
  }
}

export const driverService = new DriverService();
export default driverService;
