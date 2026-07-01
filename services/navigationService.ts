import { SidebarMenuItem } from '@/types/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

class NavigationService {
  async sidebar(): Promise<SidebarMenuItem[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/navigation/sidebar`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data.data || [];
  }
}

export const navigationService = new NavigationService();
