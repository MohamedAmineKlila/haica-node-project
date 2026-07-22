export const roleDescriptionsFr: Record<string, string> = {
  Admin: 'Administrateur — Accès complet au système et à la gestion',
  HR: "Ressources Humaines — Gestion des utilisateurs et du personnel",
  Editor: "Éditeur — Peut voir les utilisateurs, les rôles et les journaux d'audit",
  Viewer: "Lecteur — Accès en lecture seule à toutes les pages",
}

export const permissionDescriptionsFr: Record<string, string> = {
  // Common permission translations
  view_dashboard: "Voir le tableau de bord",
  view_users: "Voir la gestion des utilisateurs",
  view_roles: "Voir la gestion des rôles",
  view_permissions: "Voir la gestion des permissions",
  view_audit_logs: "Voir le journal d'audit",
  manage_permissions: "Créer et supprimer des permissions",
  create_role: "Créer de nouveaux rôles",
  delete_role: "Supprimer des rôles",
  edit_role: "Modifier les rôles et leurs permissions",
  create_user: "Créer de nouveaux utilisateurs",
  delete_user: "Supprimer des utilisateurs",
  edit_user: "Modifier les utilisateurs existants",
  manage_user_status: "Suspendre ou bannir des utilisateurs",
}
