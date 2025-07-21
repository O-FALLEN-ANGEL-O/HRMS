'use server';

import { autoAssignRoles, type AutoAssignRolesInput, type AutoAssignRolesOutput } from "@/ai/flows/auto-assign-roles";

export async function suggestRoleAction(input: AutoAssignRolesInput): Promise<AutoAssignRolesOutput> {
    return await autoAssignRoles(input);
}
