
INSERT INTO users (id, email, password_hash, role) 
VALUES ('11111111-1111-1111-1111-111111111111', 'student@university.edu', 'fake_hashed_pass', 'student');

INSERT INTO profiles (user_id, full_name, bio, skills) 
VALUES ('11111111-1111-1111-1111-111111111111', 'Leo The Student', 'Computer Engineering student looking for a mentor.', ARRAY['Java', 'React', 'C++']);

INSERT INTO users (id, email, password_hash, role) 
VALUES ('22222222-2222-2222-2222-222222222222', 'alumni@techcorp.com', 'fake_hashed_pass', 'alumni');

INSERT INTO profiles (user_id, full_name, company, job_title, skills) 
VALUES ('22222222-2222-2222-2222-222222222222', 'Jane Smith', 'Tech Corp', 'Senior Backend Engineer', ARRAY['PostgreSQL', 'Node.js', 'System Design']);
