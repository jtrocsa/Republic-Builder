import { DataServiceContract } from './dataService.contract.js';

/**
 * Supabase adapter. Keep UI code out of this file; it only maps application calls to
 * authenticated database/RPC calls. The project may use an ESM CDN or installed package
 * to create the `supabase` client before constructing this class.
 */
export class SupabaseDataService extends DataServiceContract {
  constructor(supabase) {
    super();
    if (!supabase) throw new Error('Supabase client is required.');
    this.supabase = supabase;
  }

  async _unwrap(request) {
    const { data, error } = await request;
    if (error) throw error;
    return data;
  }

  async getCurrentSession() {
    const { data: sessionData, error } = await this.supabase.auth.getSession();
    if (error) throw error;
    const user = sessionData.session?.user ?? null;
    if (!user) return { user: null, mode: 'supabase' };
    const profile = await this._unwrap(this.supabase.from('profiles').select('*').eq('id', user.id).single());
    return { user: profile, authUser: user, mode: 'supabase' };
  }

  async signIn({ email, password }) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getStudentClasses() {
    return this._unwrap(this.supabase.from('classes').select('id, name, period_label, course_id, active_unit_id'));
  }

  async getStudentQuestFeed({ classId }) {
    return this._unwrap(this.supabase.rpc('get_student_quest_feed', { p_class_id: classId }));
  }

  async ensureStudentQuestAssignment({ classId, questId }) {
    return this._unwrap(this.supabase.rpc('ensure_student_quest_assignment', { p_class_id: classId, p_quest_id: questId }));
  }

  async getStudentQuestContent({ assignmentId }) {
    return this._unwrap(this.supabase.rpc('get_student_quest_content', { p_assignment_id: assignmentId }));
  }

  async saveStudentDraft({ assignmentId, answers }) {
    const session = await this.getCurrentSession();
    const assignment = await this._unwrap(this.supabase.from('student_quest_assignments').select('*').eq('id', assignmentId).single());
    const existing = await this._unwrap(this.supabase.from('submissions').select('*').eq('assignment_id', assignmentId).eq('status', 'draft').maybeSingle());
    const payload = {
      assignment_id: assignmentId,
      student_id: session.user.id,
      class_id: assignment.class_id,
      quest_id: assignment.quest_id,
      quest_version_id: assignment.quest_version_id,
      answers_json: answers,
      status: 'draft',
    };
    if (existing) return this._unwrap(this.supabase.from('submissions').update(payload).eq('id', existing.id).select().single());
    return this._unwrap(this.supabase.from('submissions').insert(payload).select().single());
  }

  async submitStudentWork({ assignmentId, answers }) {
    const draft = await this.saveStudentDraft({ assignmentId, answers });
    const submission = await this._unwrap(this.supabase.from('submissions').update({ status: 'submitted', submitted_at: new Date().toISOString() }).eq('id', draft.id).select().single());
    await this._unwrap(this.supabase.from('student_quest_assignments').update({ status: 'submitted' }).eq('id', assignmentId));
    return submission;
  }

  async getTeacherClasses() {
    return this._unwrap(this.supabase.from('classes').select('*, courses(*)').order('period_label'));
  }

  async getTeacherDashboard({ courseId, classId }) {
    // Keep aggregation light in the client initially; move to a view/RPC later if data volume grows.
    const classes = await this._unwrap(this.supabase.from('classes').select('*').eq('course_id', courseId));
    const selected = classId ? classes.filter((item) => item.id === classId) : classes;
    const classIds = selected.map((item) => item.id);
    const submissions = classIds.length
      ? await this._unwrap(this.supabase.from('submissions').select('*').in('class_id', classIds).order('submitted_at', { ascending: false }).limit(25))
      : [];
    return { classes: selected, recentSubmissions: submissions, counts: {
      submitted: submissions.filter((item) => item.status === 'submitted').length,
      ungraded: submissions.filter((item) => ['submitted', 'grading'].includes(item.status)).length,
      graded: submissions.filter((item) => item.status === 'graded').length,
    } };
  }

