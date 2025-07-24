
'use server';

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AutoAssignRolesInput, AutoAssignRolesOutput } from "@/ai/flows/auto-assign-roles";
import { revalidatePath } from "next/cache";

export async function suggestRoleAction(input: AutoAssignRolesInput): Promise<AutoAssignRolesOutput> {
    console.log("AI Action (mock): Suggesting role for", input);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple mock logic
    if (input.jobTitle.toLowerCase().includes('manager') || input.jobTitle.toLowerCase().includes('lead')) {
        return { suggestedRole: 'manager' };
    }
     if (input.department.toLowerCase().includes('hr')) {
        return { suggestedRole: 'hr' };
    }
     if (input.department.toLowerCase().includes('recruitment')) {
        return { suggestedRole: 'recruiter' };
    }

    return { suggestedRole: 'employee' };
}


export async function getEmployees() {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from('employees')
        .select(`
            *,
            users:user_id(*),
            departments:department_id(*)
        `);
    
    if (error) {
        console.error("Error fetching employees:", error);
        return [];
    }

    // The shape needs to match what the component expects
    // The query above already joins the necessary tables.
    return data.map(e => ({
        ...e,
        // The component expects user.role, let's ensure it's there
        user: e.users ? e.users : { role: 'employee' }, 
        department: e.departments ? e.departments : { name: 'N/A' },
    }));
}

export async function deactivateEmployeeAction(employeeId: string) {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
        .from('employees')
        .update({ status: 'Inactive' })
        .eq('id', employeeId);

    if (error) {
        console.error("Error deactivating employee:", error);
        return { success: false, message: error.message };
    }
    
    revalidatePath('/[role]/employees', 'page');
    return { success: true };
}


export async function addEmployeeAction(formData: FormData) {
    const supabase = createSupabaseAdminClient();
    
    const rawFormData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        jobTitle: formData.get('jobTitle') as string,
        departmentName: formData.get('department') as string,
        role: formData.get('role') as any,
    };
    console.log("Adding new employee:", rawFormData);

    // 1. Find department
    const { data: department, error: deptError } = await supabase
        .from('departments')
        .select('id')
        .eq('name', rawFormData.departmentName)
        .single();
        
    if(deptError || !department) {
        console.error("Department not found:", deptError);
        return { success: false, message: "Department not found" };
    }
    
    // 2. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: rawFormData.email,
        password: 'Password123!', // Default password
        email_confirm: true,
        user_metadata: { full_name: rawFormData.name }
    });

    if (authError || !authData.user) {
        console.error("Error creating auth user:", authError);
        return { success: false, message: authError?.message || "Could not create user." };
    }
    
    // 3. Create public user row
    const { error: publicUserError } = await supabase
        .from('users')
        .insert({ id: authData.user.id, email: rawFormData.email, role: rawFormData.role });

    if(publicUserError) {
         console.error("Error creating public user:", publicUserError);
        // Attempt to clean up the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { success: false, message: publicUserError.message };
    }
    
    // 4. Create employee profile
     const { error: employeeError } = await supabase
        .from('employees')
        .insert({
            user_id: authData.user.id,
            full_name: rawFormData.name,
            job_title: rawFormData.jobTitle,
            department_id: department.id,
            employee_id: `PEP${String(Math.floor(Math.random() * 9000) + 1000).padStart(4,'0')}`,
            status: 'Active',
            email: rawFormData.email, // Denormalized for convenience
        });

    if(employeeError) {
        console.error("Error creating employee profile:", employeeError);
        // Clean up created records
        await supabase.auth.admin.deleteUser(authData.user.id);
        // The public.users row will be deleted by cascade
        return { success: false, message: employeeError.message };
    }

    revalidatePath('/[role]/employees', 'page');
    return { success: true };
}
