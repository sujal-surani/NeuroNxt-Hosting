-- DEBUG NOTES TRIGGER V3 (SELECT QUERY)
-- usage: Run this query to see specific match details

WITH 
stats AS (
    SELECT 
        (SELECT count(*) FROM profiles WHERE role = 'student') as student_count,
        (SELECT count(*) FROM notes) as note_count
),
sample_student AS (
    SELECT id as s_id, institute_code as s_inst, branch as s_branch, semester as s_sem
    FROM profiles 
    WHERE role = 'student' 
    LIMIT 1
),
sample_note AS (
    SELECT n.id as n_id, n.institute_code as n_inst, n.branch as n_branch, n.semester as n_sem, n.author_id,
           p.institute_code as author_inst
    FROM notes n
    LEFT JOIN profiles p ON p.id = n.author_id
    ORDER BY n.id DESC
    LIMIT 1
)
SELECT 
    stats.student_count,
    stats.note_count,
    
    -- Student Data
    s.s_inst as student_institute,
    s.s_branch as student_branch,
    s.s_sem as student_semester,
    
    -- Note Data
    n.n_inst as note_institute,
    n.author_inst as author_institute,
    n.n_branch as note_branch,
    n.n_sem as note_semester,
    
    -- Match Logic Checks
    (s.s_inst = n.author_inst) as match_institute,
    (n.n_branch = 'all' OR lower(s.s_branch) = lower(n.n_branch)) as match_branch,
    (s.s_sem ILIKE '%Semester ' || n.n_sem) as match_semester,
    
    -- Final Trigger Decision (Expected)
    (
        (s.s_inst = n.author_inst) AND 
        (n.n_branch = 'all' OR lower(s.s_branch) = lower(n.n_branch)) AND 
        (s.s_sem ILIKE '%Semester ' || n.n_sem)
    ) as SHOULD_NOTIFY
    
FROM stats
LEFT JOIN sample_student s ON true
LEFT JOIN sample_note n ON true;
