# Social Tab Implementation Plan

## Goal Description
Make the Social tab functional, secure, and real-time. Ensure comprehensive data cleanup when a user is deleted. Add user management capabilities for Institute Admins.

## User Review Required
> [!IMPORTANT]
> **Action Required**: 
> 1. Run `supabase_social.sql` (if you haven't already).
> 2. Run `absolute_fix_constraints.sql` (fixes User -> Data links).
> 3. Run `absolute_fix_notes_references.sql` (fixes Note -> Likes links).
> 4. Run `fix_trigger_logic.sql` (fixes "Unlike" trigger crash).
> 5. Run `create_storage_cleanup_function.sql` (workaround for storage permissions).

## Proposed Changes

### Database
#### [MODIFY] [supabase_social.sql](file:///e:/Sujal/NeuroNxt/Versions/v20/supabase_social.sql)
- Defines `profiles` and `connections` tables.
- Enforces `account_status` and strict connection policies.
- Enables Realtime.

#### [NEW] [absolute_fix_constraints.sql](file:///e:/Sujal/NeuroNxt/Versions/v20/absolute_fix_constraints.sql)
- Fixes foreign keys for `notes`, `likes`, `views`, etc. referencing `auth.users`.

#### [NEW] [absolute_fix_notes_references.sql](file:///e:/Sujal/NeuroNxt/Versions/v20/absolute_fix_notes_references.sql)
- Fixes foreign keys for `likes`, `views`, etc. referencing `notes`.

#### [NEW] [fix_trigger_logic.sql](file:///e:/Sujal/NeuroNxt/Versions/v20/fix_trigger_logic.sql)
- Updates `handle_unlike` trigger to check if note exists before updating.

#### [NEW] [create_storage_cleanup_function.sql](file:///e:/Sujal/NeuroNxt/Versions/v20/create_storage_cleanup_function.sql)
- Creates `delete_user_files` function to manually clean up storage objects.

### App
#### [MODIFY] [app/social/page.tsx](file:///e:/Sujal/NeuroNxt/Versions/v20/app/social/page.tsx)
- Implements social features with real-time updates.

#### [MODIFY] [lib/actions/admin.ts](file:///e:/Sujal/NeuroNxt/Versions/v20/lib/actions/admin.ts)
- **[MODIFY]** Implemented "Nuclear Delete" strategy: explicitly deletes files, likes, views, saves, completions, connections, profile, and notes before deleting the user.

#### [NEW] [app/admin/dashboard/delete-user-button.tsx](file:///e:/Sujal/NeuroNxt/Versions/v20/app/admin/dashboard/delete-user-button.tsx)
- Created `DeleteUserButton` component.

#### [MODIFY] [app/admin/dashboard/page.tsx](file:///e:/Sujal/NeuroNxt/Versions/v20/app/admin/dashboard/page.tsx)
- Added `DeleteUserButton` to lists.
- Updated filtering to only show students with **confirmed emails**.

## Verification Plan

### Manual Verification
1.  **Run SQL Scripts**: Ensure all 5 fix scripts have been run.
2.  **Test Admin Delete**:
    *   Delete any student (even with complex data).
    *   Verify success via the UI.
