
'use server';

// This file is a placeholder for server actions related to employees.
// In the reverted version, data is handled by mock imports directly in components.

import type { AutoAssignRolesInput, AutoAssignRolesOutput } from "@/ai/flows/auto-assign-roles";

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

export async function addEmployeeAction(formData: FormData): Promise<{success: boolean, message?: string}> {
    console.log("Mock Action: Adding employee with data:", Object.fromEntries(formData));
    // Simulate a successful action
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
}
