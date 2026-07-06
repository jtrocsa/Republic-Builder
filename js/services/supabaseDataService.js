import { DataServiceContract } from './dataService.contract.js';

/**
 * Placeholder adapter for future Supabase integration.
 * TODO: initialize Supabase client in this class once project credentials exist.
 * TODO: map each method to RLS-safe table queries or RPC calls from database/*.sql.
 * TODO: enforce teacher/student authorization through Auth + profiles.role.
 */
export class SupabaseDataService extends DataServiceContract {
  constructor() {
    super();
    // TODO: Accept and store a Supabase client instance.
  }

  async _todo(name) {
    throw new Error(`Supabase adapter method not implemented yet: ${name}`);
  }

  async getCurrentSession() { return this._todo('getCurrentSession'); }
  async signInDemoTeacher() { return this._todo('signInDemoTeacher'); }
  async signOut() { return this._todo('signOut'); }

  async getTeacherClasses() { return this._todo('getTeacherClasses'); }
  async getTeacherDashboard() { return this._todo('getTeacherDashboard'); }
  async getTeacherUnits() { return this._todo('getTeacherUnits'); }
  async setUnitState() { return this._todo('setUnitState'); }
  async advanceUnit() { return this._todo('advanceUnit'); }

  async getTeacherQuestStudio() { return this._todo('getTeacherQuestStudio'); }
  async getTeacherQuest() { return this._todo('getTeacherQuest'); }
  async saveQuestDraft() { return this._todo('saveQuestDraft'); }
  async publishQuestVersion() { return this._todo('publishQuestVersion'); }
  async duplicateQuest() { return this._todo('duplicateQuest'); }
  async archiveQuest() { return this._todo('archiveQuest'); }
  async restoreQuestVersion() { return this._todo('restoreQuestVersion'); }
  async getQuestVersionHistory() { return this._todo('getQuestVersionHistory'); }

  async getQuestAccessRules() { return this._todo('getQuestAccessRules'); }
  async saveQuestAccessRule() { return this._todo('saveQuestAccessRule'); }
  async saveStudentQuestOverride() { return this._todo('saveStudentQuestOverride'); }
  async bulkSetQuestAccess() { return this._todo('bulkSetQuestAccess'); }

  async getRoster() { return this._todo('getRoster'); }
  async addStudent() { return this._todo('addStudent'); }
  async updateStudent() { return this._todo('updateStudent'); }
  async removeStudent() { return this._todo('removeStudent'); }
  async importRosterCsvDemo() { return this._todo('importRosterCsvDemo'); }
  async getStudentDetail() { return this._todo('getStudentDetail'); }

  async getSubmissions() { return this._todo('getSubmissions'); }
  async getSubmissionForGrading() { return this._todo('getSubmissionForGrading'); }
  async saveRubricScores() { return this._todo('saveRubricScores'); }
  async returnSubmissionToStudent() { return this._todo('returnSubmissionToStudent'); }
  async requestRevision() { return this._todo('requestRevision'); }
  async reopenSubmission() { return this._todo('reopenSubmission'); }

  async getHistorianAnalytics() { return this._todo('getHistorianAnalytics'); }
  async createAnnouncement() { return this._todo('createAnnouncement'); }
  async listAnnouncements() { return this._todo('listAnnouncements'); }
  async exportGradesCsv() { return this._todo('exportGradesCsv'); }

  async resetDemoData() { return this._todo('resetDemoData'); }
}
