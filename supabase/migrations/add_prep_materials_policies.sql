-- Allow users to insert prep materials for their own interviews
CREATE POLICY "Users can insert own prep materials"
ON public.prep_materials
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.interviews
    WHERE id = prep_materials.interview_id
    AND user_id = auth.uid()
  )
);

-- Allow users to update prep materials for their own interviews
CREATE POLICY "Users can update own prep materials"
ON public.prep_materials
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.interviews
    WHERE id = prep_materials.interview_id
    AND user_id = auth.uid()
  )
);

-- Allow users to delete prep materials for their own interviews
CREATE POLICY "Users can delete own prep materials"
ON public.prep_materials
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.interviews
    WHERE id = prep_materials.interview_id
    AND user_id = auth.uid()
  )
);
