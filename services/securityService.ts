import {
  EffectivePermission,
  ModuleRegistryResponse,
  SecurityAuditLog,
  SecurityPermission,
  SecurityRole,
  SecurityUser,
} from '@/types/security';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

class SecurityService {
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

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new Error('Security request timed out. Check backend server and database connection.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async registry() {
    const response = await this.request<{ success: boolean; data: ModuleRegistryResponse }>('/api/security/registry');
    return response.data;
  }

  async roles() {
    const response = await this.request<{ success: boolean; data: SecurityRole[] }>('/api/security/roles');
    return response.data;
  }

  async createRole(data: { roleName: string; description?: string; isActive?: boolean }) {
    const response = await this.request<{ success: boolean; data: SecurityRole }>('/api/security/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updateRole(id: string, data: { roleName?: string; description?: string; isActive?: boolean }) {
    const response = await this.request<{ success: boolean; data: SecurityRole }>(`/api/security/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteRole(id: string) {
    await this.request(`/api/security/roles/${id}`, { method: 'DELETE' });
  }

  async permissions() {
    const response = await this.request<{ success: boolean; data: SecurityPermission[] }>('/api/security/permissions');
    return response.data;
  }

  async roleMatrix(roleId: string) {
    const response = await this.request<{ success: boolean; data: { role: SecurityRole; permissions: SecurityPermission[] } }>(
      `/api/security/roles/${roleId}/matrix`
    );
    return response.data;
  }

  async updateRoleMatrix(roleId: string, permissions: Array<{ permissionId: string; allowed: boolean }>) {
    const response = await this.request<{ success: boolean; data: { role: SecurityRole; permissions: SecurityPermission[] } }>(
      `/api/security/roles/${roleId}/matrix`,
      {
        method: 'PUT',
        body: JSON.stringify({ permissions }),
      }
    );
    return response.data;
  }

  async users() {
    const response = await this.request<{ success: boolean; data: SecurityUser[] }>('/api/security/users');
    return response.data;
  }

  async assignRole(userId: string, roleId: string) {
    const response = await this.request(`/api/security/users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify({ roleId }),
    });
    return response;
  }

  async removeRole(userId: string, roleId: string) {
    const response = await this.request(`/api/security/users/${userId}/roles/${roleId}`, { method: 'DELETE' });
    return response;
  }

  async effectivePermissions(userId?: string) {
    const endpoint = userId ? `/api/security/users/${userId}/permissions` : '/api/security/me/permissions';
    const response = await this.request<{ success: boolean; data: EffectivePermission[] }>(endpoint);
    return response.data;
  }

  async auditLogs() {
    const response = await this.request<{ success: boolean; data: SecurityAuditLog[] }>('/api/security/audit-logs');
    return response.data;
  }
}

export const securityService = new SecurityService();
