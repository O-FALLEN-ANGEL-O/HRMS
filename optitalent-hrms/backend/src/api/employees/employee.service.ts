
import { getSupabase, extractData } from '../../lib/supabase';

export async function findAll() {
  const supabase = getSupabase();
  const response = await supabase
    .from('employees')
    .select(`
      id,
      employee_code,
      first_name,
      last_name,
      email,
      job_title,
      employment_status,
      departments (name),
      users (role)
    `)
    .order('first_name');

  return extractData(response);
}

export async function findById(id: string) {
  const supabase = getSupabase();
  const response = await supabase
    .from('employees')
    .select(`
      *,
      departments (*),
      users (role),
      managers:employees!employees_manager_id_fkey (
        first_name,
        last_name
      )
    `)
    .eq('id', id)
    .single();

  return extractData(response);
}

export async function create(data: any) {
  const supabase = getSupabase();
  // First create the user in auth.users (this would typically be handled by Supabase Auth)
  // For now, we'll assume the user already exists and we're just creating the employee record
  
  const response = await supabase
    .from('employees')
    .insert({
      user_id: data.userId,
      employee_code: data.employeeId,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      date_of_birth: data.dob,
      hire_date: data.hireDate,
      employment_status: data.employmentStatus,
      job_title: data.jobTitle,
      salary: data.salary,
      department_id: data.departmentId,
      manager_id: data.managerId
    })
    .select(`
      *,
      departments (*),
      users (role),
      managers:employees!employees_manager_id_fkey (
        first_name,
        last_name
      )
    `)
    .single();

  return extractData(response);
}

export async function update(id: string, data: any) {
  const supabase = getSupabase();
  const updateData: any = {};
  
  // Map fields to Supabase column names
  if (data.employeeId) updateData.employee_code = data.employeeId;
  if (data.firstName) updateData.first_name = data.firstName;
  if (data.lastName) updateData.last_name = data.lastName;
  if (data.email) updateData.email = data.email;
  if (data.phone) updateData.phone = data.phone;
  if (data.dob) updateData.date_of_birth = data.dob;
  if (data.hireDate) updateData.hire_date = data.hireDate;
  if (data.employmentStatus) updateData.employment_status = data.employmentStatus;
  if (data.jobTitle) updateData.job_title = data.jobTitle;
  if (data.salary) updateData.salary = data.salary;
  if (data.departmentId) updateData.department_id = data.departmentId;
  if (data.managerId) updateData.manager_id = data.managerId;

  const response = await supabase
    .from('employees')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      departments (*),
      users (role),
      managers:employees!employees_manager_id_fkey (
        first_name,
        last_name
      )
    `)
    .single();

  return extractData(response);
}

export async function remove(id: string) {
  const supabase = getSupabase();
  const response = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .select()
    .single();

  return extractData(response);
}

export async function findByEmail(email: string) {
  const supabase = getSupabase();
  const response = await supabase
    .from('employees')
    .select(`
      *,
      departments (*),
      users (role)
    `)
    .eq('email', email)
    .single();

  return extractData(response);
}
