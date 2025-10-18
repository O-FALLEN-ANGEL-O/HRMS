import { getSupabase, extractData } from '../../lib/supabase';

export async function findAll() {
  const supabase = getSupabase();
  const response = await supabase
    .from('departments')
    .select(`
      *,
      employees:employees!employees_department_id_fkey (
        id,
        employee_code,
        first_name,
        last_name,
        email,
        job_title
      )
    `)
    .order('name');

  return extractData(response);
}

export async function findById(id: string) {
  const supabase = getSupabase();
  const response = await supabase
    .from('departments')
    .select(`
      *,
      employees:employees!employees_department_id_fkey (
        id,
        employee_code,
        first_name,
        last_name,
        email,
        job_title
      )
    `)
    .eq('id', id)
    .single();

  return extractData(response);
}

export async function create(data: any) {
  const supabase = getSupabase();
  const response = await supabase
    .from('departments')
    .insert(data)
    .select('*')
    .single();

  return extractData(response);
}

export async function update(id: string, data: any) {
  const supabase = getSupabase();
  const response = await supabase
    .from('departments')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  return extractData(response);
}

export async function remove(id: string) {
  const supabase = getSupabase();
  const response = await supabase
    .from('departments')
    .delete()
    .eq('id', id)
    .select()
    .single();

  return extractData(response);
}
