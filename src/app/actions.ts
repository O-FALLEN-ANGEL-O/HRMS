
'use server';

// This file is a placeholder for global server actions.
// In the reverted version, data is handled by mock imports directly in components.
// We are keeping this file to avoid breaking imports, but it has no live functionality.

import type { User } from '@/lib/mock-data/employees';

export async function getUserProfileAction(employeeId: string): Promise<{ user: User | null, error: string | null }> {
    console.log("Mock Action: Getting user profile for", employeeId);
    
    // This function will not be used in the reverted mock state, but we keep the signature.
    // The login logic in useAuth now uses a direct mock data find.
    return { user: null, error: "This is a mock action. Data is not fetched from a database." };
}
