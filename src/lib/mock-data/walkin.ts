
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
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '9876543210',
        status: 'Registered',
        registrationDate: new Date().toISOString(),
        profilePicture: null,
        resumeUrl: null,
        experience: [],
        education: [],
        assessments: [
            {
                assessmentId: 'asmt-001',
                status: 'Completed',
                attempts: [{ attemptNumber: 1, score: 65, completedAt: '2024-07-30T10:00:00Z' }]
            },
            {
                assessmentId: 'asmt-004',
                status: 'Retry Requested',
                attempts: [{ attemptNumber: 1, score: 45, completedAt: '2024-07-30T11:00:00Z' }],
                retryRequest: {
                    reason: 'I experienced a technical issue with my keyboard during the first attempt which affected my speed. I believe I can perform much better.',
                    status: 'Pending',
                    requestedAt: '2024-07-30T11:05:00Z'
                }
            }
        ]
    }
];
