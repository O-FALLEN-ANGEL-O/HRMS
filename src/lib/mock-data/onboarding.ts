
export type OnboardingCandidate = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Offer Accepted' | 'Awaiting Decision';
};

export const onboardingCandidates: OnboardingCandidate[] = [
    {
        id: 'app-004',
        name: 'Sneha Verma',
        email: 'sneha.v@example.com',
        role: 'Senior Frontend Developer',
        status: 'Offer Accepted'
    },
    {
        id: 'app-006',
        name: 'Rajesh Kumar',
        email: 'rajesh.k@example.com',
        role: 'Product Manager',
        status: 'Offer Accepted'
    },
    {
        id: 'app-007',
        name: 'Anita Desai',
        email: 'anita.d@example.com',
        role: 'UI/UX Designer',
        status: 'Awaiting Decision'
    }
];
