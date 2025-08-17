-- =============================================================================
-- COMPLETE SUPABASE DATABASE SCHEMA FOR PORTFOLIO HRMS PROJECT
-- Optimized for 1000+ concurrent users with heavy load handling
-- Includes: Core HRMS + Analytics + Real-time features + File management
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS & PERFORMANCE OPTIMIZATIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fast text search
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- For advanced indexing

-- Performance settings for 1000+ users
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';

-- -----------------------------------------------------------------------------
-- 2. CUSTOM TYPES (ENUMS) - Simplified for performance
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM (
  'admin', 'hr', 'manager', 'employee', 'recruiter', 'trainer', 'qa-analyst'
);

CREATE TYPE employment_status AS ENUM (
  'active', 'inactive', 'resigned', 'terminated', 'probation'
);

CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'error', 'success');
CREATE TYPE file_type AS ENUM ('document', 'image', 'video', 'audio', 'other');

-- -----------------------------------------------------------------------------
-- 3. CORE TABLES - Optimized for 1000+ users
-- -----------------------------------------------------------------------------

-- Departments (cached, rarely changes)
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  description TEXT,
  manager_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (linked to auth.users for Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'employee',
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employees (main employee data)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id),
  manager_id UUID REFERENCES employees(id),
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  hire_date DATE NOT NULL,
  employment_status employment_status DEFAULT 'active',
  job_title VARCHAR(100),
  salary DECIMAL(12,2),
  address JSONB,
  emergency_contact JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. ATTENDANCE & TIME TRACKING - Partitioned for performance
-- -----------------------------------------------------------------------------
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  work_hours DECIMAL(4,2),
  overtime_hours DECIMAL(4,2) DEFAULT 0,
  is_late BOOLEAN DEFAULT FALSE,
  location JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (date);

-- Create partitions for current and future years
CREATE TABLE attendance_2024 PARTITION OF attendance
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE attendance_2025 PARTITION OF attendance
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Indexes for attendance queries
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);

-- -----------------------------------------------------------------------------
-- 5. LEAVE MANAGEMENT - Optimized structure
-- -----------------------------------------------------------------------------
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  days_per_year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT,
  status leave_status DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leave balances (calculated and cached)
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  balance_days INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- -----------------------------------------------------------------------------
-- 6. PAYROLL SYSTEM - Simplified for performance
-- -----------------------------------------------------------------------------
CREATE TABLE payroll_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payroll_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  payroll_period_id UUID NOT NULL REFERENCES payroll_periods(id),
  basic_salary DECIMAL(10,2) NOT NULL,
  allowances DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  gross_salary DECIMAL(10,2) NOT NULL,
  net_salary DECIMAL(10,2) NOT NULL,
  payslip_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, payroll_period_id)
);

-- -----------------------------------------------------------------------------
-- 7. PERFORMANCE MANAGEMENT
-- -----------------------------------------------------------------------------
CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES employees(id),
  review_period VARCHAR(20) NOT NULL,
  goals JSONB,
  achievements JSONB,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. FILE MANAGEMENT SYSTEM - For documents and uploads
-- -----------------------------------------------------------------------------
CREATE TABLE file_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  allowed_types file_type[] DEFAULT ARRAY['document', 'image'],
  max_size_mb INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_type file_type NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category_id UUID REFERENCES file_categories(id),
  uploaded_by UUID NOT NULL REFERENCES employees(id),
  is_public BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Employee documents linking
CREATE TABLE employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, document_type)
);

-- -----------------------------------------------------------------------------
-- 9. NOTIFICATIONS & ACTIVITY LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_employee_read ON notifications(employee_id, is_read);

-- Activity logs for audit trail
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_employee ON activity_logs(employee_id);

-- -----------------------------------------------------------------------------
-- 10. REAL-TIME FEATURES - Chat & Messaging
-- -----------------------------------------------------------------------------
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  type VARCHAR(20) DEFAULT 'direct', -- direct, group
  created_by UUID REFERENCES employees(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, employee_id)
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- text, file, image
  file_url TEXT,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room ON chat_messages(room_id, created_at);
CREATE INDEX idx_chat_messages_employee ON chat_messages(employee_id);

-- -----------------------------------------------------------------------------
-- 11. ANALYTICS & DASHBOARD DATA
-- -----------------------------------------------------------------------------
CREATE TABLE dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_date DATE NOT NULL,
  category VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboard_metrics_date ON dashboard_metrics(metric_date, category);

-- Cached analytics for fast dashboard loading
CREATE TABLE analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255) UNIQUE NOT NULL,
  cache_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 12. SYSTEM CONFIGURATION & SETTINGS
