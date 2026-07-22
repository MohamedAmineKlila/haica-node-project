const { pool } = require('../config/db.conf')

function executeQuery(query, params = []) {
  return pool.query(query, params)
}

async function executeQueryFunc(query, params = []) {
  try {
    const [data] = await pool.query(query, params)
    return { data, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

async function executeQueryOne(query, params = []) {
  const { data, error } = await executeQueryFunc(query, params)
  return { data: data ? data[0] || null : null, error }
}

async function updateById(table, id, fields) {
  const keys = Object.keys(fields)
  if (keys.length === 0) return { data: null, error: new Error('Aucun champ a mettre a jour') }

  const setClause = keys.map(key => `${key} = ?`).join(', ')
  const values = keys.map(key => fields[key])
  values.push(id)

  return executeQueryFunc(`UPDATE ${table} SET ${setClause} WHERE id = ?`, values)
}

async function deleteById(table, id) {
  return executeQueryFunc(`DELETE FROM ${table} WHERE id = ?`, [id])
}

module.exports = { executeQuery, executeQueryFunc, executeQueryOne, updateById, deleteById }
