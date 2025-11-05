const db = {
  roles: [
    { id: 1, name: 'super_admin' },
    { id: 2, name: 'manager' },
    { id: 3, name: 'employee' }
  ],

  users: [
    {
      id: 1,
      username: 'rajesh',
      email: 'rajesh@alveon.com',
      first_name: 'Rajesh',
      last_name: 'Kumar',
      employment_role: 'super_admin',
      roles: ['super_admin'],
      department: 'HR',
      organization: 'Alveon HQ',
      is_verified: true
    },
    
    {
      id: 3,
      username: 'akshay',
      email: 'akshay@alveon.com',
      first_name: 'Akshay',
      last_name: 'Kumar',
      employment_role: 'manager',
      roles: ['manager'],
      department: 'Engineering',
      organization: 'Alveon',
      is_verified: true
    },
    {
      id: 4,
      username: 'vinay',
      email: 'vinay@alveon.com',
      first_name: 'Vinay',
      last_name: 'Kumar',
      employment_role: 'employee',
      roles: ['employee'],
      department: 'Engineering',
      organization: 'Alveon',
      is_verified: true
    }
  ],

  skills: [
    { id: 1, name: 'Python', description: 'Proficient in Python programming' },
    { id: 2, name: 'SQL', description: 'Database querying and optimization' },
    { id: 3, name: 'Leadership', description: 'Team leadership and mentoring' }
  ],

  user_skills: [
    { user_id: 3, skill_id: 3, proficiency: 5, years_experience: 7 },
    { user_id: 4, skill_id: 1, proficiency: 4, years_experience: 3 },
    { user_id: 4, skill_id: 2, proficiency: 3, years_experience: 2 }
  ],

  leave_requests: [
    {
      id: 201,
      user_id: 4,
      approver_id: 3,
      leave_type: 'Sick Leave',
      start_date: '2025-11-05',
      end_date: '2025-11-07',
      reason: 'Fever and cold',
      status: 'pending'
    },
    {
      id: 202,
      user_id: 4,
      approver_id: 3,
      leave_type: 'Casual Leave',
      start_date: '2025-10-01',
      end_date: '2025-10-03',
      reason: 'Family function',
      status: 'approved'
    }
  ],

  notifications: [
    { id: 1, user_id: 4, category: 'HR', title: 'Leave approved', message: 'Your leave has been approved' },
    { id: 2, user_id: 3, category: 'General', title: 'Team Meeting', message: 'Meeting scheduled for Friday' }
  ],

  team_events: [
    {
      id: 1,
      title: 'Monthly Sync',
      description: 'Engineering team monthly catch-up',
      start_datetime: '2025-11-10T10:00:00',
      end_datetime: '2025-11-10T11:00:00',
      team_number: 'ENG-05',
      location: 'Conference Room B',
      created_by_id: 3
    }
  ],

  hr_knowledge: [
    {
      id: 1,
      question: 'What is the maximum number of casual leaves per year?',
      answer: 'Employees can avail up to 12 casual leaves per year.',
      source: 'HR Policy Document'
    },
    {
      id: 2,
      question: 'How to apply for work from home?',
      answer: 'Submit a WFH request via the HR portal.',
      source: 'Internal Wiki'
    }
  ],

  project_announcements: [
    {
      id: 1,
      manager_id: 3,
      title: 'Q4 Product Launch',
      description: 'All teams to prepare release notes and presentations by 25th November.'
    }
  ],

  conversations: [
    {
      id: 1,
      user_id: 4,
      title: 'Leave Policy Clarification',
      started_at: '2025-11-05T08:30:00',
      metadata_json: '{"topic": "leave"}'
    }
  ],

  messages: [
    { id: 1, conversation_id: 1, sender: 'user', content: 'How many sick leaves are allowed?' },
    { id: 2, conversation_id: 1, sender: 'assistant', content: 'You can take up to 10 sick leaves per year.' }
  ],

  education: [
    { id: 1, user_id: 4, institution: 'IIT Delhi', degree: 'B.Tech', field_of_study: 'Computer Science' },
    { id: 2, user_id: 3, institution: 'IIM Bangalore', degree: 'MBA', field_of_study: 'Operations' }
  ],

  experience: [
    { id: 1, user_id: 3, company: 'TechCorp', role: 'Engineering Manager', start_date: '2020-01-01' },
    { id: 2, user_id: 4, company: 'TechCorp', role: 'Software Engineer', start_date: '2023-06-01' }
  ]
}

export default db
