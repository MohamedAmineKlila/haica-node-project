const roleQueries = require('../queries/role.queries')

async function getAllRoles() {
  return roleQueries.selectAllRoles()
}

async function getRoleById(id) {
  return roleQueries.selectRoleById(id)
}

async function getRoleByName(name) {
  return roleQueries.selectRoleByName(name)
}

async function createRole({ name, description }) {
  return roleQueries.insertRole({ name, description })
}

async function updateRole(id, fields) {
  return roleQueries.updateRole(id, fields)
}

async function deleteRole(id) {
  return roleQueries.deleteRole(id)
}

async function getRolePermissions(roleId) {
  return roleQueries.selectRolePermissions(roleId)
}

async function syncRolePermissions(roleId, permissionIds) {
  return roleQueries.syncRolePermissions(roleId, permissionIds)
}

async function getAllGroupes() {
  return roleQueries.selectAllGroupes()
}

module.exports = {
  getAllRoles,
  getRoleById,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  syncRolePermissions,
  getAllGroupes,
}
