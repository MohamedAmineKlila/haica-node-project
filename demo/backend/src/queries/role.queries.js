const { executeQuery, executeQueryFunc, executeQueryOne, updateById, deleteById } = require('./db.helpers')

async function selectAllRoles() {
  return executeQueryFunc(
    'SELECT id, name, description, created_by_id, updated_by_id, created_by_name, updated_by_name, created_at, updated_at FROM v_roles ORDER BY created_at DESC'
  )
}

async function selectRoleById(id) {
  return executeQueryOne(
    'SELECT id, name, description, created_by_id, updated_by_id, created_by_name, updated_by_name, created_at, updated_at FROM v_roles WHERE id = ?',
    [id]
  )
}

async function selectRoleByName(name) {
  return executeQueryOne('SELECT id, name FROM roles WHERE name = ?', [name])
}

async function insertRole({ name, description, created_by }) {
  const { data, error } = await executeQueryFunc(
    'INSERT INTO roles (name, description, created_by) VALUES (?, ?, ?)',
    [name, description || null, created_by || null]
  )
  return { data: data ? data.insertId : null, error }
}

async function updateRole(id, fields) {
  return updateById('roles', id, fields)
}

async function deleteRole(id) {
  return deleteById('roles', id)
}

async function selectRolePermissions(roleId) {
  return executeQueryFunc(
    `SELECT permission_id AS id, permission_name AS name, permission_description AS description
     FROM v_role_permissions
     WHERE role_id = ?
     ORDER BY permission_name`,
    [roleId]
  )
}

async function syncRolePermissions(roleId, permissionIds, created_by) {
  await executeQuery('DELETE FROM role_permissions WHERE role_id = ?', [roleId])
  for (const permId of permissionIds) {
    await executeQuery(
      'INSERT INTO role_permissions (role_id, permission_id, created_by) VALUES (?, ?, ?)',
      [roleId, permId, created_by || null]
    )
  }
  return { data: true, error: null }
}

async function selectAllGroupes() {
  return executeQueryFunc(
    'SELECT id, name, description, created_by_id, updated_by_id, created_by_name, updated_by_name, permission_count, permissions, created_at, updated_at FROM v_groupes ORDER BY created_at DESC'
  )
}

module.exports = {
  selectAllRoles,
  selectRoleById,
  selectRoleByName,
  insertRole,
  updateRole,
  deleteRole,
  selectRolePermissions,
  syncRolePermissions,
  selectAllGroupes,
}
