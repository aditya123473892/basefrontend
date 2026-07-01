export interface SidebarMenuItem {
  id: string;
  label: string;
  path: string | null;
  iconKey: string | null;
  moduleKey: string | null;
  action: string | null;
  children: SidebarMenuItem[];
}