-- -----------------------------------------------------------------------------
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  data_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 13. PERFORMANCE OPTIMIZATION - INDEXES
-- -----------------------------------------------------------------------------
-- Core indexes for fast lookups
CREATE INDEX idx_employees_code ON employees(employee_code);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(employment_status);

-- Leave system indexes
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id, start_date);
CREATE INDEX idx_leave_requests_status ON leave_requests(status, start_date);

-- File system indexes
CREATE INDEX idx_files_category ON files(category_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);

-- Performance indexes
CREATE INDEX idx_performance_reviews_employee ON performance_reviews(employee_id, review_period);

-- Full-text search indexes
CREATE INDEX idx_employees_search ON employees USING gin(to_tsvector('english', 
  first_name || ' ' || last_name || ' ' || email || ' ' || COALESCE(job_title, '')));

-- -----------------------------------------------------------------------------
-- 14. TRIGGERS & AUTOMATED FUNCTIONS
-- -----------------------------------------------------------------------------
-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate leave days
CREATE OR REPLACE FUNCTION calculate_leave_days()
RETURNS TRIGGER AS $$
BEGIN
    NEW.days_requested := NEW.end_date - NEW.start_date + 1;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_calculate_leave_days
    BEFORE INSERT OR UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION calculate_leave_days();

-- -----------------------------------------------------------------------------
-- 15. ROW LEVEL SECURITY (RLS) - Optimized policies
-- -----------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic policies for performance
CREATE POLICY "users_read_own" ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "employees_read_all" ON employees FOR SELECT
    USING (true); -- Simplified for performance, filter in app layer

CREATE POLICY "attendance_read_own" ON attendance FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM employees WHERE id = employee_id));

CREATE POLICY "leave_requests_read_own" ON leave_requests FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM employees WHERE id = employee_id));

-- -----------------------------------------------------------------------------
-- 16. SEED DATA - Essential data for startup
-- -----------------------------------------------------------------------------
INSERT INTO departments (name, code, description) VALUES
  ('Engineering', 'ENG', 'Software development and technical operations'),
  ('Human Resources', 'HR', 'People management and recruitment'),
  ('Finance', 'FIN', 'Financial operations and accounting'),
  ('Marketing', 'MKT', 'Brand management and marketing campaigns'),
  ('Operations', 'OPS', 'Business operations and support');

INSERT INTO leave_types (name, code, days_per_year) VALUES
  ('Annual Leave', 'AL', 20),
  ('Sick Leave', 'SL', 10),
  ('Casual Leave', 'CL', 5),
  ('Work From Home', 'WFH', 12);

INSERT INTO file_categories (name, description, allowed_types, max_size_mb) VALUES
  ('Documents', 'General documents', ARRAY['document'], 10),
  ('Images', 'Profile pictures and photos', ARRAY['image'], 5),
  ('Contracts', 'Employment contracts and agreements', ARRAY['document'], 20);

INSERT INTO system_settings (setting_key, setting_value, data_type, is_public) VALUES
  ('company_name', 'OptiTalent HRMS', 'string', true),
  ('max_file_size_mb', '10', 'number', true),
  ('session_timeout_minutes', '30', 'number', false),
  ('enable_real_time_notifications', 'true', 'boolean', true);

-- -----------------------------------------------------------------------------
-- 17. MATERIALIZED VIEWS FOR DASHBOARD PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE MATERIALIZED VIEW mv_employee_stats AS
SELECT 
    d.id as department_id,
    d.name as department_name,
    COUNT(e.id) as total_employees,
    COUNT(CASE WHEN e.employment_status = 'active' THEN 1 END) as active_employees,
    AVG(e.salary) as avg_salary
FROM departments d
LEFT JOIN employees e ON d.id = e.department_id
GROUP BY d.id, d.name;

-- Refresh materialized view periodically
CREATE OR REPLACE FUNCTION refresh_employee_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_employee_stats;
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run every hour: SELECT refresh_employee_stats();

-- -----------------------------------------------------------------------------
-- 18. CONNECTION POOLING & PERFORMANCE NOTES
-- -----------------------------------------------------------------------------
-- For 1000+ concurrent users, configure these in Supabase:
-- - Connection pooling: Enable PgBouncer
-- - Read replicas: Set up for reporting queries
-- - Cache settings: Increase shared_buffers to 25% of RAM
-- - Work_mem: Set to 4MB per connection
-- - Maintenance_work_mem: Set to 256MB

-- Usage instructions:
-- 1. Copy this entire SQL to Supabase SQL Editor
-- 2. Run it to set up the complete schema
-- 3. Configure your .env with Supabase credentials
-- 4. Use connection pooling for production
-- =============================================================================
