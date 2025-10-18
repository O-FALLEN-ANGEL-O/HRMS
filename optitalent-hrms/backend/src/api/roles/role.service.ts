import { getSupabase, extractData } from '../../lib/supabase';

export async function findAll() {
  const supabase = getSupabase();
  const response = await supabase
    .from('roles')
    .select('*')
    .order('name');

  return extractData(response);
}

export async function findById(id: string) {
  const supabase = getSupabase();
  const response = await supabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .single();

  return extractData(response);
}

export async function create(data: any) {
  const supabase = getSupabase();
  const response = await supabase
    .from('roles')
    .insert(data)
    .select('*')
    .single();

  return extractData(response);
}

export async function update(id: string, data: any) {
  const supabase = getSupabase();
  const response = await supabase
    .from('roles')
    .update(data)
    .eq('id', id)
    .select('*')
    .single();

  return extractData(response);
}

export async function remove(id: string) {
  const supabase = getSupabase();
  const response = await supabase
    .from('roles')
    .delete()
    .eq('id', id)
    .select()
    .single();

  return extractData(response);
}
