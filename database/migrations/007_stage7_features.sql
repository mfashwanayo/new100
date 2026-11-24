-- =====================================================
-- UTUNYANGE Stage 7 — Staff roles, Reports, Chat, Books
-- Run after 006_stage6_fees.sql
-- =====================================================
USE utunyange_school;

-- Additional staff / academic roles
INSERT IGNORE INTO roles(name,display_name) VALUES
 ('dos','Director of Studies'),
 ('accountant','Accountant / Bursar'),
 ('head_teacher','Head Teacher / Master'),
 ('deputy_head','Deputy Head Teacher'),
 ('librarian','Librarian'),
 ('secretary','School Secretary');

-- Teacher -> Parent report cards / messages
CREATE TABLE IF NOT EXISTS teacher_reports (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  teacher_user_id BIGINT UNSIGNED NOT NULL,
  student_user_id BIGINT UNSIGNED NOT NULL,
  parent_user_id  BIGINT UNSIGNED NULL,
  title           VARCHAR(180) NOT NULL,
  body            TEXT NOT NULL,
  report_date     DATE NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reports_student(student_user_id, report_date),
  INDEX idx_reports_parent(parent_user_id),
  CONSTRAINT fk_rep_teacher FOREIGN KEY(teacher_user_id) REFERENCES teacher_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_rep_student FOREIGN KEY(student_user_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_rep_parent  FOREIGN KEY(parent_user_id)  REFERENCES parent_profiles(user_id)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- Chat messages between parents and teachers / school staff
CREATE TABLE IF NOT EXISTS chat_messages (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id    BIGINT UNSIGNED NOT NULL,
  receiver_id  BIGINT UNSIGNED NOT NULL,
  body         TEXT NOT NULL,
  is_read      TINYINT(1) NOT NULL DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chat_pair(sender_id, receiver_id, created_at),
  INDEX idx_chat_receiver(receiver_id, is_read),
  CONSTRAINT fk_chat_sender   FOREIGN KEY(sender_id)   REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_receiver FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Books / learning materials available to students
CREATE TABLE IF NOT EXISTS books (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  author        VARCHAR(160) NULL,
  subject_id    BIGINT UNSIGNED NULL,
  class_id      BIGINT UNSIGNED NULL,
  description   TEXT NULL,
  file_path     VARCHAR(500) NULL,
  cover_url     VARCHAR(500) NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_by    BIGINT UNSIGNED NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_books_class(class_id),
  CONSTRAINT fk_book_subject FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  CONSTRAINT fk_book_class   FOREIGN KEY(class_id)   REFERENCES school_classes(id) ON DELETE SET NULL,
  CONSTRAINT fk_book_creator FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;