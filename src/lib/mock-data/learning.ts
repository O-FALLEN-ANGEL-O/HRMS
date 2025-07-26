
export type Course = {
    id: string;
    title: string;
    category: 'Compliance' | 'Product Training' | 'Soft Skills';
    duration: number; // in hours
    assignedDate: string;
    dueDate: string;
    imageUrl?: string;
};

export type EmployeeProgress = {
    employeeId: string;
    courseId: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    progress: number; // percentage
};

export const courses: Course[] = [
    {
        id: 'C001',
        title: 'Data Privacy & GDPR',
        category: 'Compliance',
        duration: 2,
        assignedDate: '2024-07-01',
        dueDate: '2024-07-30',
        imageUrl: 'https://placehold.co/600x400.png',
    },
    {
        id: 'C002',
        title: 'Advanced Communication Skills',
        category: 'Soft Skills',
        duration: 8,
        assignedDate: '2024-07-15',
        dueDate: '2024-08-15',
        imageUrl: 'https://placehold.co/600x400.png',
    },
    {
        id: 'C003',
        title: 'OptiTalent Platform Deep Dive',
        category: 'Product Training',
        duration: 4,
        assignedDate: '2024-06-20',
        dueDate: '2024-07-20',
        imageUrl: 'https://placehold.co/600x400.png',
    },
     {
        id: 'C004',
        title: 'Cybersecurity Awareness',
        category: 'Compliance',
        duration: 1,
        assignedDate: '2024-07-01',
        dueDate: '2024-07-25',
        imageUrl: 'https://placehold.co/600x400.png',
    },
];

export const employeeCourseProgress: EmployeeProgress[] = [
    // Anika Sharma's Progress
    { employeeId: 'PEP0012', courseId: 'C001', status: 'Completed', progress: 100 },
    { employeeId: 'PEP0012', courseId: 'C002', status: 'In Progress', progress: 50 },
    { employeeId: 'PEP0012', courseId: 'C003', status: 'Not Started', progress: 0 },
    { employeeId: 'PEP0012', courseId: 'C004', status: 'In Progress', progress: 25 },


    // Rohan Verma's Progress
    { employeeId: 'PEP0013', courseId: 'C001', status: 'In Progress', progress: 75 },
    { employeeId: 'PEP0013', courseId: 'C002', status: 'Not Started', progress: 0 },
    { employeeId: 'PEP0013', courseId: 'C004', status: 'Completed', progress: 100 },


    // Priya Mehta's Progress
    { employeeId: 'PEP0014', courseId: 'C001', status: 'Completed', progress: 100 },
    { employeeId: 'PEP0014', courseId: 'C002', status: 'Completed', progress: 100 },
    { employeeId: 'PEP0014', courseId: 'C003', status: 'Completed', progress: 100 },
    { employeeId: 'PEP0014', courseId: 'C004', status: 'Completed', progress: 100 },

    // Liam Johnson (Trainee)
     { employeeId: 'PEP0017', courseId: 'C001', status: 'In Progress', progress: 10 },
     { employeeId: 'PEP0017', courseId: 'C004', status: 'Not Started', progress: 0 },
];
