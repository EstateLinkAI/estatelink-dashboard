export function isAdminRole(role: string | null | undefined) {
  return role?.trim().toLowerCase() === 'admin'
}

export function isAnalystRole(role: string | null | undefined) {
  return role?.trim().toLowerCase() === 'analyst'
}

export function canManageListings(role: string | null | undefined) {
  return isAdminRole(role) || isAnalystRole(role)
}
