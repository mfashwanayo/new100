CREATE DATABASE IF NOT EXISTS utunyange_school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE utunyange_school;
CREATE TABLE IF NOT EXISTS roles(
 id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(40) NOT NULL UNIQUE,display_name VARCHAR(80) NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
INSERT IGNORE INTO roles(name,display_name) VALUES
('super_admin','Super Administrator'),('admin','Administrator'),('teacher','Teacher'),
('student','Student'),('parent','Parent'),('staff','Staff');
CREATE TABLE IF NOT EXISTS users(
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,role_id SMALLINT UNSIGNED NOT NULL,
 full_name VARCHAR(160) NOT NULL,username VARCHAR(80) NOT NULL UNIQUE,
 email VARCHAR(190) NOT NULL UNIQUE,phone VARCHAR(30) NULL,
 password_hash VARCHAR(255) NOT NULL,
 status ENUM('active','inactive','suspended','pending') NOT NULL DEFAULT 'active',
 must_change_password TINYINT(1) NOT NULL DEFAULT 1,password_changed_at DATETIME NULL,
 last_login_at DATETIME NULL,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT fk_users_role FOREIGN KEY(role_id) REFERENCES roles(id),INDEX idx_users_status(status)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS audit_logs(
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,user_id BIGINT UNSIGNED NULL,
 action VARCHAR(100) NOT NULL,entity_type VARCHAR(80) NULL,entity_id BIGINT UNSIGNED NULL,
 ip_address VARCHAR(45) NULL,user_agent VARCHAR(255) NULL,details JSON NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_audit_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL,
 INDEX idx_audit_created(created_at),INDEX idx_audit_user(user_id)
) ENGINE=InnoDB;
