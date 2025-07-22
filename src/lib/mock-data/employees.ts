
export type UserProfile = {
  id: string;
  full_name: string;
  department: { name: string };
  department_id: string;
  job_title: string;
  role: 'admin' | 'employee' | 'hr' | 'manager' | 'recruiter' | 'qa-analyst' | 'process-manager' | 'team-leader' | 'marketing' | 'finance' | 'it-manager' | 'operations-manager';
  employee_id: string;
  profile_picture_url?: string;
  phone_number?: string;
  status: 'Active' | 'Inactive';
};

export type User = {
  id: string;
  email: string;
  role: UserProfile['role'];
  profile: UserProfile;
}

export const mockUsers: User[] = [
    { 
        id: 'user-001',
        email: 'admin@optitalent.com',
        role: 'admin',
        profile: {
            id: 'profile-001',
            full_name: 'Admin User',
            department: { name: 'Administration' },
            department_id: 'd-000',
            job_title: 'System Administrator',
            role: 'admin',
            employee_id: 'PEP0001',
            phone_number: '111-222-3333',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Admin+User&background=random`,
        }
    },
    { 
        id: 'user-002',
        email: 'hr@optitalent.com',
        role: 'hr',
        profile: {
            id: 'profile-002',
            full_name: 'HR User',
            department: { name: 'Human Resources' },
            department_id: 'd-002',
            job_title: 'HR Manager',
            role: 'hr',
            employee_id: 'PEP0002',
            phone_number: '111-222-3334',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=HR+User&background=random`,
        }
    },
    { 
        id: 'user-003',
        email: 'manager@optitalent.com',
        role: 'manager',
        profile: {
            id: 'profile-003',
            full_name: 'Isabella Nguyen',
            department: { name: 'Engineering' },
            department_id: 'd-001',
            job_title: 'Engineering Manager',
            role: 'manager',
            employee_id: 'PEP0003',
            phone_number: '111-222-3335',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Isabella+Nguyen&background=random`,
        }
    },
    { 
        id: 'user-004',
        email: 'recruiter@optitalent.com',
        role: 'recruiter',
        profile: {
            id: 'profile-004',
            full_name: 'Sofia Davis',
            department: { name: 'Human Resources' },
            department_id: 'd-002',
            job_title: 'Talent Acquisition',
            role: 'recruiter',
            employee_id: 'PEP0004',
            phone_number: '111-222-3336',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Sofia+Davis&background=random`,
        }
    },
    { 
        id: 'user-012',
        email: 'employee@optitalent.com',
        role: 'employee',
        profile: {
            id: 'profile-012',
            full_name: 'Anika Sharma',
            department: { name: 'Engineering' },
            department_id: 'd-001',
            job_title: 'Software Engineer',
            role: 'employee',
            employee_id: 'PEP0012',
            phone_number: '111-222-3344',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Anika+Sharma&background=random`,
        }
    },
     { 
        id: 'user-013',
        email: 'employee2@optitalent.com',
        role: 'employee',
        profile: {
            id: 'profile-013',
            full_name: 'Rohan Verma',
            department: { name: 'Engineering' },
            department_id: 'd-001',
            job_title: 'Software Engineer',
            role: 'employee',
            employee_id: 'PEP0013',
            phone_number: '111-222-3345',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Rohan+Verma&background=random`,
        }
    },
];

// For list views
export const mockEmployees = mockUsers.map(u => u.profile);

