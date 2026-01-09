-- Create course_registrations table
CREATE TABLE course_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    semester VARCHAR(50),
    status VARCHAR(20) DEFAULT 'REGISTERED',
    registered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE INDEX idx_course_registrations_student_id ON course_registrations(student_id);
CREATE INDEX idx_course_registrations_course_name ON course_registrations(course_name);
CREATE INDEX idx_course_registrations_status ON course_registrations(status);

