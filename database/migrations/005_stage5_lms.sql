-- =====================================================
-- UTUNYANGE Stage 5 — Learning Management System (LMS)
-- Run this after 004_stage4.sql
-- =====================================================
USE utunyange_school;

-- Lessons created by teachers
CREATE TABLE IF NOT EXISTS lessons (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  class_id      BIGINT UNSIGNED NOT NULL,
  subject_id    BIGINT UNSIGNED NOT NULL,
  teacher_user_id BIGINT UNSIGNED NOT NULL,
  title         VARCHAR(200) NOT NULL,
  body          TEXT NULL,
  lesson_date   DATE NULL,
  is_published  TINYINT(1) NOT NULL DEFAULT 0,
  published_at  DATETIME NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_lessons_class(class_id, subject_id),
  CONSTRAINT fk_lesson_class    FOREIGN KEY(class_id)       REFERENCES school_classes(id)      ON DELETE CASCADE,
  CONSTRAINT fk_lesson_subject  FOREIGN KEY(subject_id)     REFERENCES subjects(id)            ON DELETE CASCADE,
  CONSTRAINT fk_lesson_teacher  FOREIGN KEY(teacher_user_id) REFERENCES teacher_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- File/material attachments for lessons
CREATE TABLE IF NOT EXISTS lesson_materials (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lesson_id   BIGINT UNSIGNED NOT NULL,
  file_name   VARCHAR(255) NOT NULL,
  file_path   VARCHAR(500) NOT NULL,
  file_size   INT UNSIGNED NOT NULL DEFAULT 0,
  mime_type   VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lm_lesson FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Assignments / homework
CREATE TABLE IF NOT EXISTS assignments (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  class_id        BIGINT UNSIGNED NOT NULL,
  subject_id      BIGINT UNSIGNED NOT NULL,
  teacher_user_id BIGINT UNSIGNED NOT NULL,
  title           VARCHAR(200) NOT NULL,
  instructions    TEXT NULL,
  due_date        DATE NOT NULL,
  max_score       DECIMAL(7,2) NOT NULL DEFAULT 100,
  is_published    TINYINT(1) NOT NULL DEFAULT 0,
  published_at    DATETIME NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_assign_class(class_id, subject_id, due_date),
  CONSTRAINT fk_assign_class    FOREIGN KEY(class_id)        REFERENCES school_classes(id)       ON DELETE CASCADE,
  CONSTRAINT fk_assign_subject  FOREIGN KEY(subject_id)      REFERENCES subjects(id)             ON DELETE CASCADE,
  CONSTRAINT fk_assign_teacher  FOREIGN KEY(teacher_user_id) REFERENCES teacher_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Student submissions for assignments
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assignment_id   BIGINT UNSIGNED NOT NULL,
  student_user_id BIGINT UNSIGNED NOT NULL,
  answer_text     TEXT NULL,
  file_path       VARCHAR(500) NULL,
  file_name       VARCHAR(255) NULL,
  submitted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  score           DECIMAL(7,2) NULL,
  feedback        VARCHAR(500) NULL,
  graded_at       DATETIME NULL,
  graded_by       BIGINT UNSIGNED NULL,
  UNIQUE KEY uq_submission(assignment_id, student_user_id),
  CONSTRAINT fk_sub_assignment FOREIGN KEY(assignment_id)   REFERENCES assignments(id)         ON DELETE CASCADE,
  CONSTRAINT fk_sub_student    FOREIGN KEY(student_user_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_sub_grader     FOREIGN KEY(graded_by)       REFERENCES teacher_profiles(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;
