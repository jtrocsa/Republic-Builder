// Copy this file to quest-backend.config.js and keep real values out of public commits.
// For GitHub Pages, the Supabase anon key may be present in the client ONLY when RLS is enabled.
// Never put a Supabase service-role key in this file.

export const QUEST_BACKEND_CONFIG = {
  mode: 'mock', // 'mock' for local demo, 'supabase' for real multi-user persistence
  supabaseUrl: '',
  supabaseAnonKey: '',
  defaultCourseSlug: 'atlantic-crossroads-apush',
  demoTeacherId: 'demo-teacher',
  demoStudentId: 'demo-student-aria',
  demoClassId: 'demo-period-3',
};
