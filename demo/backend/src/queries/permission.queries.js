const { executeQueryFunc, executeQueryOne, updateById, deleteById } = require('./db.helpers')

async function selectAllPermissions() {
  return executeQueryFunc(
    'SELECT id, name, description, created_by_id, updated_by_id, created_by_name, updated_by_name, created_at, updated_at FROM v_permissions ORDER BY name'
  )
}

async function selectPermissionById(id) {
  return executeQueryOne(
    'SELECT id, name, description, created_by_id, updated_by_id, created_by_name, updated_by_name, created_at, updated_at FROM v_permissions WHERE id = ?',
    [id]
  )
}

async function selectPermissionByName(name) {
  return executeQueryOne('SELECT id, name FROM permissions WHERE name = ?', [name])
}

async function insertPermission({ name, description, created_by }) {
  const { data, error } = await executeQueryFunc(
    'INSERT INTO permissions (name, description, created_by) VALUES (?, ?, ?)',
    [name, description || null, created_by || null]
  )
  return { data: data ? data.insertId : null, error }
}

async function updatePermission(id, fields) {
  return updateById('permissions', id, fields)
}

async function deletePermission(id) {
  return deleteById('permissions', id)
}

module.exports = {
  selectAllPermissions,
  selectPermissionById,
  selectPermissionByName,
  insertPermission,
  updatePermission,
  deletePermission,
}
