
# **Project Proposal: OptiTalent HRMS**

## **1. Vision & Overview**

**OptiTalent** is a next-generation, AI-enhanced Human Resource Management System (HRMS) designed to automate and intelligently streamline the entire employee lifecycle. Built on a modern, robust tech stack, OptiTalent empowers organizations to manage everything from recruitment and onboarding to payroll and performance management with unparalleled efficiency and insight. By integrating Google's Gemini models via the Genkit framework, the platform offers powerful AI-driven tools that automate repetitive tasks, provide predictive analytics, and enhance decision-making for HR professionals, managers, and leadership.

This document outlines the comprehensive feature set and technical architecture of the OptiTalent prototype.

---

## **2. Core Technologies**

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
-   **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (with Google Gemini)
-   **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)

---

## **3. Detailed Feature Breakdown**

### **Module 1: Secure Access & Authentication**

-   **Multi-Role Login**: Role-based access control (RBAC) for Admin, HR, Manager, Employee, Recruiter, and Guest roles, each with a tailored dashboard and permissions.
-   **Simulated Login**: A "role selector" page allows for easy testing of different user perspectives without needing multiple accounts.
-   **Passwordless Authentication**: Support for modern authentication methods like Magic Links, One-Time Passwords (OTP), and biometrics to enhance security and user experience.
-   **Single Sign-On (SSO)**: Integration with Google, Microsoft, and LinkedIn for seamless and secure enterprise login.
-   **JWT-Based Session Management**: Secure, stateless session management with automatic token refresh.
-   **AI-Powered Security**:
    -   `auto-assign-roles()`: An AI flow that suggests the appropriate user role based on a new employee's department and job title, simplifying user setup.
    -   `detect-suspicious-logins()`: An AI service that flags unusual login attempts based on factors like location, time, and device.

### **Module 2: Recruitment Management**

-   **Job Posting Management**: Full lifecycle management for job postings (Draft, Publish, Archive).
-   **AI Resume Parser**: A Genkit flow (`score-and-parse-resume`) that accepts resumes (PDF, DOCX, Image) and instantly extracts structured JSON data (contact info, skills, experience, education).
-   **Applicant Tracking System (ATS)**: Visual management of the hiring pipeline with both Kanban and Table views.
-   **Interview Scheduling**: Google Calendar integration to streamline scheduling and send automated reminders to interviewers and candidates.
-   **Offer Letter Generator**: Create, customize, and send offer letters with e-signature capabilities.
-   **Background Checks**: API integration with services like Checkr or GoodHire.
-   **AI-Enhanced Recruitment**:
    -   `score-resume(jd, resume)`: AI-powered tool that scores and ranks candidates on a scale of 0-100 based on their resume's match with the job description.
    -   `suggest-interview-questions(role)`: AI that generates relevant, role-specific interview questions.
    -   `predict-hiring-timeline()`: An AI model that estimates the time-to-fill for a position based on role, seniority, and market data.

### **Module 3: Onboarding & Employee Lifecycle**

-   **Digital Onboarding Workflow**: Customizable task checklists for new hires, managers, and HR to ensure a smooth onboarding process.
-   **E-Sign Documents**: Securely sign and store critical documents like offer letters, NDAs, and company policies.
-   **Buddy System**: Assign and manage mentors for new hires directly within the platform.
-   **Asset Allocation**: Track the assignment of company assets like laptops, ID cards, and software licenses.
-   **Exit Interviews**: Automate the collection of feedback from departing employees through structured surveys.
-   **AI-Driven Onboarding**:
    -   `auto-generate-welcome-email()`: AI crafts a personalized and professional welcome email to introduce the new hire to the company.
    -   `predict-attrition-risk()`: A predictive AI model that flags employees who are at high risk of leaving, allowing for proactive retention efforts.

### **Module 4: Attendance & Leave Management**

-   **Multi-Modal Check-In**: Support for Biometric, GPS, and QR code-based check-ins via both mobile and web.
-   **Shift Management**: Create and manage fixed, rotational, and hybrid work shifts.
-   **Leave Management**: A complete system for applying, approving, and tracking leave (Sick, Casual, PTO, WFH).
-   **Overtime Calculation**: Automatically calculate overtime hours with direct sync to the payroll module.
-   **Attendance Analytics**: Dashboard widgets to monitor latecomers, absenteeism, and other key attendance metrics.
-   **AI-Optimized Scheduling**:
    -   `predict-leave-spikes()`: AI warns HR about potential periods of high leave requests (e.g., around holidays), helping with resource planning.
    -   `auto-approve-leaves()`: An AI agent that can automatically approve standard leave requests based on team availability and historical patterns.

