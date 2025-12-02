-- Allow authenticated users to insert jobs
CREATE POLICY "Authenticated users can insert jobs"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update jobs (e.g. on conflict upsert)
CREATE POLICY "Authenticated users can update jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING (true);
