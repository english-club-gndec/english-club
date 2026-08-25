-- Migration SQL: Enable Row Level Security (RLS) on public tables reported by Supabase Advisor

-- 1. Enable RLS on submissions table
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select approved submissions" ON public.submissions FOR SELECT USING (status = 'APPROVED');
CREATE POLICY "Allow service role full access to submissions" ON public.submissions FOR ALL USING (true);

-- 2. Enable RLS on audit_log table
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role full access to audit_log" ON public.audit_log FOR ALL USING (true);

-- 3. Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role full access to users" ON public.users FOR ALL USING (true);

-- 4. Enable RLS on recruitment_questions table
ALTER TABLE public.recruitment_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public select active recruitment_questions" ON public.recruitment_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Allow service role full access to recruitment_questions" ON public.recruitment_questions FOR ALL USING (true);
