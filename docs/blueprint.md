# **App Name**: OptiTalent HRMS

## Core Features:

- Secure Multi-Role Access: Multi-Role Login (Admin, HR, Manager, Employee, Recruiter, Guest) with simulated login functionality and passwordless authentication (Magic Links, OTP, Biometrics). SSO Integration (Google, Microsoft, LinkedIn) and JWT-Based Session Management.
- AI-Powered Security: AI-powered tool which automatically suggests role based on department/job title (auto-assign-roles()). Also includes AI to detect suspicious login attempts (detect-suspicious-logins()).
- Recruitment Management: Job Posting Management (Draft, Publish, Archive), AI Resume Parser (PDF/Image → Structured JSON), Applicant Tracking System (ATS) (Kanban + Table View), Interview Scheduling (Google Calendar Sync, Auto-Reminders), Offer Letter Generator (Custom Templates + E-Sign), Background Checks (Integration with Checkr/GoodHire).
- AI-Enhanced Recruitment: AI-driven tool which ranks candidates (0-100%) based on job description and resume (score-resume(jd, resume)). The AI tool also suggests role-specific interview questions (suggest-interview-questions(role)) and predicts hiring timeline based on market data (predict-hiring-timeline()).
- Streamlined Onboarding: Digital Onboarding Workflow (Task Checklists), E-Sign Documents (Offer Letter, NDA, Policy), Buddy System (Assign mentors to new hires), Asset Allocation (Laptop, ID Card, Software Access), Exit Interviews (Automated feedback collection).
- AI-Driven Onboarding and Retention: The AI tool automatically generates personalized welcome emails (auto-generate-welcome-email()) and predicts employee attrition risk, flagging employees likely to quit (predict-attrition-risk()).
- Attendance and Leave Tracking: Biometric/GPS/QR Check-In (Mobile + Web), Shift Management (Fixed, Rotational, Hybrid), Leave Management (Sick, Casual, PTO, WFH), Overtime Calculation (Auto payroll sync), Attendance Analytics (Latecomers, Absenteeism). Geofencing Attendance (Prevents proxy check-ins)
- AI Optimized Scheduling: AI tool predicts leave spikes, warning HR about upcoming leave surges (predict-leave-spikes()), and it approves leaves automatically based on past patterns (auto-approve-leaves()).
- Automated Payroll: Automated Salary Processing (Tax, PF, ESI, Bonuses), Payslip Generator (PDF + Email), Reimbursements (Expense Claims + Approval Flow), Tax Compliance (Auto TDS, Form 16 Generation).
- AI-Powered Payroll Accuracy: AI tool flags discrepancies before processing payroll, with the error detecting tool (detect-payroll-errors()), and it benchmarks salaries against industry standards (benchmark-salaries()).
- Performance Management: OKR/KPI Tracking (Quarterly Reviews), 360° Feedback (Peer, Manager, Self), 1:1 Meeting Scheduler (With Notes), Skill Gap Analysis (Learning Recommendations).
- AI-Driven Performance Insights: The AI analyzes feedback to detect bias in reviews (analyze-feedback()) and suggests promotions by identifying high-potential employees (suggest-promotions()).
- Learning & Development: Course Marketplace (Udemy/Coursera Integration), Certification Tracking (Expiry Alerts), AI-Powered Skill Recommendations.
- Employee Engagement: Pulse Surveys (Sentiment Analysis), Kudos & Rewards (Gamification), Social Feed (Announcements, Birthdays).
- AI Enhanced Welfare: The AI predicts employee burnout, alerting managers about stressed employees (predict-burnout()).
- Employee Support: AI Chatbot (HR Policy Q&A) and IT/HR/Finance Tickets (SLA Tracking). AI-Powered Resume Builder (For employees).
- HR Analytics: Attrition Prediction, Hiring Funnel Analysis, Workforce Cost Optimization. Workforce Diversity Analytics (Gender, Age, Tenure). Compliance Automation (GDPR, Labor Laws).

## Style Guidelines:

- Primary color: Light purple (#A893E0), offering a calming and modern feel. It reflects innovation and creativity within the HRMS.
- Background color: Very light gray (#F5F5F5), maintaining a neutral and clean backdrop that ensures readability and reduces eye strain.
- Accent color: Lavender (#E6E6FA), providing a soft and subtle contrast, drawing attention to key interactive elements in a gentle manner.
- Headline font: 'Space Grotesk' sans-serif. Body font: 'Inter' sans-serif. 'Space Grotesk' will provide a modern, professional feel to headlines while 'Inter' will be for body text.
- Use clean, minimalist icons from a set like Material Design Icons to ensure consistency and clarity across the platform.
- Maintain a clean, card-based layout inspired by modern SaaS dashboards. Use clear grid systems to ensure responsive design across various screen sizes.
- Implement subtle animations, such as micro-interactions on button hover and smooth transitions between sections, to enhance user experience without being distracting.