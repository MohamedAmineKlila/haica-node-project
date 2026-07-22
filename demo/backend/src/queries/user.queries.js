const { executeQueryFunc, executeQueryOne, updateById, deleteById } = require('./db.helpers')

async function selectAllUsers() {
  return executeQueryFunc(
    'SELECT id, name, email, status, role_id, role_name, created_by_id, updated_by_id, created_by_name, updated_by_name, created_at, updated_at FROM v_users ORDER BY created_at DESC'
  )
}

async function selectUserById(id) {
  return executeQueryOne(
    'SELECT id, name, email, status, role_id, role_name, created_by_id, updated_by_id, created_by_name, updated_by_name, created_at, updated_at FROM v_users WHERE id = ?',
    [id]
  )
}

async function selectUserByEmail(email) {
  return executeQueryOne('SELECT id, email FROM users WHERE email = ?', [email])
}

async function insertUser({ name, email, password, status, role_id, created_by }) {
  const { data, error } = await executeQueryFunc(
    'INSERT INTO users (name, email, password, status, role_id, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, password, status || 'ACTIVE', role_id || null, created_by || null]
  )
  return { data: data ? data.insertId : null, error }
}

async function updateUser(id, fields) {
  return updateById('users', id, fields)
}

async function deleteUser(id) {
  return deleteById('users', id)
}

module.exports = {
  selectAllUsers,
  selectUserById,
  selectUserByEmail,
  insertUser,
  updateUser,
  deleteUser,
}
