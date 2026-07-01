export interface SecurityRole {
  id: string;
  company_id: string;
  role_name: string;
  description: string | null;
  is_system_role: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_by: string | null;
  updated_at: string | null;
}

export interface SecurityPermission {
  permission_id?: string;
  id?: string;
  module_key: string;
  module_name: string;
  action: string;
  description: string | null;
  allowed?: boolean;
}

export interface SecurityUserRole {
  id: string;
  user_id: string;
  role_id: string;
  role_name: string;
  is_system_role: boolean;
}

export interface SecurityUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  roles: SecurityUserRole[];
}

export interface EffectivePermission {
  moduleKey: string;
  moduleName: string;
  action: string;
  allowed: boolean;
}

export interface SecurityAuditLog {
  id: string;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: string | null;
  created_at: string;
}

export interface ModuleRegistryResponse {
  modules: Array<{ moduleKey: string; moduleName: string }>;
  actions: string[];
}
