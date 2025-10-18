import { supabase, extractData } from '../../lib/supabase';
import bcrypt from 'bcryptjs';

export async function validateUser(email: string, password: string) {
  try {
    // First find the employee by email
    const employeeResponse = await supabase
      .from('employees')
      .select(`
        *,
        departments (*),
        users (*)
      `)
      .eq('email', email)
      .single();

    const employee = extractData(employeeResponse);

    if (!employee) {
      return null;
    }

    // For Supabase, we would typically use Supabase Auth for password validation
    // Since we're using the service role, we need to handle password validation manually
    // In a real implementation, this would use Supabase Auth API
    
    // For now, we'll assume the password is stored in the users table and validate it
    if (employee.users && employee.users.password) {
      const isPasswordValid = await bcrypt.compare(password, employee.users.password);
      
      if (!isPasswordValid) {
        return null;
      }
    } else {
      // If no password in users table, assume authentication is handled by Supabase Auth
      // We'll just return the employee for now
      return employee;
    }

    return employee;
  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

// Helper function to create user with Supabase Auth
export async function createUserWithEmail(email: string, password: string, userData: any) {
  try {
    // This would typically use the Supabase Auth API
    // For service role usage, we might create the user directly in auth.users
    // but this requires the service role key
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm for backend creation
      user_metadata: userData
    });

    if (authError) {
      throw authError;
    }

    return authUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
