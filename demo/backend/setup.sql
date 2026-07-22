-- Create database
CREATE DATABASE IF NOT EXISTS haica_demo;
USE haica_demo;

-- Disable FK checks for initial setup
SET FOREIGN_KEY_CHECKS = 0;

-- Create roles table (no FK to users yet)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500),
  created_by INT,
  updated_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table (with role_id FK to roles)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status ENUM('ACTIVE', 'SUSPENDED', 'BANNED') DEFAULT 'ACTIVE',
  role_id INT,
  created_by INT,
  updated_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- Add FKs to roles (now that users exists)
ALTER TABLE roles
  ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  ADD FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500),
  created_by INT,
  updated_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_by INT,
  updated_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

SET FOREIGN_KEY_CHECKS = 1;

-- ==================== SEED DATA ====================

-- Insert roles first (created_by will be set after admin user)
INSERT INTO roles (name, description) VALUES
('Admin', 'Accès complet au système'),
('HR', 'Gestion des ressources humaines'),
('Viewer', 'Lecture seule');

-- Insert admin user (role_id = 1, created_by will self-reference)
INSERT INTO users (name, email, password, status, role_id) VALUES
('Admin HAICA', 'admin@haica.tn', '$2a$10$SGdoYNG3BUV.7sZQt76Q5ORujGMweJzl0n4HtetRGGdeSiMwB6wyi', 'ACTIVE', 1);

-- Update admin to reference itself as creator
UPDATE users SET created_by = 1 WHERE id = 1;

-- Update roles to reference admin as creator
UPDATE roles SET created_by = 1, updated_by = 1;

-- Insert other users (created by admin, with roles)
INSERT INTO users (name, email, password, status, role_id, created_by) VALUES
('Sonia Ben Ali', 'hr@haica.tn', '$2a$10$NQL7ht1.LFay8eSzcHMVYuLMA5tWARU8cSxdFzhnpSlxXfdGoO3gm', 'ACTIVE', 2, 1),
('Leila Mansour', 'viewer@haica.tn', '$2a$10$j.pL8BmOcGs8cmMYLf3KLu5EIl4Kxerb9EbpYr/1gG1ROO2f/793K', 'ACTIVE', 3, 1);

-- Insert permissions (created by admin)
INSERT INTO permissions (name, description, created_by) VALUES
('dashboard.view', 'Voir le tableau de bord', 1),
('users.view', 'Voir les utilisateurs', 1),
('users.create', 'Créer des utilisateurs', 1),
('users.edit', 'Modifier les utilisateurs', 1),
('users.delete', 'Supprimer des utilisateurs', 1),
('roles.view', 'Voir les rôles', 1),
('roles.create', 'Créer des rôles', 1),
('roles.edit', 'Modifier les rôles', 1),
('roles.delete', 'Supprimer des rôles', 1),
('permissions.view', 'Voir les permissions', 1),
('permissions.manage', 'Gérer les permissions', 1),
('audit.view', 'Voir les journaux d\'audit', 1),
('reports.view', 'Voir les rapports', 1);

-- Assign permissions to Admin (all)
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT 1, id, 1 FROM permissions;

-- Assign permissions to HR
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT 2, id, 1 FROM permissions WHERE name IN (
  'dashboard.view', 'users.view', 'users.create', 'users.edit',
  'roles.view', 'audit.view', 'reports.view'
);

-- Assign permissions to Viewer
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT 3, id, 1 FROM permissions WHERE name IN (
  'dashboard.view', 'users.view', 'audit.view'
);

-- ==================== VIEWS ====================

-- View: users with creator/updater info
CREATE OR REPLACE VIEW v_users AS
SELECT
  u.id,
  u.name,
  u.email,
  u.status,
  u.role_id,
  r.name AS role_name,
  u.created_by AS created_by_id,
  u.updated_by AS updated_by_id,
  cu.name AS created_by_name,
  uu.name AS updated_by_name,
  u.created_at,
  u.updated_at
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN users cu ON u.created_by = cu.id
LEFT JOIN users uu ON u.updated_by = uu.id;

-- View: roles with creator/updater info
CREATE OR REPLACE VIEW v_roles AS
SELECT
  r.id,
  r.name,
  r.description,
  r.created_by AS created_by_id,
  r.updated_by AS updated_by_id,
  cu.name AS created_by_name,
  uu.name AS updated_by_name,
  r.created_at,
  r.updated_at
FROM roles r
LEFT JOIN users cu ON r.created_by = cu.id
LEFT JOIN users uu ON r.updated_by = uu.id;

-- View: permissions with creator/updater info
CREATE OR REPLACE VIEW v_permissions AS
SELECT
  p.id,
  p.name,
  p.description,
  p.created_by AS created_by_id,
  p.updated_by AS updated_by_id,
  cu.name AS created_by_name,
  uu.name AS updated_by_name,
  p.created_at,
  p.updated_at
FROM permissions p
LEFT JOIN users cu ON p.created_by = cu.id
LEFT JOIN users uu ON p.updated_by = uu.id;

-- View: role_permissions with full info
CREATE OR REPLACE VIEW v_role_permissions AS
SELECT
  rp.role_id,
  r.name AS role_name,
  r.description AS role_description,
  rp.permission_id,
  p.name AS permission_name,
  p.description AS permission_description,
  rp.created_by AS created_by_id,
  rp.updated_by AS updated_by_id,
  cu.name AS created_by_name,
  uu.name AS updated_by_name,
  rp.created_at,
  rp.updated_at
FROM role_permissions rp
INNER JOIN roles r ON rp.role_id = r.id
INNER JOIN permissions p ON rp.permission_id = p.id
LEFT JOIN users cu ON rp.created_by = cu.id
LEFT JOIN users uu ON rp.updated_by = uu.id;

-- View: groupes (roles with aggregated permissions)
CREATE OR REPLACE VIEW v_groupes AS
SELECT
  r.id AS id,
  r.name AS name,
  r.description,
  r.created_by AS created_by_id,
  r.updated_by AS updated_by_id,
  cu.name AS created_by_name,
  uu.name AS updated_by_name,
  r.created_at,
  r.updated_at,
  COUNT(rp.permission_id) AS permission_count,
  GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ') AS permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
LEFT JOIN users cu ON r.created_by = cu.id
LEFT JOIN users uu ON r.updated_by = uu.id
GROUP BY r.id, r.name, r.description, r.created_by, r.updated_by, cu.name, uu.name, r.created_at, r.updated_at;

-- View: full user (complete user with role and all permissions)
CREATE OR REPLACE VIEW v_full_user AS
SELECT
  u.id,
  u.name,
  u.email,
  u.status,
  r.name AS role_name,
  COUNT(rp.permission_id) AS permission_count,
  GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ') AS permissions
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY u.id, u.name, u.email, u.status, r.name;

-- View: health check (data integrity with details)
CREATE OR REPLACE VIEW v_health_check AS
SELECT
  'users_without_role' AS issue_type,
  u.id AS record_id,
  u.name AS record_name,
  CONCAT('User has no role assigned') AS details
FROM users u
WHERE u.role_id IS NULL

UNION ALL

SELECT
  'roles_without_permissions',
  r.id,
  r.name,
  CONCAT('Role has 0 permissions assigned')
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE rp.permission_id IS NULL

UNION ALL

SELECT
  'permissions_not_assigned',
  p.id,
  p.name,
  CONCAT('Permission not assigned to any role')
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id IS NULL;
