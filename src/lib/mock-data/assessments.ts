
export type SimulationDetails = {
  scenario: string;
  issue: string;
  chat_log: { from: 'customer' | 'agent', text: string }[];
};

export type Question = {
    id: string;
    section_id: string;
    type: 'mcq' | 'typing' | 'audio' | 'voice_input' | 'video_input' | 'simulation';
    question_text: string;
    options?: string[];
    correct_answer?: string;
    audio_prompt?: string;
    language?: 'english' | 'kannada' | 'hindi';
    typing_prompt?: string;
    simulation_details?: SimulationDetails;
  };
  
  export type AssessmentSection = {
    id: string;
    assessment_id: string;
    section_type: 'mcq' | 'typing' | 'audio' | 'voice_input' | 'video_input' | 'simulation';
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
    passing_score: number;
    passing_score_type: 'percent' | 'wpm';
    max_attempts: number;
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
      passing_score_type: 'percent',
      max_attempts: 1,
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
        max_attempts: 1,
        passing_score_type: 'percent',
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
        max_attempts: 1,
        passing_score_type: 'percent',
        created_by: 'admin-user-1',
        sections: [] // To be built out with voice/audio questions
      },
      {
        id: 'asmt-004',
        title: 'Typing Skill Test',
        role: 'employee',
        process_type: 'Chat Support',
        duration: 5,
        passing_score: 50,
        max_attempts: 1,
        passing_score_type: 'wpm',
        created_by: 'admin-user-1',
        sections: [
            {
                id: 'sec-04',
                assessment_id: 'asmt-004',
                section_type: 'typing',
                title: 'Typing Speed and Accuracy',
                time_limit: 5,
                questions: [
                    {
                        id: 'q-005',
                        section_id: 'sec-04',
                        type: 'typing',
                        question_text: 'Please type the following paragraph.',
                        typing_prompt: 'The quick brown fox jumps over the lazy dog. This sentence contains all the letters of the alphabet, making it a perfect pangram for testing typing speed and accuracy. Fast, accurate typing is a critical skill for any professional in a digital-first world. Practice regularly to improve your words per minute and reduce errors. Focus on maintaining a steady rhythm and correct finger placement on the keyboard. Good luck!'
                    }
                ]
            }
        ]
      },
      {
        id: 'asmt-005',
        title: 'Typing Test (1 Minute)',
        role: 'employee',
        process_type: 'Chat Support',
        duration: 1,
        passing_score: 40,
        max_attempts: 3,
        passing_score_type: 'wpm',
        created_by: 'admin-user-1',
        sections: [
            {
                id: 'sec-05',
                assessment_id: 'asmt-005',
                section_type: 'typing',
                title: 'Typing Speed and Accuracy',
                time_limit: 1,
                questions: [
                    {
                        id: 'q-006',
                        section_id: 'sec-05',
                        type: 'typing',
                        question_text: 'Please type the following text.',
                        typing_prompt: 'Effective customer service is the cornerstone of a successful business. It requires patience, empathy, and clear communication. Resolving issues promptly and accurately builds trust and loyalty, turning a negative experience into a positive one. Every interaction is an opportunity to strengthen the customer relationship and uphold the company\'s reputation. Efficiency and a friendly demeanor go hand in hand.'
                    }
                ]
            }
        ]
      },
       {
        id: 'asmt-006',
        title: 'Web Hosting Support Simulation',
        role: 'trainee',
        process_type: 'Technical Support',
        duration: 20,
        passing_score: 80,
        max_attempts: 1,
        passing_score_type: 'percent',
        created_by: 'admin-user-1',
        sections: [
            {
                id: 'sec-06',
                assessment_id: 'asmt-006',
                section_type: 'simulation',
                title: 'Live Chat Simulation',
                time_limit: 20,
                questions: [
                    {
                        id: 'q-007',
                        section_id: 'sec-06',
                        type: 'simulation',
                        question_text: 'Engage with the customer to resolve their issue.',
                        simulation_details: {
                            scenario: "A customer is experiencing an issue where their website is suddenly down. They are a small business owner and are losing sales. Your task is to diagnose and resolve the issue through chat.",
                            issue: "DNS Misconfiguration",
                            chat_log: [
                                { from: 'customer', text: "HELP! My website is down! I'm getting a 'This site can’t be reached' error. I haven't changed anything. This is costing me money every minute. Please fix this ASAP!" },
                                { from: 'agent', text: "I understand how critical this is for your business, and I'm here to help you get this resolved right away. Could you please provide me with your domain name?" }
                            ]
                        }
                    }
                ]
            }
        ]
      }
  ];
  
  
  
