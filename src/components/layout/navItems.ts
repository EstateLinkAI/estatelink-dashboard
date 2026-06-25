import { canManageListings, isAdminRole } from '../../auth/roles'

export const navItems = [
  { label: 'Dashboard', to: '/app/dashboard' },
  { label: 'Leads', to: '/app/leads' },
  { label: 'Import Listings', to: '/app/imports', requireManage: true },
  { label: 'Activity Logs', to: '/app/activity-logs', adminOnly: true },
]

export function isNavItemVisible(item: (typeof navItems)[number], role: string | null | undefined) {
  if (item.adminOnly && !isAdminRole(role)) {
    return false
  }

  if (item.requireManage && !canManageListings(role)) {
    return false
  }

  return true
}