  async getTeacherRoster({ classId }) {
    return this._unwrap(this.supabase
      .from('class_members')
      .select('class_id, student_id, profiles!class_members_student_id_fkey(id, display_name, student_identifier, avatar_key)')
      .eq('class_id', classId));
  }

  async getTeacherUnits({ courseId }) {
    return this._unwrap(this.supabase.from('units').select('*').eq('course_id', courseId).order('order_index'));
  }

  async getTeacherQuest({ questId }) {
    const quest = await this._unwrap(this.supabase.from('quests').select('*').eq('id', questId).single());
    const versions = await this._unwrap(this.supabase.from('quest_versions').select('*').eq('quest_id', questId).order('version_number', { ascending: false }));
    return { quest, versions, draft: versions.find((item) => item.id === quest.current_draft_version_id), published: versions.find((item) => item.id === quest.published_version_id) };
  }

  async saveQuestDraft({ questId, content, metadata = {}, changeNote = '' }) {
    const quest = await this._unwrap(this.supabase.from('quests').select('id, current_draft_version_id').eq('id', questId).single());
    const versions = await this._unwrap(this.supabase.from('quest_versions').select('version_number').eq('quest_id', questId).order('version_number', { ascending: false }).limit(1));
    const session = await this.getCurrentSession();
    const nextVersion = (versions[0]?.version_number ?? 0) + 1;
    const version = await this._unwrap(this.supabase.from('quest_versions').insert({
      quest_id: questId, version_number: nextVersion, state: 'draft', content_json: content,
      created_by: session.user.id, change_note: changeNote,
    }).select().single());
    await this._unwrap(this.supabase.from('quests').update({ ...metadata, current_draft_version_id: version.id }).eq('id', questId));
    return version;
  }

  async publishQuestVersion({ questId, versionId, changeNote = '' }) {
    return this._unwrap(this.supabase.rpc('publish_quest_version', { p_quest_id: questId, p_version_id: versionId, p_change_note: changeNote }));
  }

  async getQuestVersionHistory({ questId }) {
    return this._unwrap(this.supabase.from('quest_versions').select('*').eq('quest_id', questId).order('version_number', { ascending: false }));
  }

  async getQuestAccessRules({ questId }) {
    return this._unwrap(this.supabase.from('quest_access_rules').select('*').eq('quest_id', questId));
  }

  async saveQuestAccessRule({ questId, classId, rule }) {
    const session = await this.getCurrentSession();
    const payload = {
      quest_id: questId,
      class_id: classId,
      access_mode: rule.accessMode,
      visible_before_unlock: rule.visibleBeforeUnlock ?? true,
      unlock_at: rule.unlockAt ?? null,
      lock_at: rule.lockAt ?? null,
      allow_submission: rule.allowSubmission ?? null,
      note_to_student: rule.noteToStudent ?? null,
      created_by: session.user.id,
    };
    return this._unwrap(this.supabase.from('quest_access_rules').upsert(payload, { onConflict: 'quest_id,class_id' }).select().single());
  }

  async saveStudentQuestOverride({ questId, classId, studentId, override }) {
    const existing = await this._unwrap(this.supabase
      .from('student_quest_assignments')
      .select('*')
      .eq('quest_id', questId).eq('class_id', classId).eq('student_id', studentId)
      .maybeSingle());
    if (!existing) throw new Error('Create a student assignment before applying an individual override, or add a teacher-side RPC that creates one safely.');
    return this._unwrap(this.supabase.from('student_quest_assignments').update({
      access_override: override.accessOverride ?? null,
      override_unlock_at: override.overrideUnlockAt ?? null,
      override_lock_at: override.overrideLockAt ?? null,
      allow_submission_override: override.allowSubmissionOverride ?? null,
      override_note: override.overrideNote ?? null,
    }).eq('id', existing.id).select().single());
  }

  async bulkSetQuestAccess({ questIds, classIds, accessMode, unlockAt = null, lockAt = null, visibleBeforeUnlock = true }) {
    const jobs = [];
    for (const questId of questIds) {
      for (const classId of classIds) jobs.push(this.saveQuestAccessRule({ questId, classId, rule: { accessMode, unlockAt, lockAt, visibleBeforeUnlock } }));
    }
    return Promise.all(jobs);
  }

