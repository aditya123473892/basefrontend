import {
  SidebarMenuRow,
  SidebarMenuItem,
} from '@/types/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

class NavigationService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      const contentType = response.headers.get('content-type');
      let data: any = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        const message = data?.error || `Request failed: ${response.status}`;
        throw new Error(message);
      }

      return (data ?? {}) as T;
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new Error('Navigation request timed out. Check backend server and database connection.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async getSidebarMenus() {
    const response = await this.request<{ success: boolean; data: SidebarMenuItem[] }>('/api/navigation/sidebar');
    return response.data;
  }

  async getAllMenus() {
    const response = await this.request<{ success: boolean; data: SidebarMenuRow[] }>('/api/navigation/menus');
    return response.data;
  }

  async createMenu(data: {
    label: string;
    path?: string | null;
    iconKey?: string | null;
    permissionModuleKey?: string | null;
    permissionAction?: string | null;
    parentId?: string | null;
    sortOrder?: number;
  }) {
    const response = await this.request<{ success: boolean; data: SidebarMenuRow }>('/api/navigation/menus', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateMenu(id: string, data: {
    label?: string;
    path?: string | null;
    iconKey?: string | null;
    permissionModuleKey?: string | null;
    permissionAction?: string | null;
    parentId?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    const response = await this.request<{ success: boolean; data: SidebarMenuRow }>(`/api/navigation/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteMenu(id: string) {
    await this.request(`/api/navigation/menus/${id}`, { method: 'DELETE' });
  }
}

export const navigationService = new NavigationService();