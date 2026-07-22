const permissionQueries = require('../queries/permission.queries')

async function getAllPermissions() {
  return permissionQueries.selectAllPermissions()
}

async function getPermissionById(id) {
  return permissionQueries.selectPermissionById(id)
}

async function getPermissionByName(name) {
  return permissionQueries.selectPermissionByName(name)
}

async function createPermission({ name, description }) {
  return permissionQueries.insertPermission({ name, description })
}

async function updatePermission(id, fields) {
  return permissionQueries.updatePermission(id, fields)
}

async function deletePermission(id) {
  return permissionQueries.deletePermission(id)
}

module.exports = {
  getAllPermissions,
  getPermissionById,
  getPermissionByName,
  createPermission,
  updatePermission,
  deletePermission,
}
