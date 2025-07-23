
export type Experience = {
    company: string;
    title: string;
    dates: string;
    description: string;
};

export type Education = {
    institution: string;
    degree: string;
    year: string;
};

export type ApplicantAssessment = {
    assessmentId: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Retry Requested' | 'Retry Approved';
    attempts: {
        attemptNumber: number;
        score: number | null;
        completedAt: string | null;
    }[];
    retryRequest?: {
        reason: string;
        status: 'Pending' | 'Approved' | 'Denied';
        requestedAt: string;
    }
};

export type WalkinApplicant = {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: 'Registered' | 'Assessment Pending' | 'Assessment Completed' | 'Interview Scheduled' | 'On Hold' | 'Selected' | 'Not Selected';
    registrationDate: string;
    profilePicture: string | null;
    resumeUrl: string | null;
    experience: Experience[];
    education: Education[];
    assessments: ApplicantAssessment[];
};

export const walkinApplicants: WalkinApplicant[] = [
    {
        id: 'WALK-20240729-001',
        fullName: 'Liam Johnson',
        email: 'liam.j@optitalent.com',
        phone: '111-222-3349',
        status: 'Registered',
        registrationDate: new Date().toISOString(),
        profilePicture: `https://ui-avatars.com/api/?name=Liam+Johnson&background=random`,
        resumeUrl: null,
        experience: [],
        education: [],
        assessments: [
            {
                assessmentId: 'asmt-001',
                status: 'Completed',
                attempts: [{ attemptNumber: 1, score: 82, completedAt: '2024-07-30T10:00:00Z' }]
            },
            {
                assessmentId: 'asmt-004',
                status: 'Completed',
                attempts: [{ attemptNumber: 1, score: 58, completedAt: '2024-07-30T11:00:00Z' }],
            }
        ]
    },
    {
        id: 'WALK-20240729-002',
        fullName: 'Ava Wilson',
        email: 'ava.w@optitalent.com',
        phone: '111-222-3350',
        status: 'Registered',
        registrationDate: new Date().toISOString(),
        profilePicture: `https://ui-avatars.com/api/?name=Ava+Wilson&background=random`,
        resumeUrl: null,
        experience: [],
        education: [],
        assessments: [
            {
                assessmentId: 'asmt-001',
                status: 'Completed',
                attempts: [{ attemptNumber: 1, score: 76, completedAt: '2024-07-30T10:15:00Z' }]
            },
            {
                assessmentId: 'asmt-004',
                status: 'Not Started',
                attempts: [],
            }
        ]
    },
    {
        id: 'WALK-20240729-003',
        fullName: 'Noah Brown',
        email: 'noah.b@optitalent.com',
        phone: '111-222-3351',
        status: 'Registered',
        registrationDate: new Date().toISOString(),
        profilePicture: `https://ui-avatars.com/api/?name=Noah+Brown&background=random`,
        resumeUrl: null,
        experience: [],
        education: [],
        assessments: []
    }
];
