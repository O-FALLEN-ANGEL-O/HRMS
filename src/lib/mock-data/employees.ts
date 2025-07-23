
export type UserProfile = {
  id: string;
  full_name: string;
  department: { name: string };
  department_id: string;
  job_title: string;
  role: 'admin' | 'employee' | 'hr' | 'manager' | 'recruiter' | 'qa-analyst' | 'process-manager' | 'team-leader' | 'marketing' | 'finance' | 'it-manager' | 'operations-manager' | 'account-manager' | 'trainer';
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
            full_name: 'Jackson Lee',
            department: { name: 'Human Resources' },
            department_id: 'd-002',
            job_title: 'HR Manager',
            role: 'hr',
            employee_id: 'PEP0002',
            phone_number: '111-222-3334',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Jackson+Lee&background=random`,
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
        id: 'user-005',
        email: 'qa.analyst@optitalent.com',
        role: 'qa-analyst',
        profile: {
            id: 'profile-005',
            full_name: 'Ben Carter',
            department: { name: 'Quality Assurance' },
            department_id: 'd-003',
            job_title: 'QA Analyst',
            role: 'qa-analyst',
            employee_id: 'PEP0005',
            phone_number: '111-222-3337',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Ben+Carter&background=random`,
        }
    },
    {
        id: 'user-006',
        email: 'process.manager@optitalent.com',
        role: 'process-manager',
        profile: {
            id: 'profile-006',
            full_name: 'Chloe Garcia',
            department: { name: 'Process Excellence' },
            department_id: 'd-004',
            job_title: 'Process Manager',
            role: 'process-manager',
            employee_id: 'PEP0006',
            phone_number: '111-222-3338',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Chloe+Garcia&background=random`,
        }
    },
    {
        id: 'user-007',
        email: 'team.leader@optitalent.com',
        role: 'team-leader',
        profile: {
            id: 'profile-007',
            full_name: 'David Kim',
            department: { name: 'Customer Support' },
            department_id: 'd-005',
            job_title: 'Team Leader',
            role: 'team-leader',
            employee_id: 'PEP0007',
            phone_number: '111-222-3339',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=David+Kim&background=random`,
        }
    },
    {
        id: 'user-008',
        email: 'marketing@optitalent.com',
        role: 'marketing',
        profile: {
            id: 'profile-008',
            full_name: 'Emily White',
            department: { name: 'Marketing' },
            department_id: 'd-006',
            job_title: 'Marketing Head',
            role: 'marketing',
            employee_id: 'PEP0008',
            phone_number: '111-222-3340',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Emily+White&background=random`,
        }
    },
    {
        id: 'user-009',
        email: 'finance@optitalent.com',
        role: 'finance',
        profile: {
            id: 'profile-009',
            full_name: 'Frank Miller',
            department: { name: 'Finance' },
            department_id: 'd-007',
            job_title: 'Finance Manager',
            role: 'finance',
            employee_id: 'PEP0009',
            phone_number: '111-222-3341',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Frank+Miller&background=random`,
        }
    },
    {
        id: 'user-010',
        email: 'it.manager@optitalent.com',
        role: 'it-manager',
        profile: {
            id: 'profile-010',
            full_name: 'Grace Hall',
            department: { name: 'IT' },
            department_id: 'd-008',
            job_title: 'IT Manager',
            role: 'it-manager',
            employee_id: 'PEP0010',
            phone_number: '111-222-3342',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Grace+Hall&background=random`,
        }
    },
    {
        id: 'user-011',
        email: 'operations.manager@optitalent.com',
        role: 'operations-manager',
        profile: {
            id: 'profile-011',
            full_name: 'Henry Turner',
            department: { name: 'Operations' },
            department_id: 'd-009',
            job_title: 'Operations Manager',
            role: 'operations-manager',
            employee_id: 'PEP0011',
            phone_number: '111-222-3343',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Henry+Turner&background=random`,
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
    { 
        id: 'user-014',
        email: 'employee3@optitalent.com',
        role: 'employee',
        profile: {
            id: 'profile-014',
            full_name: 'Priya Mehta',
            department: { name: 'Engineering' },
            department_id: 'd-001',
            job_title: 'QA Engineer',
            role: 'employee',
            employee_id: 'PEP0014',
            phone_number: '111-222-3346',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Priya+Mehta&background=random`,
        }
    },
    { 
        id: 'user-015',
        email: 'account.manager@optitalent.com',
        role: 'account-manager',
        profile: {
            id: 'profile-015',
            full_name: 'Leo Wilson',
            department: { name: 'Client Services' },
            department_id: 'd-010',
            job_title: 'Account Manager',
            role: 'account-manager',
            employee_id: 'PEP0015',
            phone_number: '111-222-3347',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Leo+Wilson&background=random`,
        }
    },
    { 
        id: 'user-016',
        email: 'trainer@optitalent.com',
        role: 'trainer',
        profile: {
            id: 'profile-016',
            full_name: 'Olivia Chen',
            department: { name: 'Learning & Development' },
            department_id: 'd-011',
            job_title: 'Corporate Trainer',
            role: 'trainer',
            employee_id: 'PEP0016',
            phone_number: '111-222-3348',
            status: 'Active',
            profile_picture_url: `https://ui-avatars.com/api/?name=Olivia+Chen&background=random`,
        }
    },
];

// For list views
export const mockEmployees = mockUsers.map(u => u.profile);
