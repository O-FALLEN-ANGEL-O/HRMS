# Complete Supabase Database Setup Guide

## 🚀 Quick Start (2 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings > API

### 2. Run the Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the entire content of `supabase-complete-schema.sql`
4. Paste and click **Run**

### 3. Configure Environment Variables
Create `.env.local` in your project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Database Features

### ✅ Core HRMS Features
- **Employee Management** - Complete employee lifecycle
- **Attendance Tracking** - Real-time clock in/out with location
- **Leave Management** - Multiple leave types with balance tracking
- **Payroll System** - Automated salary calculations
- **Performance Reviews** - 360-degree feedback system
- **Document Management** - Secure file storage with categories

### ✅ Advanced Features
- **Real-time Chat** - Employee messaging system
- **Notifications** - Push notifications and alerts
- **Analytics Dashboard** - Pre-calculated metrics for fast loading
- **File Management** - Secure document storage with access control
- **Activity Logging** - Complete audit trail
- **System Settings** - Configurable application settings

### ✅ Performance Optimizations
- **Partitioned Tables** - Attendance data partitioned by year
- **Materialized Views** - Pre-calculated dashboard metrics
- **Advanced Indexing** - Optimized for 1000+ concurrent users
- **Connection Pooling** - PgBouncer ready
- **Read Replicas** - Support for reporting queries

## 🗃️ Database Schema Overview

### Core Tables (18 total)
1. **departments** - Company departments
2. **users** - Auth-linked user profiles
3. **employees** - Main employee data
4. **attendance** - Daily attendance records (partitioned)
5. **leave_types** - Leave categories
6. **leave_requests** - Leave applications
7. **payroll_periods** - Salary periods
8. **payroll_records** - Individual salary records
9. **performance_reviews** - Employee evaluations
10. **files** - Document storage
11. **notifications** - User notifications
12. **chat_rooms** - Messaging rooms
13. **chat_messages** - Real-time messages
14. **dashboard_metrics** - Analytics data
15. **system_settings** - App configuration
16. **activity_logs** - Audit trail
17. **analytics_cache** - Cached reports
18. **file_categories** - Document organization

## 🔧 Performance Configuration

### Supabase Settings
```sql
-- Run these in Supabase SQL Editor
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

### Connection Pooling
Enable PgBouncer in your Supabase project settings for 1000+ concurrent users.

### Read Replicas
Set up read replicas for heavy reporting queries in production.

## 📈 Usage Examples

### 1. Insert a new employee
```sql
INSERT INTO employees (
  user_id, employee_code, first_name, last_name, 
  email, hire_date, department_id, job_title, salary
) VALUES (
  'user-uuid-here', 'EMP001', 'John', 'Doe',
  'john@company.com', '2024-01-15',
  (SELECT id FROM departments WHERE code='ENG'),
  'Software Engineer', 75000
);
```

### 2. Get dashboard metrics
```sql
SELECT * FROM mv_employee_stats;
```

### 3. Track attendance
```sql
INSERT INTO attendance (employee_id, date, clock_in, work_hours)
VALUES ('employee-uuid', '2024-01-15', NOW(), 8.5);
```

### 4. Send notification
```sql
INSERT INTO notifications (employee_id, type, title, message)
VALUES ('employee-uuid', 'info', 'Welcome!', 'Welcome to the team!');
```

## 🔒 Security Features

- **Row Level Security (RLS)** - Enabled on all tables
- **Role-based Access Control** - Different permissions per user role
- **Audit Logging** - Complete activity tracking
- **File Access Control** - Secure document management
- **Data Validation** - Constraints and triggers

## 🎯 Next Steps

1. **Install dependencies**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create database client**
   ```javascript
   // lib/supabase.js
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   
   export const supabase = createClient(supabaseUrl, supabaseKey)
   ```

3. **Test connection**
   ```javascript
   const { data, error } = await supabase
     .from('employees')
     .select('*')
     .limit(10)
   ```

## 📞 Support

For issues or questions:
- Check Supabase logs in your project dashboard
- Review the schema in the SQL Editor
- Test queries in the Supabase dashboard before implementing

## 🔄 Updates

To update the schema in the future:
1. Make changes to `supabase-complete-schema.sql`
2. Run the updated SQL in Supabase SQL Editor
3. The schema is idempotent - safe to run multiple times
