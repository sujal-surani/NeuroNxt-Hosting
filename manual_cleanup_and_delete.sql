-- MANUAL CLEANUP AND DELETE
-- Replace ID with failing user ID: b61210d0-2eac-44d2-98a5-a2cf60c519ed
DO $$
DECLARE
    target_user_id uuid := 'b61210d0-2eac-44d2-98a5-a2cf60c519ed';
BEGIN
    RAISE NOTICE 'Starting manual cleanup for user %', target_user_id;

    -- 1. Delete Likes (User's likes on other notes)
    DELETE FROM public.note_likes WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted likes';

    -- 2. Delete Views (User's views on other notes)
    DELETE FROM public.note_views WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted views';

    -- 3. Delete Saves
    DELETE FROM public.note_saves WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted saves';

    -- 4. Delete Completions
    DELETE FROM public.note_completions WHERE user_id = target_user_id;
    RAISE NOTICE 'Deleted completions';

    -- 5. Delete Notes (User's own notes)
    -- This should cascade to delete likes/views ON these notes
    DELETE FROM public.notes WHERE author_id = target_user_id;
    RAISE NOTICE 'Deleted notes';

    -- 6. Delete Connections (User's friends)
    DELETE FROM public.connections WHERE requester_id = target_user_id OR recipient_id = target_user_id;
    RAISE NOTICE 'Deleted connections';

    -- 7. Delete Profile
    DELETE FROM public.profiles WHERE id = target_user_id;
    RAISE NOTICE 'Deleted profile';

    -- 8. Delete User
    DELETE FROM auth.users WHERE id = target_user_id;
    RAISE NOTICE 'Deleted user successfully!';
END $$;
