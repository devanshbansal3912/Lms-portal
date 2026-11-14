-- ==============================================================================
-- Supabase PostgreSQL Seed Data: Student 3 Sample Data
-- Topic: Operating Systems - Unit 4: Deadlocks & Process Synchronization
-- ==============================================================================

-- 1. Insert a demo document record
INSERT INTO public.documents (
    id,
    user_id,
    filename,
    storage_path,
    dify_document_id,
    status,
    file_size_bytes,
    mime_type
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Operating_Systems_Deadlocks_Unit4.pdf',
    'documents/11111111-1111-1111-1111-111111111111/Operating_Systems_Deadlocks_Unit4.pdf',
    'dify-doc-deadlocks-os-demo-001',
    'READY',
    2048576,
    'application/pdf'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert a demo generated quiz
INSERT INTO public.quizzes (
    id,
    user_id,
    document_id,
    title,
    topic,
    total_questions,
    difficulty
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Operating Systems - Deadlocks & Resource Allocation',
    'Deadlocks',
    5,
    'medium'
) ON CONFLICT (id) DO NOTHING;

-- 3. Insert 5 high-quality MCQs for the quiz
INSERT INTO public.quiz_questions (
    id,
    quiz_id,
    question,
    options,
    correct_answer,
    explanation
) VALUES 
(
    '33333333-3333-3333-3333-333333330001',
    '22222222-2222-2222-2222-222222222222',
    'Which of the following is NOT one of Coffman''s four necessary conditions for deadlock to occur?',
    '["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"]'::jsonb,
    2,
    'The four necessary conditions for deadlock are: 1. Mutual Exclusion, 2. Hold and Wait, 3. No Preemption (resources cannot be preempted), and 4. Circular Wait. "Preemption Allowed" actually prevents deadlocks.'
),
(
    '33333333-3333-3333-3333-333333330002',
    '22222222-2222-2222-2222-222222222222',
    'Which algorithm is used in Operating Systems to avoid deadlocks by ensuring the system remains in a safe state?',
    '["Round Robin Algorithm", "Banker''s Algorithm", "Dijkstra''s Shortest Path", "First-Come First-Served"]'::jsonb,
    1,
    'The Banker''s Algorithm is a deadlock avoidance algorithm developed by Edsger Dijkstra. It tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources before deciding whether allocation should be allowed.'
),
(
    '33333333-3333-3333-3333-333333330003',
    '22222222-2222-2222-2222-222222222222',
    'In a Resource Allocation Graph (RAG), if the graph contains a cycle and each resource type has only one single instance, then:',
    '["Deadlock might occur, but it is not guaranteed", "A deadlock definitely exists", "The system is in a safe state", "Starvation will occur instead of deadlock"]'::jsonb,
    1,
    'In a single-instance resource system, a cycle in the Resource Allocation Graph is both a necessary AND sufficient condition for deadlock. Thus, a deadlock definitely exists.'
),
(
    '33333333-3333-3333-3333-333333330004',
    '22222222-2222-2222-2222-222222222222',
    'What is the fundamental difference between Deadlock Prevention and Deadlock Avoidance?',
    '["Prevention eliminates one of the 4 conditions; Avoidance uses dynamic state tracking like Banker''s algorithm", "Prevention is dynamic while Avoidance is static", "Prevention uses recovery while Avoidance uses ignoring", "There is no difference between them"]'::jsonb,
    0,
    'Deadlock Prevention works by imposing static constraints that ensure at least one of Coffman''s four conditions cannot hold. Deadlock Avoidance dynamically inspects resource allocation state to ensure circular wait can never occur.'
),
(
    '33333333-3333-3333-3333-333333330005',
    '22222222-2222-2222-2222-222222222222',
    'The "Ostrich Algorithm" in handling deadlocks refers to:',
    '["Terminating all running processes immediately", "Rebooting the server every hour", "Sticking your head in the sand and ignoring the problem because it occurs rarely", "Rollback of the most recent transaction"]'::jsonb,
    2,
    'The Ostrich Algorithm is a strategy of ignoring the potential problem on the assumption that deadlocks occur very rarely and the cost of prevention or avoidance is higher than the consequence of an occasional reboot (commonly used in general-purpose OSes like Unix and Windows).'
)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert an initial quiz attempt
INSERT INTO public.quiz_attempts (
    id,
    quiz_id,
    user_id,
    score,
    total_questions,
    answers
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    4,
    5,
    '{"33333333-3333-3333-3333-333333330001": 2, "33333333-3333-3333-3333-333333330002": 1, "33333333-3333-3333-3333-333333330003": 1, "33333333-3333-3333-3333-333333330004": 0, "33333333-3333-3333-3333-333333330005": 1}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 5. Insert demo flashcards
INSERT INTO public.flashcards (
    id,
    user_id,
    document_id,
    topic,
    front,
    back,
    status
) VALUES 
(
    '55555555-5555-5555-5555-555555550001',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Deadlocks',
    'What is the definition of a Deadlock in an Operating System?',
    'A permanent state where two or more processes are unable to proceed because each is waiting for a resource held by another process in the set.',
    'KNOWN'
),
(
    '55555555-5555-5555-5555-555555550002',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Deadlocks',
    'List Coffman''s 4 Necessary Conditions for Deadlock.',
    '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
    'KNOWN'
),
(
    '55555555-5555-5555-5555-555555550003',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Deadlocks',
    'How can the Circular Wait condition be prevented programmatically?',
    'Impose a total global ordering of all resource types and require that each process requests resources only in strictly increasing numerical order of enumeration.',
    'NEED_REVISION'
),
(
    '55555555-5555-5555-5555-555555550004',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Deadlocks',
    'What constitutes a "Safe State" in the Banker''s Algorithm?',
    'A state where there exists a safe sequence <P1, P2, ... Pn> such that for each Pi, the resources Pi can still request can be satisfied by currently available resources plus resources held by all Pj (j < i).',
    'NEW'
),
(
    '55555555-5555-5555-5555-555555550005',
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    'Deadlocks',
    'What are the two primary approaches for Deadlock Recovery?',
    '1. Process Termination (abort all deadlocked processes, or abort one at a time until cycle is broken).\n2. Resource Preemption (successively preempt resources from processes until deadlock cycle is broken).',
    'NEW'
)
ON CONFLICT (id) DO NOTHING;
