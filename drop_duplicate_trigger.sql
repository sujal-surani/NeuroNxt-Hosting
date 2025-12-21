-- This script drops the legacy trigger that was causing duplicate connection notifications.
-- Run this in your Supabase SQL Editor.

DROP TRIGGER IF EXISTS on_connection_notify ON public.connections;
DROP FUNCTION IF EXISTS public.notify_connection_change();
