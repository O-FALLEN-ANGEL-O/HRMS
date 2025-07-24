
'use server';

import type { AutoAssignRolesInput, AutoAssignRolesOutput } from "@/ai/flows/auto-assign-roles";
import { createServerClient } from "@/lib/supabase";
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
    const supabase = createServerClient();

    // Fetch data from each table separately
    const { data: employeesData, error: employeesError } = await supabase.from('employees').select('*');
    const { data: usersData, error: usersError } = await supabase.from('users').select('*');
    const { data: departmentsData, error: departmentsError } = await supabase.from('departments').select('*');

    if (employeesError || usersError || departmentsError) {
        console.error('Error fetching data:', { employeesError, usersError, departmentsError });
        return [];
    }

    // Join the data in code
    const usersById = new Map(usersData.map(user => [user.id, user]));
    const departmentsById = new Map(departmentsData.map(dept => [dept.id, dept]));

    const combinedData = employeesData.map(employee => ({
        ...employee,
        user: usersById.get(employee.user_id),
        department: departmentsById.get(employee.department_id),
    }));

    return combinedData;
}

export async function deactivateEmployeeAction(employeeId: string) {
    const supabase = createServerClient();
    const { error } = await supabase
        .from('employees')
        .update({ status: 'Inactive' })
        .eq('id', employeeId);

    if (error) {
        console.error('Error deactivating employee:', error);
        return { success: false, message: error.message };
    }

    revalidatePath('/[role]/employees', 'page');
    return { success: true };
}


export async function addEmployeeAction(formData: FormData) {
    const supabase = createServerClient();
    
    const rawFormData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        jobTitle: formData.get('jobTitle') as string,
        departmentName: formData.get('department') as string,
        role: formData.get('role') as string,
    }

    // This is a simplified version. A real app would handle:
    // 1. Creating an auth user.
    // 2. Finding or creating the department.
    // 3. Rolling back transactions on failure.

    const { data: newUser, error: userError } = await supabase.from('users').insert({
        email: rawFormData.email,
        role: rawFormData.role as any, // Cast for simplicity
        id: crypto.randomUUID(), // This would come from auth in a real app
    }).select().single();

    if (userError || !newUser) {
        console.error("Error creating user", userError);
        return { success: false, message: userError?.message || 'Failed to create user' };
    }

    // For simplicity, we assume department exists.
    const { data: department } = await supabase.from('departments').select('id').eq('name', rawFormData.departmentName).single();
    if(!department) {
        return { success: false, message: 'Department not found' };
    }

    const { error: employeeError } = await supabase.from('employees').insert({
        user_id: newUser.id,
        full_name: rawFormData.name,
        job_title: rawFormData.jobTitle,
        department_id: department.id,
        employee_id: `PEP${String(Math.floor(Math.random() * 9000) + 1000).padStart(4,'0')}`,
    });

    if (employeeError) {
        console.error("Error creating employee profile", employeeError);
        // Here you would ideally delete the user you just created (rollback)
        return { success: false, message: employeeError.message };
    }

    revalidatePath('/[role]/employees', 'page');
    return { success: true };
}
