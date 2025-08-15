
export type Notification = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
};

export const notifications: Record<string, Notification[]> = {
  admin: [
    { id: 'n-admin-1', title: 'New Employee Added', description: 'Rohan Verma has been added to the Engineering department.', timestamp: '15 minutes ago' },
    { id: 'n-admin-2', title: 'Payroll Processed', description: 'Monthly payroll for July 2024 has been successfully processed.', timestamp: '2 hours ago' },
    { id: 'n-admin-3', title: 'High-Priority Ticket', description: 'Ticket #HD-001 (Laptop running slow) requires attention.', timestamp: '4 hours ago' },
  ],
  hr: [
    { id: 'n-hr-1', title: 'New Leave Request', description: 'Priya Mehta has requested 5 days of PTO.', timestamp: '30 minutes ago' },
    { id: 'n-hr-2', title: 'Candidate Moved to Offer Stage', description: 'Aarav Sharma has been moved to the offer stage for Sr. Frontend Developer.', timestamp: '1 hour ago' },
    { id: 'n-hr-3', title: 'Onboarding Completed', description: 'David Chen has completed all onboarding tasks.', timestamp: '1 day ago' },
  ],
  manager: [
    { id: 'n-mgr-1', title: 'Leave Request Approved', description: 'Your leave request for Anika Sharma has been approved by HR.', timestamp: '5 minutes ago' },
    { id: 'n-mgr-2', title: 'New Team Member', description: 'Liam Johnson has joined your team as a Software Engineer Trainee.', timestamp: '1 day ago' },
    { id: 'n-mgr-3', title: 'Performance Review Due', description: 'Rohan Verma\'s quarterly performance review is due next week.', timestamp: '3 days ago' },
  ],
  employee: [
    { id: 'n-emp-1', title: 'Leave Approved', description: 'Your sick leave for July 10th has been approved.', timestamp: '1 hour ago' },
    { id: 'n-emp-2', title: 'Payslip Generated', description: 'Your payslip for July 2024 is now available for download.', timestamp: '3 hours ago' },
    { id: 'n-emp-3', title: 'New Course Assigned', description: 'You have been assigned the "Advanced Communication Skills" course.', timestamp: '2 days ago' },
  ],
  recruiter: [
    { id: 'n-rec-1', title: 'New Applicant', description: 'Diya Singh applied for the UI/UX Designer role.', timestamp: '25 minutes ago' },
    { id: 'n-rec-2', title: 'Interview Feedback Received', description: 'Isabella Nguyen has submitted feedback for Aarav Sharma.', timestamp: '3 hours ago' },
    { id: 'n-rec-3', title: 'Offer Accepted', description: 'Vikram Singh has accepted the offer for the DevOps Engineer role.', timestamp: '1 day ago' },
  ],
  // Default notifications for other roles can be added here
  'default': [
      { id: 'n-def-1', title: 'Welcome to OptiTalent!', description: 'Explore your dashboard to get started.', timestamp: '1 day ago' },
  ]
};

// Populate other roles with default or specific notifications
const allRoles = ['qa-analyst', 'process-manager', 'team-leader', 'marketing', 'finance', 'it-manager', 'operations-manager', 'account-manager', 'trainer', 'trainee'];
allRoles.forEach(role => {
    if (!notifications[role]) {
        notifications[role] = notifications['default'];
    }
});
