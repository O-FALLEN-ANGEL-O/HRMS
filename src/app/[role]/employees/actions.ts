
'use server';

import type { AutoAssignRolesInput, AutoAssignRolesOutput } from "@/ai/flows/auto-assign-roles";
import { mockEmployees } from "@/lib/mock-data/employees";
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
    // Reverted to mock data to fix persistent db error
    return mockEmployees.map(e => ({
        ...e,
        user: { email: e.email, role: e.role },
        department: { name: e.department.name }
    }));
}

export async function deactivateEmployeeAction(employeeId: string) {
    // This is a mock action
    console.log(`Deactivating employee ${employeeId}`);
    const employee = mockEmployees.find(e => e.id === employeeId);
    if(employee) {
        employee.status = 'Inactive';
    }
    revalidatePath('/[role]/employees', 'page');
    return { success: true };
}


export async function addEmployeeAction(formData: FormData) {
    // This is a mock action
    const rawFormData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        jobTitle: formData.get('jobTitle') as string,
        departmentName: formData.get('department') as string,
        role: formData.get('role') as any,
    }
    console.log("Adding new employee (mock):", rawFormData);

    const newEmployee = {
        id: `profile-${Date.now()}`,
        full_name: rawFormData.name,
        email: rawFormData.email,
        job_title: rawFormData.jobTitle,
        department: { name: rawFormData.departmentName },
        department_id: `d-${Date.now()}`,
        role: rawFormData.role,
        employee_id: `PEP${String(Math.floor(Math.random() * 9000) + 1000).padStart(4,'0')}`,
        status: 'Active' as 'Active',
    };

    mockEmployees.push(newEmployee);
    
    revalidatePath('/[role]/employees', 'page');
    return { success: true };
}