  async getSubmissions(filters = {}) {
    let query = this.supabase
      .from('submissions')
      .select('*, profiles!submissions_student_id_fkey(id, display_name, student_identifier, avatar_key), classes(id, name, period_label), quests(id, title, quest_type)')
      .order('submitted_at', { ascending: false });
    if (filters.classId) query = query.eq('class_id', filters.classId);
    if (filters.questId) query = query.eq('quest_id', filters.questId);
    if (filters.studentId) query = query.eq('student_id', filters.studentId);
    if (filters.status) query = query.eq('status', filters.status);
    return this._unwrap(query);
  }

  async getSubmissionForGrading({ submissionId }) {
    const submission = await this._unwrap(this.supabase.from('submissions').select('*').eq('id', submissionId).single());
    const [assignment, version, scores, student] = await Promise.all([
      this._unwrap(this.supabase.from('student_quest_assignments').select('*').eq('id', submission.assignment_id).single()),
      this._unwrap(this.supabase.from('quest_versions').select('*').eq('id', submission.quest_version_id).single()),
      this._unwrap(this.supabase.from('rubric_scores').select('*').eq('submission_id', submissionId)),
      this._unwrap(this.supabase.from('profiles').select('*').eq('id', submission.student_id).single()),
    ]);
    return { submission, assignment, version, content: version.content_json, rubricScores: scores, student };
  }

  async saveRubricScores({ submissionId, scores, overallFeedback = '', status = 'grading' }) {
    await this._unwrap(this.supabase.from('rubric_scores').delete().eq('submission_id', submissionId));
    if (scores.length) await this._unwrap(this.supabase.from('rubric_scores').insert(scores.map((score) => ({
      submission_id: submissionId,
      criterion_key: score.criterionKey,
      points_earned: score.pointsEarned,
      max_points: score.maxPoints,
      feedback: score.feedback ?? '',
      is_visible_to_student: status === 'graded',
    }))));
    return this._unwrap(this.supabase.from('submissions').update({ status, overall_feedback: overallFeedback, graded_at: status === 'graded' ? new Date().toISOString() : null }).eq('id', submissionId).select().single());
  }

  async returnSubmissionToStudent({ submissionId, overallFeedback = '' }) {
    await this._unwrap(this.supabase.from('rubric_scores').update({ is_visible_to_student: true }).eq('submission_id', submissionId));
    return this._unwrap(this.supabase.from('submissions').update({ status: 'graded', overall_feedback: overallFeedback, returned_at: new Date().toISOString(), graded_at: new Date().toISOString() }).eq('id', submissionId).select().single());
  }

  async requestRevision({ submissionId, feedback, reopenQuestionIds = [] }) {
    return this._unwrap(this.supabase.from('submissions').update({
      status: 'revision_requested',
      overall_feedback: feedback,
      reopen_question_ids: reopenQuestionIds,
    }).eq('id', submissionId).select().single());
  }

  async reopenSubmission({ submissionId }) {
    return this._unwrap(this.supabase.from('submissions').update({ status: 'draft' }).eq('id', submissionId).select().single());
  }

  async setUnitState({ unitId, state }) {
    return this._unwrap(this.supabase.from('units').update({ state }).eq('id', unitId).select().single());
  }

  async getHistorianAnalytics({ classId, unitId = null }) {
    const submissions = await this.getSubmissions({ classId });
    const filtered = unitId ? submissions.filter((item) => item.quests?.unit_id === unitId) : submissions;
    return {
      totalSubmissions: filtered.length,
      ungraded: filtered.filter((item) => ['submitted', 'grading'].includes(item.status)).length,
      graded: filtered.filter((item) => item.status === 'graded').length,
      averageScore: filtered.length ? filtered.reduce((sum, item) => sum + Number(item.score ?? 0), 0) / filtered.length : 0,
    };
  }
}