### **Module 5: Payroll & Compensation**

-   **Automated Salary Processing**: End-to-end salary calculation, including taxes (TDS), Provident Fund (PF), ESI, and bonuses.
-   **Payslip Generator**: Automatically generate and email PDF payslips to employees.
-   **Reimbursement Workflow**: A complete flow for employees to submit expense claims and for managers to approve them.
-   **Tax Compliance**: Tools to ensure tax compliance, including automatic TDS calculation and Form 16 generation.
-   **AI-Powered Payroll Accuracy**:
    -   `detect-payroll-errors()`: An AI auditor that flags discrepancies (e.g., unusual bonus amounts, negative salaries) before payroll is processed.
    -   `benchmark-salaries()`: AI tool to compare company salaries against industry and regional standards to ensure competitive compensation.

### **Module 6: Performance Management**

-   **OKR/KPI Tracking**: Set, track, and review Objectives and Key Results or Key Performance Indicators on a recurring basis (e.g., quarterly).
-   **360° Feedback**: A comprehensive feedback system allowing for input from peers, managers, and direct reports, as well as self-assessment.
-   **1:1 Meeting Scheduler**: Tools to schedule, track, and document one-on-one meetings.
-   **Skill Gap Analysis**: Identify skill gaps within teams and receive AI-powered learning recommendations.
-   **AI-Driven Performance Insights**:
    -   `analyze-feedback()`: AI analyzes qualitative feedback from reviews to detect potential bias.
    -   `suggest-promotions()`: AI identifies high-potential employees who may be ready for a promotion based on performance data and feedback.

### **Module 7: Learning & Development (L&D)**

-   **Course Marketplace**: Integration with L&D platforms like Udemy and Coursera.
-   **Certification Tracking**: Track employee certifications and receive automatic alerts for renewals.
-   **AI-Powered Skill Recommendations**: The system suggests relevant courses to employees based on their role, skill gaps, and career goals.

### **Module 8: Employee Engagement & Support**

-   **Pulse Surveys**: Regularly send out short surveys to gauge employee sentiment, with AI-powered analysis of the results.
-   **Kudos & Rewards**: A gamified system for employees to give "kudos" to peers, which can be redeemed for rewards.
-   **Social Feed**: A company-wide feed for announcements, birthdays, work anniversaries, and other social updates.
-   **AI Chatbot**: A 24/7 HR assistant (`ai-chatbot` flow) that can answer employee questions about company policies, benefits, and procedures.
-   **Ticketing System**: A centralized helpdesk for employees to raise tickets for IT, HR, or Finance support, with SLA tracking.
-   **AI-Enhanced Welfare**:
    -   `predict-burnout()`: AI alerts managers when an employee's activity patterns suggest a high risk of burnout.

---

## **4. How the AI Works (Genkit)**

All AI functionalities are powered by **Genkit**, an open-source framework for building robust, production-grade AI applications.

-   **Centralized Logic**: All AI logic is located in the `src/ai/` directory.
-   **Flows**: Each AI feature is implemented as a Genkit "flow" (e.g., `src/ai/flows/score-and-parse-resume.ts`). A flow is a server-side TypeScript function that orchestrates calls to AI models (like Gemini), data processing, and other business logic.
-   **Structured I/O with Zod**: We use **Zod** to define strict, type-safe input and output schemas for every flow. The prompt sent to the LLM includes instructions to format its response as JSON that matches the output Zod schema. This ensures predictable and reliable data exchange with the AI.
-   **Model Interaction**: Flows use Genkit's `ai.generate()` or `ai.definePrompt()` methods to interact with the configured Gemini model. The prompts are carefully crafted to provide the model with the necessary context, instructions, and desired output format.
-   **Frontend Integration**: The Genkit flows are securely exposed to the Next.js frontend using **Server Actions**. This allows client components to call these powerful server-side AI functions as if they were simple async functions, without the need to build and manage traditional REST API endpoints.
