export type Question = {
    id: string;
    section_id: string;
    type: 'mcq' | 'typing' | 'audio' | 'voice_input' | 'video_input';
    question_text: string;
    options?: string[];
    correct_answer?: string;
    audio_prompt?: string;
    language?: 'english' | 'kannada' | 'hindi';
  };
  
  export type AssessmentSection = {
    id: string;
    assessment_id: string;
    section_type: 'mcq' | 'typing' | 'audio' | 'voice_input' | 'video_input';
    title: string;
    time_limit: number; // in minutes
    questions: Question[];
  };
  
  export type Assessment = {
    id: string;
    title: string;
    role: string;
    process_type: 'Chat Support' | 'Voice Process – English' | 'Voice Process – Kannada' | 'Technical Support' | 'IT / Developer Role';
    sections: AssessmentSection[];
    duration: number; // total duration in minutes
    passing_score: number; // percentage
    created_by: string;
  };
  
  
  export const assessments: Assessment[] = [
    {
      id: 'asmt-001',
      title: 'Customer Support Aptitude Test',
      role: 'employee',
      process_type: 'Chat Support',
      duration: 30,
      passing_score: 75,
      created_by: 'admin-user-1',
      sections: [
        {
          id: 'sec-01',
          assessment_id: 'asmt-001',
          section_type: 'mcq',
          title: 'Situational Judgement',
          time_limit: 15,
          questions: [
            {
              id: 'q-001',
              section_id: 'sec-01',
              type: 'mcq',
              question_text: 'A customer is angry about a late delivery. What is the FIRST step you should take?',
              options: [
                'Offer a refund immediately.',
                'Apologize for the inconvenience and listen to their concerns.',
                'Explain why the delivery was late.',
                'Transfer the call to a manager.',
              ],
              correct_answer: 'Apologize for the inconvenience and listen to their concerns.',
              language: 'english',
            },
            {
              id: 'q-002',
              section_id: 'sec-01',
              type: 'mcq',
              question_text: 'What does CRM stand for?',
              options: [
                'Customer Relationship Management',
                'Customer Retention Module',
                'Company Resource Management',
                'Client Response Machine',
              ],
              correct_answer: 'Customer Relationship Management',
              language: 'english',
            },
          ],
        },
        {
          id: 'sec-02',
          assessment_id: 'asmt-001',
          section_type: 'mcq',
          title: 'Company Policy',
          time_limit: 15,
          questions: [
            {
                id: 'q-003',
                section_id: 'sec-02',
                type: 'mcq',
                question_text: 'What is the standard response time for a new support ticket?',
                options: [
                  'Within 1 hour',
                  'Within 4 hours',
                  'Within 24 hours',
                  'Within 48 hours',
                ],
                correct_answer: 'Within 4 hours',
                language: 'english',
              },
          ]
        }
      ],
    },
    {
        id: 'asmt-002',
        title: 'Technical Support (Level 1)',
        role: 'employee',
        process_type: 'Technical Support',
        duration: 45,
        passing_score: 80,
        created_by: 'admin-user-1',
        sections: [
          {
            id: 'sec-03',
            assessment_id: 'asmt-002',
            section_type: 'mcq',
            title: 'Basic Networking',
            time_limit: 20,
            questions: [
              {
                id: 'q-004',
                section_id: 'sec-03',
                type: 'mcq',
                question_text: 'What is a DHCP server used for?',
                options: [
                  'To resolve domain names to IP addresses.',
                  'To automatically assign IP addresses to devices on a network.',
                  'To block unauthorized access to a network.',
                  'To store website files.',
                ],
                correct_answer: 'To automatically assign IP addresses to devices on a network.',
                language: 'english',
              }
            ]
          }
        ]
      },
      {
        id: 'asmt-003',
        title: 'Voice Assessment (English)',
        role: 'employee',
        process_type: 'Voice Process – English',
        duration: 15,
        passing_score: 70,
        created_by: 'admin-user-1',
        sections: [] // To be built out with voice/audio questions
      }
  ];
  
  
  