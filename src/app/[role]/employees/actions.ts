
'use server';

import { autoAssignRoles, type AutoAssignRolesInput, type AutoAssignRolesOutput } from "@/ai/flows/auto-assign-roles";

export async function suggestRoleAction(input: AutoAssignRolesInput): Promise<AutoAssignRolesOutput> {
    return await autoAssignRoles(input);
}

export async function addEmployeeAction(formData: FormData): Promise<{success: boolean, message?: string}> {
    console.log("Mock Action: Adding employee with data:", Object.fromEntries(formData));
    // In a real app, this would interact with a database and auth provider.
    // For this mock, the data is added directly in the client component for immediate feedback.
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
}
