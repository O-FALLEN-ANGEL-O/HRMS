
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { mockEmployees } from '@/lib/mock-data/employees';

/**
 * A custom hook to get the team members for the currently logged-in manager or team leader.
 * @returns An array of employee objects who report to the current user.
 */
export function useTeam() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeam = () => {
        if (!user || (user.role !== 'manager' && user.role !== 'team-leader')) {
            setTeamMembers([]);
            return;
        }
        
        // Filter mock employees who are in the same department as the manager, but are not the manager themselves.
        const members = mockEmployees.filter(employee => 
            employee.department_id === user.profile.department_id && employee.id !== user.id
        );

        const membersWithMockData = members.map(member => ({
            ...member,
            status: ['Active', 'Away', 'On Leave'][Math.floor(Math.random() * 3)],
            performance: Math.floor(Math.random() * 40) + 60, // 60-100
            tasksCompleted: Math.floor(Math.random() * 10) + 5,
            tasksPending: Math.floor(Math.random() * 5),
            avatar: member.profile_picture_url,
        }));
        setTeamMembers(membersWithMockData);
    }
    fetchTeam();
  }, [user]);

  return teamMembers;
}
