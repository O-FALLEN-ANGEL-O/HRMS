import type { ApplicantAssessment } from './walkin';

export type ApplicantWithAssessments = {
    applicantId: string;
    assessments: ApplicantAssessment[];
};

// Mock database table for standard applicant assessments
export const standardApplicantAssessments: ApplicantWithAssessments[] = [
    {
        applicantId: 'app-001', // Aarav Sharma
        assessments: [
            {
                assessmentId: 'asmt-002', // Technical Support (Level 1)
                status: 'Completed',
                attempts: [{ attemptNumber: 1, score: 85, completedAt: '2023-10-26T14:00:00Z' }],
            },
            {
                assessmentId: 'asmt-005', // Typing Test (1 Minute)
                status: 'Completed',
                attempts: [
                    { attemptNumber: 1, score: 55, completedAt: '2023-10-26T14:05:00Z' },
                    { attemptNumber: 2, score: 62, completedAt: '2023-10-26T14:10:00Z' }
                ],
            }
        ]
    },
    {
        applicantId: 'app-002', // Priya Patel
        assessments: [
            {
                assessmentId: 'asmt-001', // Customer Support Aptitude
                status: 'Completed',
                attempts: [{ attemptNumber: 1, score: 72, completedAt: '2023-10-25T11:00:00Z' }],
                retryRequest: {
                    reason: "The page crashed mid-way through my situational judgement section, and I had to restart, which I believe affected my score.",
                    status: 'Pending',
                    requestedAt: '2023-10-25T11:05:00Z'
                }
            }
        ]
    },
    {
        applicantId: 'app-003', // Rohan Gupta
        assessments: [] // No assessments assigned yet
    }
];
