import { Trip, CreateTripData, UpdateTripData } from '@/types/trip';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

class TripService {
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

  async getAllTrips(): Promise<Trip[]> {
    try {
      const response = await this.request<{ success: boolean; data: Trip[] }>('/api/trips');
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Get all trips failed:', error);
      throw error;
    }
  }

  async getTripById(id: string): Promise<Trip | null> {
    try {
      const response = await this.request<{ success: boolean; data: Trip }>(`/api/trips/${id}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Get trip by ID failed:', error);
      throw error;
    }
  }

  async createTrip(tripData: CreateTripData): Promise<Trip> {
    try {
      const response = await this.request<{ success: boolean; data: Trip }>('/api/trips', {
        method: 'POST',
        body: JSON.stringify(tripData),
      });
      return response.data;
    } catch (error) {
      console.error('Create trip failed:', error);
      throw error;
    }
  }

  async updateTrip(id: string, updateData: UpdateTripData): Promise<Trip> {
    try {
      const response = await this.request<{ success: boolean; data: Trip }>(`/api/trips/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
      return response.data;
    } catch (error) {
      console.error('Update trip failed:', error);
      throw error;
    }
  }

  async deleteTrip(id: string): Promise<void> {
    try {
      await this.request<{ success: boolean; message: string }>(`/api/trips/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete trip failed:', error);
      throw error;
    }
  }
}

export const tripService = new TripService();
export default tripService;
