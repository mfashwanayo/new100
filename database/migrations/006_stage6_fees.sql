-- =====================================================
-- UTUNYANGE Stage 6 — School Fees, Invoices & Payments
-- Run after 005_stage5_lms.sql
-- =====================================================
USE utunyange_school;

-- Fee structures (admin defines what is charged)
CREATE TABLE IF NOT EXISTS fee_structures (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  description   VARCHAR(400) NULL,
  amount        DECIMAL(12,2) NOT NULL,
  academic_year VARCHAR(20)  NOT NULL,
  term          ENUM('Term 1','Term 2','Term 3','Annual') NOT NULL DEFAULT 'Annual',
  applies_to    ENUM('all','class') NOT NULL DEFAULT 'all',
  class_id      BIGINT UNSIGNED NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_by    BIGINT UNSIGNED NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fee_class   FOREIGN KEY(class_id)   REFERENCES school_classes(id) ON DELETE SET NULL,
  CONSTRAINT fk_fee_creator FOREIGN KEY(created_by) REFERENCES users(id)          ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Student fee invoices (one per student per fee structure)
CREATE TABLE IF NOT EXISTS student_invoices (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_user_id BIGINT UNSIGNED NOT NULL,
  fee_structure_id BIGINT UNSIGNED NOT NULL,
  invoice_number  VARCHAR(40) NOT NULL UNIQUE,
  amount_due      DECIMAL(12,2) NOT NULL,
  amount_paid     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  due_date        DATE NOT NULL,
  status          ENUM('unpaid','partial','paid','cancelled') NOT NULL DEFAULT 'unpaid',
  notes           VARCHAR(400) NULL,
  created_by      BIGINT UNSIGNED NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_invoice_student(student_user_id, status),
  CONSTRAINT fk_inv_student FOREIGN KEY(student_user_id)   REFERENCES student_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_inv_fee     FOREIGN KEY(fee_structure_id)  REFERENCES fee_structures(id)        ON DELETE RESTRICT,
  CONSTRAINT fk_inv_creator FOREIGN KEY(created_by)        REFERENCES users(id)                 ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Payment records against invoices
CREATE TABLE IF NOT EXISTS fee_payments (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_id      BIGINT UNSIGNED NOT NULL,
  student_user_id BIGINT UNSIGNED NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  payment_method  ENUM('cash','bank_transfer','mobile_money','cheque','other') NOT NULL DEFAULT 'cash',
  reference_number VARCHAR(100) NULL,
  paid_at         DATE NOT NULL,
  received_by     BIGINT UNSIGNED NOT NULL,
  notes           VARCHAR(400) NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pay_invoice  FOREIGN KEY(invoice_id)      REFERENCES student_invoices(id) ON DELETE CASCADE,
  CONSTRAINT fk_pay_student  FOREIGN KEY(student_user_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_pay_receiver FOREIGN KEY(received_by)     REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
