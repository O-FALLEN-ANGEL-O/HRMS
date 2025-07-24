# OptiTalent HRMS: A Next-Generation AI-Powered HR Platform

OptiTalent is a comprehensive, AI-enhanced Human Resource Management System (HRMS) built with a modern tech stack. It's designed to streamline every aspect of the employee lifecycle, from recruitment and onboarding to performance management and payroll, leveraging the power of Google's Gemini models through the Genkit framework.

This is a frontend prototype designed to showcase a full range of HRMS features with mocked data and simulated AI interactions.

## Core Technologies

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (with Google Gemini)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)

---

## Features Overview

OptiTalent provides a role-based experience, offering different tools and views for various user types like Admin, HR, Manager, Recruiter, Employee, and more specialized roles.

### 1. **Role-Based Dashboards**
- **Personalized KPIs**: Each role has a unique dashboard with Key Performance Indicators (KPIs) relevant to their function.
- **Quick Actions**: Easy access to common tasks.
- **At-a-glance Information**: Widgets for celebrations, company feed, team leave, and more.

### 2. **AI-Powered Recruitment**
- **Resume Parsing & Scoring**: (`score-and-parse-resume` flow) Upload a resume (PDF, DOCX, or image) and have the AI extract structured data (contact info, skills, experience, education) and score it against a job description.
- **AI-Suggested Interview Questions**: (`suggest-interview-questions` flow) Based on the job title from a parsed resume, the AI generates a list of relevant interview questions.
- **Walk-in Drive Management**: A public-facing portal for walk-in candidates to register. The registration form also uses the AI resume parser to pre-fill candidate details.

### 3. **Streamlined Onboarding**
- **AI Welcome Email Generation**: (`auto-generate-welcome-email` flow) HR professionals can input new hire details, and the AI generates a personalized and professional welcome email, including subject and body.

### 4. **Intelligent Performance Management**
- **AI Performance Review Generation**: (`generate-performance-review` flow) Managers can input an employee's goals, achievements, and areas for improvement to have the AI draft a comprehensive and constructive performance review summary, along with a suggested performance rating.

### 5. **Automated Payroll**
- **AI Payroll Error Detection**: (`detect-payroll-errors` flow) Finance professionals can paste payroll data in JSON format, and the AI will audit it, flagging potential errors like negative salaries, unusual bonuses, or deviations from historical data.

### 6. **Efficient Leave Management**
- **Leave Application & Approval**: Standard workflow for applying for, approving, or rejecting leave requests.
- **Balance Tracking**: Automated tracking of leave balances (Sick, Casual, PTO).
- **Team Calendar View**: A visual representation of team absences for better resource planning.

### 7. **Smart Helpdesk**
- **AI Ticket Categorization**: (`categorize-ticket` flow) When a user submits a helpdesk ticket, the AI analyzes the subject and description to automatically assign a category (e.g., IT Support, HR Query) and a priority (High, Medium, Low).
- **Conversational Interface**: A real-time chat interface for viewing tickets and interacting with support.

### 8. **AI Tools & Assistance**
- **AI HR Chatbot**: (`ai-chatbot` flow) An assistant available to all employees to answer questions about company policies, benefits, and other HR-related topics. It maintains conversation history for context.
- **AI-Powered Role Assignment**: (`auto-assign-roles` flow) When adding a new employee, the system can suggest an appropriate user role based on their department and job title.

### 9. **Walk-in Drive & Assessment Portal**
- **Public Registration**: A dedicated flow for walk-in candidates to register for hiring events.
- **Applicant Dashboard**: Once registered, candidates get a temporary login to their own dashboard where they can update their profile and take assigned tests.
- **Online Assessments**: A proctored testing environment (simulated) for various assessments like MCQs and typing tests.
- **Retry & Approval Workflow**: A system for candidates to request a test retry and for HR to approve or deny it.

### 10. **Attendance & Security**
- **AI Face Verification**: (`verify-face` flow) For clocking in and out, the system simulates facial recognition by comparing a live camera capture with the user's stored profile picture, returning a match decision and confidence score.

---

## How the AI Works (Genkit)

All AI functionalities are powered by **Genkit**, an open-source framework for building AI-powered applications.

- **Location**: AI logic is centralized in the `src/ai/` directory.
- **Flows**: Each AI feature is implemented as a Genkit "flow" (e.g., `src/ai/flows/score-and-parse-resume.ts`). A flow is a server-side function that orchestrates AI model calls and other logic.
- **Structured I/O**: We use **Zod** to define strict input and output schemas for each flow. This ensures that the data sent to and received from the AI model is predictable and type-safe. The model is instructed to return JSON matching the Zod schema.
- **Model Interaction**: Flows use the `ai.generate()` or `ai.definePrompt()` methods from Genkit to interact with the configured Gemini model. The prompts are crafted to instruct the model on its task and the expected output format.
- **Server Actions**: The Genkit flows are exposed to the Next.js frontend via Server Actions, allowing client components to securely call these server-side AI functions without needing to create explicit API endpoints.

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v20 or later)
- [npm](https://www.npmjs.com/) or a compatible package manager
- [Supabase](https://supabase.com/) account for the database

### 2. Environment Setup

1.  **Clone the repository.**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Supabase:**
    - Create a new project on Supabase.
    - In your Supabase project, go to the **SQL Editor**.
    - Copy the entire content of `src/lib/supabase/schema.sql` and run it. This will create all the necessary tables, roles, policies, and seed data.
4.  **Configure Environment Variables:**
    - Rename the `src/.env.local.example` file to `src/.env.local`.
    - Go to your Supabase project's **Settings > API**.
    - Find your **Project URL** and **anon public key**.
    - Find your **Service Role** key (choose the `service_role` secret).
    - Paste these values into the `src/.env.local` file.
    - You will also need a **Google AI (Gemini) API Key**. Get one from [Google AI Studio](https://aistudio.google.com/app/apikey) and add it to `src/.env.local`.

### 3. Running the Application

- **Start the development server:**
  ```bash
  npm run dev
  ```
- **Access the application:**
  Open [http://localhost:9002](http://localhost:9002) in your browser.

- **(Optional) Run the Genkit developer UI:**
  To inspect your AI flows, view traces, and debug prompts, you can run the Genkit UI in a separate terminal:
  ```bash
  npm run genkit:watch
  ```
  This will start the UI, typically on [http://localhost:4000](http://localhost:4000).

### 4. Seeding the Database

If you want to reset your database with fresh, randomized data at any time, run the seeding script:

```bash
npm run db:seed
```

**Warning**: This is a destructive operation and will erase all existing data in your public tables before re-populating them.
