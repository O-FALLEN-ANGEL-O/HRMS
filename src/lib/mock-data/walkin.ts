
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
        education: []
    }
];
