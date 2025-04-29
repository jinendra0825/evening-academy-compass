
-- Create table for notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  recipientIds UUID[] DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  type TEXT NOT NULL DEFAULT 'announcement',
  course_id UUID REFERENCES public.courses(id)
);

-- Add policies to ensure users only see relevant notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Anyone can view notifications
CREATE POLICY "Allow teachers to view course notifications"
  ON public.notifications
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT teacher_id FROM public.courses WHERE id = notifications.course_id
    )
    OR 
    auth.uid() = ANY(recipientIds)
  );

-- Only teachers can create notifications
CREATE POLICY "Allow teachers to insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT teacher_id FROM public.courses WHERE id = notifications.course_id
    )
  );

-- Only teachers can update notifications
CREATE POLICY "Allow teachers to update notifications"
  ON public.notifications
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT teacher_id FROM public.courses WHERE id = notifications.course_id
    )
  );
