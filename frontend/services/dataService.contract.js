/**
 * Application data contract.
 * All UI code must use these methods instead of querying storage/database directly.
 *
 * The implementation can be MockDataService for local demos or SupabaseDataService
 * for real teacher/student use.
 */

export class DataServiceContract {
  async getCurrentSession() { throw new Error('Not implemented'); }
  async signIn({ email, password }) { throw new Error('Not implemented'); }
  async signOut() { throw new Error('Not implemented'); }

  // Student experience
  async getStudentClasses() { throw new Error('Not implemented'); }
  async getStudentQuestFeed({ classId }) { throw new Error('Not implemented'); }
  async ensureStudentQuestAssignment({ classId, questId }) { throw new Error('Not implemented'); }
  async getStudentQuestContent({ assignmentId }) { throw new Error('Not implemented'); }
  async saveStudentDraft({ assignmentId, answers }) { throw new Error('Not implemented'); }
  async submitStudentWork({ assignmentId, answers }) { throw new Error('Not implemented'); }
  async getStudentProgress({ classId, studentId }) { throw new Error('Not implemented'); }

  // Teacher command center
  async getTeacherDashboard({ courseId, classId }) { throw new Error('Not implemented'); }
  async getTeacherClasses() { throw new Error('Not implemented'); }
  async getTeacherRoster({ classId }) { throw new Error('Not implemented'); }
  async createClass(payload) { throw new Error('Not implemented'); }
  async importRoster({ classId, students }) { throw new Error('Not implemented'); }

  // Quest studio
  async getTeacherUnits({ courseId }) { throw new Error('Not implemented'); }
  async getTeacherQuest({ questId }) { throw new Error('Not implemented'); }
  async saveQuestDraft({ questId, content, metadata, changeNote }) { throw new Error('Not implemented'); }
  async publishQuestVersion({ questId, versionId, changeNote }) { throw new Error('Not implemented'); }
  async getQuestVersionHistory({ questId }) { throw new Error('Not implemented'); }
  async duplicateQuest({ questId, unitId }) { throw new Error('Not implemented'); }
  async archiveQuest({ questId }) { throw new Error('Not implemented'); }

  // Locks, access rules, and unit releases
  async getQuestAccessRules({ questId }) { throw new Error('Not implemented'); }
  async saveQuestAccessRule({ questId, classId, rule }) { throw new Error('Not implemented'); }
  async saveStudentQuestOverride({ questId, classId, studentId, override }) { throw new Error('Not implemented'); }
  async bulkSetQuestAccess({ questIds, classIds, accessMode, unlockAt, lockAt, visibleBeforeUnlock }) { throw new Error('Not implemented'); }
  async setUnitState({ unitId, state, classIds, unlockAt, priorUnitAction }) { throw new Error('Not implemented'); }

  // Submission archive and grading
  async getSubmissions(filters) { throw new Error('Not implemented'); }
  async getSubmissionForGrading({ submissionId }) { throw new Error('Not implemented'); }
  async saveRubricScores({ submissionId, scores, overallFeedback, status }) { throw new Error('Not implemented'); }
  async returnSubmissionToStudent({ submissionId, overallFeedback }) { throw new Error('Not implemented'); }
  async requestRevision({ submissionId, feedback, reopenQuestionIds }) { throw new Error('Not implemented'); }
  async reopenSubmission({ submissionId }) { throw new Error('Not implemented'); }

  // Analytics, announcements, export
  async getHistorianAnalytics({ classId, unitId }) { throw new Error('Not implemented'); }
  async createAnnouncement(payload) { throw new Error('Not implemented'); }
  async exportGradesCsv({ classId, unitId }) { throw new Error('Not implemented'); }
}
