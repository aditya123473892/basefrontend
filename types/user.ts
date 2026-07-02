export interface User {
  id: string;
  company_id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string | null;
  roles?: Array<{
    id: string;
    user_id: string;
    role_id: string;
    role_name: string;
    is_system_role: boolean;
  }>;
}

export interface CreateUserData {
  email: string;
  full_name: string;
  password: string;
  role?: string;
  roleIds: string[];
}

export interface UpdateUserData {
  full_name?: string;
  role?: string;
  is_active?: boolean;
  roleIds: string[];
}
