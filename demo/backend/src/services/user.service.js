const userQueries = require('../queries/user.queries')

async function getAllUsers() {
  return userQueries.selectAllUsers()
}

async function getUserById(id) {
  return userQueries.selectUserById(id)
}

async function getUserByEmail(email) {
  return userQueries.selectUserByEmail(email)
}

async function createUser({ name, email, password, status }) {
  return userQueries.insertUser({ name, email, password, status })
}

async function updateUser(id, fields) {
  return userQueries.updateUser(id, fields)
}

async function deleteUser(id) {
  return userQueries.deleteUser(id)
}

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
}
