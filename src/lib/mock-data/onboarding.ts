
export type OnboardingCandidate = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Offer Sent' | 'Pending' | 'Onboarding';
};

export const onboardingCandidates: OnboardingCandidate[] = [
  {
    id: 'cand-001',
    name: 'Javier Rodriguez',
    email: 'javier.r@example.com',
    role: 'Backend Engineer',
    status: 'Offer Sent',
  },
  {
    id: 'cand-002',
    name: 'Emily Johnson',
    email: 'emily.j@example.com',
    role: 'Product Designer',
    status: 'Pending',
  },
  {
    id: 'cand-003',
    name: 'David Chen',
    email: 'david.c@example.com',
    role: 'Data Analyst',
    status: 'Onboarding',
  },
  {
    id: 'cand-004',
    name: 'Samantha Williams',
    email: 'samantha.w@example.com',
    role: 'Marketing Specialist',
    status: 'Offer Sent',
  },
];
