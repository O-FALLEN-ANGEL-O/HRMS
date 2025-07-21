

'use server';

import { createClient } from "@supabase/supabase-js";

// Hardcoded Supabase credentials for server-side actions.
const SUPABASE_URL = "https://qgmknoilorehwimlhngf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWtub2lsb3JlaHdpbWxobmdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5MDcyOSwiZXhwIjoyMDY4NjY2NzI5fQ.ZX7cVFzfOV7PrjSkwxTcrYkk6_3sNqaoVyd2UDfbAf0";


export async function getEmailForEmployeeId(employeeId: string): Promise<{ email: string | null, error: string | null }> {
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: employee, error } = await supabaseAdmin
      .from('employees')
      .select('email')
      .eq('employee_id', employeeId.toUpperCase())
      .single();

    if (error || !employee) {
      console.error("Employee lookup failed:", error);
      return { email: null, error: "Employee ID not found." };
    }
    
    return { email: employee.email, error: null };
}

