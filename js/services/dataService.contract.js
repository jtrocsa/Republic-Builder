export class DataServiceContract {
  async getCurrentSession() { throw new Error('Not implemented'); }
  async signInDemoTeacher() { throw new Error('Not implemented'); }
  async signOut() { throw new Error('Not implemented'); }

  async getTeacherClasses() { throw new Error('Not implemented'); }
  async getTeacherDashboard({ classId }) { throw new Error('Not implemented'); }
  async getTeacherUnits() { throw new Error('Not implemented'); }
  async setUnitState(payload) { throw new Error('Not implemented'); }
  async advanceUnit(payload) { throw new Error('Not implemented'); }

  async getTeacherQuestStudio({ classId }) { throw new Error('Not implemented'); }
  async getTeacherQuest({ questId }) { throw new Error('Not implemented'); }
  async createQuestFromTemplate(payload) { throw new Error('Not implemented'); }
  async saveQuestDraft(payload) { throw new Error('Not implemented'); }
  async publishQuestVersion(payload) { throw new Error('Not implemented'); }
  async duplicateQuest(payload) { throw new Error('Not implemented'); }
  async archiveQuest(payload) { throw new Error('Not implemented'); }
  async restoreQuestVersion(payload) { throw new Error('Not implemented'); }
  async getQuestVersionHistory({ questId }) { throw new Error('Not implemented'); }

  async getQuestAccessRules({ questId, classId }) { throw new Error('Not implemented'); }
  async saveQuestAccessRule(payload) { throw new Error('Not implemented'); }
  async saveStudentQuestOverride(payload) { throw new Error('Not implemented'); }
  async bulkSetQuestAccess(payload) { throw new Error('Not implemented'); }

  async getRoster({ classId }) { throw new Error('Not implemented'); }
  async addStudent(payload) { throw new Error('Not implemented'); }
  async updateStudent(payload) { throw new Error('Not implemented'); }
  async removeStudent(payload) { throw new Error('Not implemented'); }
  async importRosterCsvDemo(payload) { throw new Error('Not implemented'); }
  async getStudentDetail(payload) { throw new Error('Not implemented'); }

  async getSubmissions(filters) { throw new Error('Not implemented'); }
  async getSubmissionForGrading({ submissionId }) { throw new Error('Not implemented'); }
  async saveRubricScores(payload) { throw new Error('Not implemented'); }
  async returnSubmissionToStudent(payload) { throw new Error('Not implemented'); }
  async requestRevision(payload) { throw new Error('Not implemented'); }
  async reopenSubmission(payload) { throw new Error('Not implemented'); }

  async getHistorianAnalytics(payload) { throw new Error('Not implemented'); }
  async createAnnouncement(payload) { throw new Error('Not implemented'); }
  async listAnnouncements(payload) { throw new Error('Not implemented'); }
  async exportGradesCsv(payload) { throw new Error('Not implemented'); }

  async resetDemoData() { throw new Error('Not implemented'); }
}
