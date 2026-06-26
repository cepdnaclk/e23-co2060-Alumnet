-- ============================================================================
-- ALUMNET MASTER DEMO SEED DATA
-- Universal Login Password for all accounts: Password123!
-- Bcrypt Hash: $2a$10$wK1Wwz8R8ZzGqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EO
-- ============================================================================

-- 1. CLEANUP EXISTING DEMO DATA (In relational order)
TRUNCATE TABLE public.notifications, public.messages, public.conversations, 
               public.event_registrations, public.events, public.mentorship_requests, 
               public.student_profiles, public.alumni_profiles, public.users CASCADE;

-- 2. INSERT MASTER USERS
INSERT INTO public.users (id, full_name, email, password_hash, role, verification_status, avatar_url) VALUES
(1, 'Dr. Aruna Perera', 'admin@alumnet.edu', '$2a$10$wK1Wwz8R8ZzGqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EO', 'university_admin', 'verified', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
(2, 'System Architect', 'sysadmin@alumnet.edu', '$2a$10$wK1Wwz8R8ZzGqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EO', 'system_admin', 'verified', NULL),
(3, 'Kasun Silva', 'kasun.alumni@gmail.com', '$2a$10$wK1Wwz8R8ZzGqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EO', 'alumni', 'verified', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
(4, 'Nimesha Jayasuriya', 'nimesha.alumni@ws02.com', '$2a$10$wK1Wwz8R8ZzGqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EO', 'alumni', 'verified', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(5, 'Dinesh Fernando', 'dinesh.pending@gmail.com', '$2a$10$wK1Wwz8R8ZzGqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EO', 'alumni', 'pending', NULL),
(6, 'Ruwanthi Bandara', 'ruwanthi.student@eng.pdn.ac.lk', '$2a$10$wK1Wwz8R8ZzGqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EO', 'student', 'verified', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(7, 'Lahiru De Silva', 'lahiru.student@sci.pdn.ac.lk', '$2a$10$wK1Wwz8R8ZzGqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EOqXvJ3Y5.EO', 'student', 'verified', NULL);

-- 3. INSERT ALUMNI PROFILES
INSERT INTO public.alumni_profiles (user_id, department, job_title, organization, graduation_year, linkedin_url, primary_interests, preferred_mentee_capacity, bio) VALUES
(3, 'Computer Engineering', 'Senior Backend Lead', 'WSO2', 2018, 'https://linkedin.com/in/kasun-silva', 'Distributed Systems, Cloud Architecture, Node.js', 2, 'Passionate about mentoring undergrads in high-load backend engineering and database design.'),
(4, 'Electrical & Electronic Engineering', 'AI Research Scientist', 'Sysco LABS', 2020, 'https://linkedin.com/in/nimesha-j', 'Machine Learning, Neural Networks, Python', 1, 'Working on enterprise AI models. Happy to guide 1 dedicated student.'),
(5, 'Civil Engineering', 'Structural Engineer', 'MAGA Engineering', 2015, NULL, 'Structural Analysis, AutoCAD', 3, 'Pending verification account.');

-- 4. INSERT STUDENT PROFILES
INSERT INTO public.student_profiles (user_id, department, batch, areas_of_interest, bio, motivation, goal, github_url) VALUES
(6, 'Computer Engineering', 'E23', 'Full-stack Dev, Supabase, React', 'Undergrad building academic tools.', 'Want to learn industry-standard cloud networking.', 'Become a Cloud Solution Architect.', 'https://github.com/ruwanthi'),
(7, 'Physical Sciences', 'S22', 'Data Science, Algorithms', 'Math major transitioning to tech.', 'Need guidance on structuring enterprise software.', 'Secure a Data Engineering internship.', NULL);

-- 5. INSERT EVENTS
INSERT INTO public.events (id, title, event_date, event_time, venue, description, available_slots, created_by, approval_status) VALUES
(1, 'Industry Cloud Topology & WebSockets', '2026-07-15', '14:00:00', 'LT-1, Faculty of Engineering', 'Deep dive into connection pooling and real-time database broadcasting.', 50, 3, 'approved'),
(2, 'AI Career Pathways Workshop', '2026-08-01', '10:00:00', 'Virtual (Zoom)', 'How to transition from academic ML to production grade engineering.', 30, 4, 'approved'),
(3, 'Civil Engineering Site Management', '2026-08-20', '09:00:00', 'Auditorium', 'Proposed guest lecture on site logistics.', 100, 5, 'pending');

-- 6. INSERT EVENT REGISTRATIONS
INSERT INTO public.event_registrations (event_id, student_user_id) VALUES
(1, 6),
(1, 7),
(2, 6);

-- 7. INSERT MENTORSHIP REQUESTS
-- Note: Nimesha (ID 4) has capacity 1, and 1 accepted request. She is officially FULL!
INSERT INTO public.mentorship_requests (id, student_user_id, alumni_user_id, message, status) VALUES
(1, 6, 3, 'Hi Kasun! I saw your work on backend architecture. Would love your mentorship on my web project.', 'accepted'),
(2, 7, 4, 'Hello Nimesha, I am really interested in AI research. Could you guide me?', 'accepted'),
(3, 7, 3, 'Hi Kasun, looking for guidance on database schema optimization.', 'pending');

-- 8. INSERT CONVERSATIONS & MESSAGES
INSERT INTO public.conversations (id, mentorship_request_id, student_user_id, alumni_user_id) VALUES
(1, 1, 6, 3);

INSERT INTO public.messages (conversation_id, sender_id, message_text, is_read) VALUES
(1, 6, 'Hi Kasun, thanks for accepting my request! I was having some ETIMEDOUT issues with Postgres earlier.', true),
(1, 3, 'Ah, you were probably hitting the direct port 5432 over an IPv4 router. Switch your connection pool to port 6543!', false);

-- 9. INSERT REAL-TIME NOTIFICATIONS
INSERT INTO public.notifications (user_id, title, message, type, is_read) VALUES
(6, 'Mentorship Accepted!', 'An alumni (Kasun Silva) has accepted your mentorship request. You can now chat with them!', 'REQUEST_UPDATE', false),
(3, 'New Mentorship Request', 'A student (Lahiru De Silva) has requested you as a mentor.', 'MENTOR_REQUEST', false),
(1, 'Pending Event Approval', 'A new event "Civil Engineering Site Management" requires administrative review.', 'EVENT_UPDATE', false);

-- Reset sequence generators so future UI inserts don't crash with duplicate ID keys
SELECT pg_catalog.setval('public.users_id_seq', (SELECT MAX(id) FROM public.users), true);
SELECT pg_catalog.setval('public.events_id_seq', (SELECT MAX(id) FROM public.events), true);
SELECT pg_catalog.setval('public.mentorship_requests_id_seq', (SELECT MAX(id) FROM public.mentorship_requests), true);
SELECT pg_catalog.setval('public.conversations_id_seq', (SELECT MAX(id) FROM public.conversations), true);