USE utunyange_school;

CREATE TABLE IF NOT EXISTS school_classes (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 class_name VARCHAR(100) NOT NULL UNIQUE,
 level VARCHAR(80) NULL,
 academic_year VARCHAR(20) NULL,
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subjects (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 subject_name VARCHAR(120) NOT NULL,
 subject_code VARCHAR(30) NULL UNIQUE,
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_subject_name(subject_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_profiles (
 user_id BIGINT UNSIGNED PRIMARY KEY,
 admission_number VARCHAR(50) NOT NULL UNIQUE,
 class_id BIGINT UNSIGNED NULL,
 date_of_birth DATE NULL,
 gender ENUM('female','male','other','unspecified') NOT NULL DEFAULT 'unspecified',
 address VARCHAR(255) NULL,
 admission_date DATE NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_student_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
 CONSTRAINT fk_student_class FOREIGN KEY(class_id) REFERENCES school_classes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teacher_profiles (
 user_id BIGINT UNSIGNED PRIMARY KEY,
 employee_number VARCHAR(50) NULL UNIQUE,
 qualification VARCHAR(160) NULL,
 hire_date DATE NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_teacher_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS parent_profiles (
 user_id BIGINT UNSIGNED PRIMARY KEY,
 occupation VARCHAR(120) NULL,
 address VARCHAR(255) NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_parent_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teacher_assignments (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 teacher_user_id BIGINT UNSIGNED NOT NULL,
 class_id BIGINT UNSIGNED NOT NULL,
 subject_id BIGINT UNSIGNED NOT NULL,
 assigned_by BIGINT UNSIGNED NULL,
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_teacher_class_subject(teacher_user_id,class_id,subject_id),
 CONSTRAINT fk_ta_teacher FOREIGN KEY(teacher_user_id) REFERENCES teacher_profiles(user_id) ON DELETE CASCADE,
 CONSTRAINT fk_ta_class FOREIGN KEY(class_id) REFERENCES school_classes(id) ON DELETE CASCADE,
 CONSTRAINT fk_ta_subject FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
 CONSTRAINT fk_ta_admin FOREIGN KEY(assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS parent_student (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 parent_user_id BIGINT UNSIGNED NOT NULL,
 student_user_id BIGINT UNSIGNED NOT NULL,
 relationship VARCHAR(40) NOT NULL DEFAULT 'Parent',
 linked_by BIGINT UNSIGNED NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_parent_student(parent_user_id,student_user_id),
 CONSTRAINT fk_ps_parent FOREIGN KEY(parent_user_id) REFERENCES parent_profiles(user_id) ON DELETE CASCADE,
 CONSTRAINT fk_ps_student FOREIGN KEY(student_user_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE,
 CONSTRAINT fk_ps_admin FOREIGN KEY(linked_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance_records (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 student_user_id BIGINT UNSIGNED NOT NULL,
 class_id BIGINT UNSIGNED NOT NULL,
 subject_id BIGINT UNSIGNED NULL,
 attendance_date DATE NOT NULL,
 status ENUM('present','absent','late','excused') NOT NULL,
 marked_by BIGINT UNSIGNED NOT NULL,
 notes VARCHAR(255) NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE KEY uq_student_attendance(student_user_id,class_id,subject_id,attendance_date),
 CONSTRAINT fk_att_student FOREIGN KEY(student_user_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE,
 CONSTRAINT fk_att_class FOREIGN KEY(class_id) REFERENCES school_classes(id) ON DELETE CASCADE,
 CONSTRAINT fk_att_subject FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
 CONSTRAINT fk_att_teacher FOREIGN KEY(marked_by) REFERENCES teacher_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assessments (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(160) NOT NULL,
 class_id BIGINT UNSIGNED NOT NULL,
 subject_id BIGINT UNSIGNED NOT NULL,
 assessment_date DATE NULL,
 total_marks DECIMAL(7,2) NOT NULL,
 created_by BIGINT UNSIGNED NOT NULL,
 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_assess_class FOREIGN KEY(class_id) REFERENCES school_classes(id) ON DELETE CASCADE,
 CONSTRAINT fk_assess_subject FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
 CONSTRAINT fk_assess_teacher FOREIGN KEY(created_by) REFERENCES teacher_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS assessment_results (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 assessment_id BIGINT UNSIGNED NOT NULL,
 student_user_id BIGINT UNSIGNED NOT NULL,
 marks_obtained DECIMAL(7,2) NOT NULL,
 remarks VARCHAR(255) NULL,
 entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY uq_assessment_student(assessment_id,student_user_id),
 CONSTRAINT fk_result_assessment FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
 CONSTRAINT fk_result_student FOREIGN KEY(student_user_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
