USE utunyange_school;
CREATE TABLE IF NOT EXISTS timetable_entries (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, class_id BIGINT UNSIGNED NOT NULL,
 subject_id BIGINT UNSIGNED NOT NULL, teacher_user_id BIGINT UNSIGNED NOT NULL,
 day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
 start_time TIME NOT NULL, end_time TIME NOT NULL, room VARCHAR(80) NULL,
 is_active TINYINT(1) NOT NULL DEFAULT 1,
 INDEX idx_tt_class_day(class_id,day_of_week,start_time),
 FOREIGN KEY(class_id) REFERENCES school_classes(id) ON DELETE CASCADE,
 FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
 FOREIGN KEY(teacher_user_id) REFERENCES teacher_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS school_announcements (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, title VARCHAR(180) NOT NULL, body TEXT NOT NULL,
 audience ENUM('all','student','parent','teacher','staff') NOT NULL DEFAULT 'all',
 created_by BIGINT UNSIGNED NOT NULL, published_at DATETIME NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_announcement_audience(audience,published_at),
 FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS user_notifications (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL,
 title VARCHAR(180) NOT NULL, message VARCHAR(500) NOT NULL, notification_type VARCHAR(40) NOT NULL DEFAULT 'general',
 related_id BIGINT UNSIGNED NULL, is_read TINYINT(1) NOT NULL DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_notifications_user(user_id,is_read,created_at),
 FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS assessment_publications (
 assessment_id BIGINT UNSIGNED PRIMARY KEY, is_published TINYINT(1) NOT NULL DEFAULT 0,
 published_by BIGINT UNSIGNED NULL, published_at DATETIME NULL,
 FOREIGN KEY(assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
 FOREIGN KEY(published_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
