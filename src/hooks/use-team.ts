
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { mockEmployees } from '@/lib/mock-data/employees';

/**
 * A custom hook to get the team members for a given role.
 * In a real app, this would take a user ID and fetch their direct reports.
 * For the prototype, it filters the mock data based on role.
 * @returns An array of employee objects.
 */
export function useTeam() {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const params = useParams();
  const role = params.role as string;

  useEffect(() => {
    const fetchTeam = () => {
        let members;

        if (role === 'trainer') {
            // For trainers, find employees with "Trainee" in their job title
             members = mockEmployees.filter(employee => 
                employee.job_title.toLowerCase().includes('trainee')
            );
        } else {
            // For other managers/team leaders, mock a team from the Engineering dept.
            members = mockEmployees.filter(employee => 
                employee.department.name === 'Engineering' && employee.role !== 'manager'
            );
        }

        const membersWithMockData = members.map(member => ({
            ...member,
            status: ['Active', 'Away', 'On Leave'][Math.floor(Math.random() * 3)],
            performance: Math.floor(Math.random() * 40) + 60, // 60-100
            tasksCompleted: Math.floor(Math.random() * 10) + 5,
            tasksPending: Math.floor(Math.random() * 5),
            avatar: member.profile_picture_url,
            name: member.full_name,
            role: member.job_title,
        }));
        setTeamMembers(membersWithMockData);
    }
    fetchTeam();
  }, [role]);

  return teamMembers;
}
