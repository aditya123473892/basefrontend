import { EffectivePermission } from '@/types/security';
import { SidebarMenuItem } from '@/types/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

export interface SessionBootstrap {
  permissions: EffectivePermission[];
  sidebarMenus: SidebarMenuItem[];
}

class SessionService {
  async bootstrap(): Promise<SessionBootstrap> {
    const token = localStorage.getItem('token');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/session/bootstrap`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
      return data.data;
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new Error('Session bootstrap timed out. Check backend server and database connection.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }
}

export const sessionService = new SessionService();
