
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase';

/**
 * A custom hook to get the team members for the currently logged-in manager or team leader.
 * @returns An array of employee objects who report to the current user.
 */
export function useTeam() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeam = async () => {
        if (!user || (user.role !== 'manager' && user.role !== 'team-leader')) {
            setTeamMembers([]);
            return;
        }

        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('department_id', user.profile.department_id)
            .neq('id', user.id); // Exclude the manager/leader themselves

        if (error) {
            console.error("Error fetching team:", error);
            setTeamMembers([]);
        } else {
            // Mocking performance data for demonstration
            const membersWithMockData = data.map(member => ({
                ...member,
                status: ['Active', 'Away', 'On Leave'][Math.floor(Math.random() * 3)],
                performance: Math.floor(Math.random() * 40) + 60, // 60-100
                tasksCompleted: Math.floor(Math.random() * 10) + 5,
                tasksPending: Math.floor(Math.random() * 5),
                avatar: member.profile_picture_url,
            }));
            setTeamMembers(membersWithMockData);
        }
    }
    fetchTeam();
  }, [user]);

  return teamMembers;
}
