
'use server';

import type { AutoAssignRolesInput, AutoAssignRolesOutput } from "@/ai/flows/auto-assign-roles";

// Mock implementation for the frontend-only prototype
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
