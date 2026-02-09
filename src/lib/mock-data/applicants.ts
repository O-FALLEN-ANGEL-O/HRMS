
export type Applicant = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  appliedDate: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired';
};

export const applicants: Applicant[] = [
  { id: 'app-001', name: 'Aarav Sharma', avatar: 'https://placehold.co/100x100?text=AS', role: 'Senior Frontend Developer', appliedDate: '2023-10-25', status: 'Interview' },
  { id: 'app-002', name: 'Priya Patel', avatar: 'https://placehold.co/100x100?text=PP', role: 'Product Manager', appliedDate: '2023-10-24', status: 'Applied' },
  { id: 'app-003', name: 'Rohan Gupta', avatar: 'https://placehold.co/100x100?text=RG', role: 'UI/UX Designer', appliedDate: '2023-10-23', status: 'Screening' },
  { id: 'app-004', name: 'Sneha Verma', avatar: 'https://placehold.co/100x100?text=SV', role: 'Senior Frontend Developer', appliedDate: '2023-10-22', status: 'Offer' },
  { id: 'app-005', name: 'Vikram Singh', avatar: 'https://placehold.co/100x100?text=VS', role: 'DevOps Engineer', appliedDate: '2023-10-21', status: 'Hired' },
  { id: 'app-006', name: 'Ananya Reddy', avatar: 'https://placehold.co/100x100?text=AR', role: 'Senior Frontend Developer', appliedDate: '2023-10-26', status: 'Screening' },
  { id: 'app-007', name: 'Karan Malhotra', avatar: 'https://placehold.co/100x100?text=KM', role: 'Product Manager', appliedDate: '2023-10-26', status: 'Interview' },
  { id: 'app-008', name: 'Diya Singh', avatar: 'https://placehold.co/100x100?text=DS', role: 'UI/UX Designer', appliedDate: '2023-10-25', status: 'Applied' },
];
