// High quality realistic mock data for Operating Systems & Computer Science
// Used for local testing and as an emergency fallback when Dify or Colab is offline.

export const MOCK_DOCUMENTS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    userId: '11111111-1111-1111-1111-111111111111',
    filename: 'Operating_Systems_Deadlocks_Unit4.pdf',
    storagePath: 'documents/sample/Operating_Systems_Deadlocks_Unit4.pdf',
    difyDocumentId: 'dify-doc-deadlocks-os-demo-001',
    status: 'READY' as const,
    fileSizeBytes: 2048576,
    mimeType: 'application/pdf',
    createdAt: new Date().toISOString(),
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    userId: '11111111-1111-1111-1111-111111111111',
    filename: 'Database_Management_Systems_Transactions.pdf',
    storagePath: 'documents/sample/Database_Management_Systems_Transactions.pdf',
    difyDocumentId: 'dify-doc-dbms-transactions-demo-002',
    status: 'READY' as const,
    fileSizeBytes: 1542310,
    mimeType: 'application/pdf',
    createdAt: new Date().toISOString(),
  },
];

export const MOCK_QUIZ_OS_DEADLOCKS = {
  title: 'Operating Systems - Deadlocks & Resource Allocation',
  questions: [
    {
      id: 'mock-q-1',
      question: 'Which of the following is NOT one of Coffman\'s four necessary conditions for deadlock to occur?',
      options: [
        'Mutual Exclusion',
        'Hold and Wait',
        'Preemption Allowed',
        'Circular Wait',
      ],
      correctAnswer: 2,
      explanation: 'The four necessary conditions for deadlock are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If preemption is allowed, deadlock cannot occur.',
    },
    {
      id: 'mock-q-2',
      question: 'Which algorithm is used in Operating Systems to avoid deadlocks by ensuring the system remains in a safe state?',
      options: [
        'Round Robin Algorithm',
        'Banker\'s Algorithm',
        'Dijkstra\'s Shortest Path',
        'First-Come First-Served',
      ],
      correctAnswer: 1,
      explanation: 'The Banker\'s Algorithm tests for safety by simulating resource allocation for maximum possible amounts before granting any request.',
    },
    {
      id: 'mock-q-3',
      question: 'In a Resource Allocation Graph (RAG), if the graph contains a cycle and each resource type has only one single instance, then:',
      options: [
        'Deadlock might occur, but it is not guaranteed',
        'A deadlock definitely exists',
        'The system is in a safe state',
        'Starvation will occur instead of deadlock',
      ],
      correctAnswer: 1,
      explanation: 'In a single-instance resource system, a cycle in the Resource Allocation Graph is both a necessary and sufficient condition for deadlock.',
    },
    {
      id: 'mock-q-4',
      question: 'What is the fundamental difference between Deadlock Prevention and Deadlock Avoidance?',
      options: [
        'Prevention eliminates one of the 4 conditions; Avoidance uses dynamic state tracking like Banker\'s algorithm',
        'Prevention is dynamic while Avoidance is static',
        'Prevention uses recovery while Avoidance uses ignoring',
        'There is no difference between them',
      ],
      correctAnswer: 0,
      explanation: 'Deadlock Prevention statically restrains how requests can be made, whereas Deadlock Avoidance dynamically inspects state to ensure circular wait never occurs.',
    },
    {
      id: 'mock-q-5',
      question: 'The "Ostrich Algorithm" in handling deadlocks refers to:',
      options: [
        'Terminating all running processes immediately',
        'Rebooting the server every hour',
        'Sticking your head in the sand and ignoring the problem because it occurs rarely',
        'Rollback of the most recent transaction',
      ],
      correctAnswer: 2,
      explanation: 'The Ostrich Algorithm ignores the problem on the assumption that deadlocks occur rarely and prevention is overly expensive (used in modern general OSes).',
    },
  ],
};

export const MOCK_FLASHCARDS_OS_DEADLOCKS = [
  {
    id: 'mock-fc-1',
    userId: '11111111-1111-1111-1111-111111111111',
    documentId: '00000000-0000-0000-0000-000000000001',
    topic: 'Deadlocks',
    front: 'What is the formal definition of a Deadlock in an Operating System?',
    back: 'A permanent situation where a set of processes are blocked because each process holds a resource and waits for another resource held by another process in the same set.',
    status: 'KNOWN' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-fc-2',
    userId: '11111111-1111-1111-1111-111111111111',
    documentId: '00000000-0000-0000-0000-000000000001',
    topic: 'Deadlocks',
    front: 'State the four Coffman conditions necessary for Deadlock.',
    back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait (All 4 must hold simultaneously).',
    status: 'KNOWN' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-fc-3',
    userId: '11111111-1111-1111-1111-111111111111',
    documentId: '00000000-0000-0000-0000-000000000001',
    topic: 'Deadlocks',
    front: 'How can the "Circular Wait" condition be prevented in software design?',
    back: 'Define a linear ordering on all resources (R1, R2, ... Rn). Require that processes request resources only in strictly increasing order of enumeration.',
    status: 'NEED_REVISION' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-fc-4',
    userId: '11111111-1111-1111-1111-111111111111',
    documentId: '00000000-0000-0000-0000-000000000001',
    topic: 'Deadlocks',
    front: 'What constitutes a "Safe State" in the Banker\'s Algorithm?',
    back: 'A system state where there exists a sequence <P1, P2, ... Pn> such that each process can satisfy its maximum claims using currently free resources plus resources freed by previously finished processes.',
    status: 'NEW' as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-fc-5',
    userId: '11111111-1111-1111-1111-111111111111',
    documentId: '00000000-0000-0000-0000-000000000001',
    topic: 'Deadlocks',
    front: 'Explain the difference between Starvation and Deadlock.',
    back: 'Deadlock: Processes are stuck in a circular dependency forever.\nStarvation (Livelock/Indefinite postponement): Resources are available and work is happening, but a particular process is perpetually denied access due to priority or scheduling bias.',
    status: 'NEW' as const,
    createdAt: new Date().toISOString(),
  },
];
