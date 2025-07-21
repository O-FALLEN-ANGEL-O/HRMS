
'use client';

import { useMemo } from 'react';
import { useAuth } from './use-auth';
import { initialEmployees } from '@/app/[role]/employees/page';

/**
 * A custom hook to get the team members for the currently logged-in manager or team leader.
 * @returns An array of employee objects who report to the current user.
 */
export function useTeam() {
  const { user } = useAuth();

  const teamMembers = useMemo(() => {
    if (!user || (user.role !== 'manager' && user.role !== 'team-leader')) {
      return [];
    }

    // Filter the global employee list to find employees in the manager's department.
    // Exclude the manager themselves from the list.
    return initialEmployees.filter(
      (employee) =>
        employee.department === user.profile?.department &&
        employee.email !== user.email
    );
  }, [user]);

  return teamMembers;
}
