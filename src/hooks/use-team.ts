
'use client';

import { useState, useEffect } from 'react';
import { mockEmployees } from '@/lib/mock-data/employees';

/**
 * A custom hook to get the team members for a given department.
 * In a real app, this would take a department ID and fetch from an API.
 * For the prototype, it filters the mock data.
 * @returns An array of employee objects who are in the 'Engineering' department.
 */
export function useTeam() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTeam = () => {
        // Mocking a manager's team view - showing Engineering dept.
        const members = mockEmployees.filter(employee => 
            employee.department.name === 'Engineering' && employee.role !== 'manager'
        );

        const membersWithMockData = members.map(member => ({
            ...member,
            status: ['Active', 'Away', 'On Leave'][Math.floor(Math.random() * 3)],
            performance: Math.floor(Math.random() * 40) + 60, // 60-100
            tasksCompleted: Math.floor(Math.random() * 10) + 5,
            tasksPending: Math.floor(Math.random() * 5),
            avatar: member.profile_picture_url,
            name: member.full_name,
        }));
        setTeamMembers(membersWithMockData);
    }
    fetchTeam();
  }, []);

  return teamMembers;
}
