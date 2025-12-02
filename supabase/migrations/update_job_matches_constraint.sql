-- Drop the existing unique constraint
ALTER TABLE public.job_matches
DROP CONSTRAINT IF EXISTS job_matches_user_id_job_id_key;

-- Add a new unique constraint that includes search_id
-- We treat NULL search_id as a distinct value (though in our new flow it should always be present)
-- However, standard SQL unique constraints treat NULLs as distinct.
-- To ensure we can have multiple matches for the same job in different searches:
CREATE UNIQUE INDEX job_matches_user_job_search_idx ON public.job_matches (user_id, job_id, search_id);

-- Alternatively, if we want to enforce uniqueness only when search_id is NOT NULL,
-- but here we want (user, job, search) to be unique.
-- If search_id is NULL, we might have issues with multiple NULLs depending on DB, but for now we always pass searchId.
