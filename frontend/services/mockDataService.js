import { DataServiceContract } from './dataService.contract.js';
import { QUEST_ACCESS_MODES } from '../utils/accessRules.js';

const STORAGE_KEY = 'republic-builder-teacher-backend-v1';

function nowIso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function seed() {
  const bossContent = {
    schemaVersion: 1,
    identity: {
      title: "Empire's Reckoning",
      subtitle: 'Unit 1 Writing Boss',
      questType: 'boss_battle',
      xpReward: 100,
      location: 'Atlantic Ocean',
      mapMarker: { x: 51, y: 34, icon: 'boss', label: "Empire's Reckoning" },
    },
    presentation: {
      heroKicker: 'SAQ SKIRMISH · OFFICIAL AP RUBRIC',
      heroDescription: 'Face the Unit 1 writing boss: analyze evidence, construct an argument, and score it with the AP rubrics.',
      theme: 'boss-battle',
    },
    sources: [{
      id: 'source-columbus-1493',
      title: 'Christopher Columbus, letter describing his first voyage, 1493',
      citation: 'Christopher Columbus, 1493',
      body: '“Their Highnesses may see that I shall give them as much gold as they need … and spices and cotton.”',
      imageUrl: null,
      altText: '',
    }],
    assessments: [{
      id: 'saq', label: 'SAQ Skirmish', maxPoints: 3,
      instructions: 'Use the excerpt below and your knowledge of United States history to answer all parts of the question.',
      responseSettings: { autosave: true, allowResubmit: false },
      questions: [
        { id: 'part-a', label: 'A', maxPoints: 1, prompt: 'Briefly describe ONE motive for European exploration in the Americas that is reflected in the excerpt.', placeholder: 'Respond directly, with specific historical evidence.' },
        { id: 'part-b', label: 'B', maxPoints: 1, prompt: 'Briefly explain ONE way the Columbian Exchange changed Indigenous societies in the Americas between 1492 and 1607.', placeholder: 'Respond directly, with specific historical evidence.' },
        { id: 'part-c', label: 'C', maxPoints: 1, prompt: 'Briefly explain ONE additional development related to Atlantic exploration and colonization.', placeholder: 'Respond directly, with specific historical evidence.' },
      ],
    }],
    rubrics: {},
    rewards: { xp: 100, items: [], historianSkillAwards: [] },
  };

  return {
    profiles: [
      { id: 'demo-teacher', role: 'teacher', displayName: 'Teacher' },
      { id: 'demo-student-aria', role: 'student', displayName: 'Aria', studentIdentifier: 'A-001', avatarKey: 'aria' },
      { id: 'demo-student-jordan', role: 'student', displayName: 'Jordan Lee', studentIdentifier: 'A-002', avatarKey: 'jordan' },
    ],
    session: { userId: 'demo-teacher' },
    courses: [{ id: 'demo-course', title: 'Atlantic Crossroads APUSH', slug: 'atlantic-crossroads-apush', ownerId: 'demo-teacher', activeUnitId: 'unit-1' }],
    classes: [{ id: 'demo-period-3', courseId: 'demo-course', teacherId: 'demo-teacher', name: 'APUSH', periodLabel: 'Period 3', joinCode: 'ATLAS3', activeUnitId: 'unit-1' }],
    classMembers: [
      { classId: 'demo-period-3', studentId: 'demo-student-aria' },
      { classId: 'demo-period-3', studentId: 'demo-student-jordan' },
    ],
    units: [{ id: 'unit-1', courseId: 'demo-course', orderIndex: 1, title: 'Unit 1 Expedition', state: 'active', defaultAccessMode: 'available' }],
    quests: [{ id: 'quest-empires-reckoning', unitId: 'unit-1', slug: 'empires-reckoning', questType: 'boss_battle', title: "Empire's Reckoning", locationKey: 'atlantic-ocean', xpReward: 100, defaultAccessMode: 'available', publishedVersionId: 'quest-version-1', currentDraftVersionId: 'quest-version-1' }],
    questVersions: [{ id: 'quest-version-1', questId: 'quest-empires-reckoning', versionNumber: 1, state: 'published', content: bossContent, createdBy: 'demo-teacher', createdAt: nowIso() }],
    assignments: [],
    submissions: [],
    rubricScores: [],
    accessRules: [],
  };
}

function readStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const value = seed();
    writeStore(value);
    return value;
  }
  return JSON.parse(raw);
}

function writeStore(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function id(prefix) {
  return `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

export class MockDataService extends DataServiceContract {
  async getCurrentSession() {
    const db = readStore();
    const profile = db.profiles.find((item) => item.id === db.session?.userId) ?? null;
    return profile ? { user: clone(profile), mode: 'mock' } : { user: null, mode: 'mock' };
  }

  async signIn({ email }) {
    const db = readStore();
    const profile = email?.toLowerCase().includes('student')
      ? db.profiles.find((item) => item.role === 'student')
      : db.profiles.find((item) => item.role === 'teacher');
    db.session = { userId: profile.id };
    writeStore(db);
    return { user: clone(profile), mode: 'mock' };
  }

  async signOut() {
    const db = readStore();
    db.session = null;
    writeStore(db);
  }

  async getTeacherClasses() {
    const db = readStore();
    const session = await this.getCurrentSession();
    return clone(db.classes.filter((item) => item.teacherId === session.user?.id));
  }

  async getStudentClasses() {
    const db = readStore();
    const session = await this.getCurrentSession();
    const ids = db.classMembers.filter((item) => item.studentId === session.user?.id).map((item) => item.classId);
    return clone(db.classes.filter((item) => ids.includes(item.id)));
  }

  _currentProfile(db) {
    return db.profiles.find((item) => item.id === db.session?.userId);
  }

  _effectiveAccess(db, { quest, classId, studentId }) {
    const assignment = db.assignments.find((item) => item.questId === quest.id && item.classId === classId && item.studentId === studentId);
    const rule = db.accessRules.find((item) => item.questId === quest.id && item.classId === classId);
    const accessMode = assignment?.accessOverride ?? rule?.accessMode ?? quest.defaultAccessMode;
    const unlockAt = assignment?.overrideUnlockAt ?? rule?.unlockAt ?? quest.unlockAt;
    const lockAt = assignment?.overrideLockAt ?? rule?.lockAt ?? quest.lockAt;
    const now = Date.now();
    const lockedByTime = lockAt && new Date(lockAt).getTime() <= now;
    const scheduled = (accessMode === QUEST_ACCESS_MODES.SCHEDULED || unlockAt) && (!unlockAt || new Date(unlockAt).getTime() > now);

    if (accessMode === QUEST_ACCESS_MODES.HIDDEN) return { accessMode, canSee: false, canOpen: false, canSubmit: false };
    if (accessMode === QUEST_ACCESS_MODES.ARCHIVED) return { accessMode, canSee: false, canOpen: false, canSubmit: false };
    if (scheduled) return { accessMode: QUEST_ACCESS_MODES.SCHEDULED, canSee: rule?.visibleBeforeUnlock ?? true, canOpen: false, canSubmit: false, noteToStudent: rule?.noteToStudent ?? 'This quest unlocks later.' };
    if (accessMode === QUEST_ACCESS_MODES.VISIBLE_LOCKED) return { accessMode, canSee: true, canOpen: false, canSubmit: false, noteToStudent: rule?.noteToStudent ?? 'This quest is locked.' };
    if (lockedByTime || accessMode === QUEST_ACCESS_MODES.REVIEW_ONLY) return { accessMode: QUEST_ACCESS_MODES.REVIEW_ONLY, canSee: true, canOpen: true, canSubmit: false, noteToStudent: rule?.noteToStudent ?? 'This quest is available for review only.' };
    return { accessMode: QUEST_ACCESS_MODES.AVAILABLE, canSee: true, canOpen: true, canSubmit: assignment?.allowSubmissionOverride ?? rule?.allowSubmission ?? true, noteToStudent: rule?.noteToStudent ?? null };
  }

  async getStudentQuestFeed({ classId }) {
    const db = readStore();
    const session = await this.getCurrentSession();
    const studentId = session.user?.id;
    const quests = db.quests.filter((quest) => db.units.find((unit) => unit.id === quest.unitId)?.courseId === db.classes.find((item) => item.id === classId)?.courseId);
    return clone(quests.map((quest) => {
      const access = this._effectiveAccess(db, { quest, classId, studentId });
      const version = db.questVersions.find((item) => item.id === quest.publishedVersionId);
      const assignment = db.assignments.find((item) => item.questId === quest.id && item.classId === classId && item.studentId === studentId);
      return {
        questId: quest.id,
        unitId: quest.unitId,
        title: quest.title,
        questType: quest.questType,
        locationKey: quest.locationKey,
        xpReward: quest.xpReward,
        ...access,
        mapMarker: version?.content?.identity?.mapMarker ?? null,
        assignmentStatus: assignment?.status ?? 'not_started',
      };
    }).filter((quest) => quest.canSee));
  }

  async ensureStudentQuestAssignment({ classId, questId }) {
    const db = readStore();
    const profile = this._currentProfile(db);
    if (profile?.role !== 'student') throw new Error('Only student mock users can open a student assignment.');
    const quest = db.quests.find((item) => item.id === questId);
    const access = this._effectiveAccess(db, { quest, classId, studentId: profile.id });
    if (!access.canOpen) throw new Error(access.noteToStudent ?? 'Quest is unavailable.');

    let assignment = db.assignments.find((item) => item.questId === questId && item.classId === classId && item.studentId === profile.id);
    if (!assignment) {
      assignment = {
        id: id('assignment'), questId, classId, studentId: profile.id,
        questVersionId: quest.publishedVersionId, status: 'in_progress', firstOpenedAt: nowIso(), createdAt: nowIso(),
      };
      db.assignments.push(assignment);
    } else if (assignment.status === 'not_started') {
      assignment.status = 'in_progress';
    }
    writeStore(db);
    return clone(assignment);
  }

  async getStudentQuestContent({ assignmentId }) {
    const db = readStore();
    const profile = this._currentProfile(db);
    const assignment = db.assignments.find((item) => item.id === assignmentId && item.studentId === profile?.id);
    if (!assignment) throw new Error('Assignment unavailable.');
    const quest = db.quests.find((item) => item.id === assignment.questId);
    const access = this._effectiveAccess(db, { quest, classId: assignment.classId, studentId: profile.id });
    if (!access.canOpen) throw new Error(access.noteToStudent ?? 'Quest is unavailable.');
    const version = db.questVersions.find((item) => item.id === assignment.questVersionId);
    return clone(version?.content);
  }

  _draftSubmission(db, assignment) {
    let submission = db.submissions.find((item) => item.assignmentId === assignment.id && item.status === 'draft');
    if (!submission) {
      submission = {
        id: id('submission'), assignmentId: assignment.id, studentId: assignment.studentId, classId: assignment.classId,
        questId: assignment.questId, questVersionId: assignment.questVersionId, attemptNumber: 1, status: 'draft', answers: {}, createdAt: nowIso(), updatedAt: nowIso(),
      };
      db.submissions.push(submission);
    }
    return submission;
  }

  async saveStudentDraft({ assignmentId, answers }) {
    const db = readStore();
    const profile = this._currentProfile(db);
    const assignment = db.assignments.find((item) => item.id === assignmentId && item.studentId === profile?.id);
    if (!assignment) throw new Error('Assignment unavailable.');
    const submission = this._draftSubmission(db, assignment);
    submission.answers = clone(answers);
    submission.updatedAt = nowIso();
    writeStore(db);
    return clone(submission);
  }

  async submitStudentWork({ assignmentId, answers }) {
    const db = readStore();
    const profile = this._currentProfile(db);
    const assignment = db.assignments.find((item) => item.id === assignmentId && item.studentId === profile?.id);
    const quest = db.quests.find((item) => item.id === assignment?.questId);
    const access = this._effectiveAccess(db, { quest, classId: assignment?.classId, studentId: profile?.id });
    if (!assignment || !access.canSubmit) throw new Error('This quest cannot be submitted right now.');
    const submission = this._draftSubmission(db, assignment);
    submission.answers = clone(answers);
    submission.status = 'submitted';
    submission.submittedAt = nowIso();
    assignment.status = 'submitted';
    writeStore(db);
    return clone(submission);
  }

  async getTeacherDashboard({ courseId, classId }) {
    const db = readStore();
    const classes = db.classes.filter((item) => item.courseId === courseId && (!classId || item.id === classId));
    const classIds = classes.map((item) => item.id);
    const submissions = db.submissions.filter((item) => classIds.includes(item.classId));
    return {
      activeUnit: db.units.find((unit) => unit.id === classes[0]?.activeUnitId) ?? null,
      classes: clone(classes),
      counts: {
        students: db.classMembers.filter((item) => classIds.includes(item.classId)).length,
        ungraded: submissions.filter((item) => item.status === 'submitted' || item.status === 'grading').length,
        submitted: submissions.filter((item) => item.status === 'submitted').length,
        graded: submissions.filter((item) => item.status === 'graded').length,
      },
      recentSubmissions: clone(submissions.slice(-8).reverse()),
    };
  }

  async getTeacherRoster({ classId }) {
    const db = readStore();
    const studentIds = db.classMembers.filter((item) => item.classId === classId).map((item) => item.studentId);
    return clone(db.profiles.filter((item) => studentIds.includes(item.id)));
  }

  async getTeacherUnits({ courseId }) {
    const db = readStore();
    return clone(db.units.filter((item) => item.courseId === courseId).sort((a, b) => a.orderIndex - b.orderIndex));
  }

  async getTeacherQuest({ questId }) {
    const db = readStore();
    const quest = db.quests.find((item) => item.id === questId);
    const versions = db.questVersions.filter((item) => item.questId === questId).sort((a, b) => b.versionNumber - a.versionNumber);
    return clone({ quest, versions, draft: versions.find((item) => item.id === quest.currentDraftVersionId), published: versions.find((item) => item.id === quest.publishedVersionId) });
  }

  async saveQuestDraft({ questId, content, metadata = {}, changeNote = '' }) {
    const db = readStore();
    const quest = db.quests.find((item) => item.id === questId);
    if (!quest) throw new Error('Quest not found.');
    const maxVersion = Math.max(0, ...db.questVersions.filter((item) => item.questId === questId).map((item) => item.versionNumber));
    const version = { id: id('quest-version'), questId, versionNumber: maxVersion + 1, state: 'draft', content: clone(content), createdBy: this._currentProfile(db).id, createdAt: nowIso(), changeNote };
    db.questVersions.push(version);
    quest.currentDraftVersionId = version.id;
    Object.assign(quest, metadata);
    writeStore(db);
    return clone(version);
  }

  async publishQuestVersion({ questId, versionId, changeNote = '' }) {
    const db = readStore();
    const quest = db.quests.find((item) => item.id === questId);
    const version = db.questVersions.find((item) => item.id === versionId && item.questId === questId);
    if (!quest || !version) throw new Error('Quest version not found.');
    db.questVersions.filter((item) => item.questId === questId && item.state === 'published').forEach((item) => { item.state = 'archived'; });
    version.state = 'published';
    version.publishedAt = nowIso();
    version.changeNote = changeNote || version.changeNote;
    quest.publishedVersionId = version.id;
    quest.currentDraftVersionId = version.id;
    writeStore(db);
    return clone(quest);
  }

  async getQuestVersionHistory({ questId }) {
    const db = readStore();
    return clone(db.questVersions.filter((item) => item.questId === questId).sort((a, b) => b.versionNumber - a.versionNumber));
  }

  async getQuestAccessRules({ questId }) {
    const db = readStore();
    return clone(db.accessRules.filter((item) => item.questId === questId));
  }

  async saveQuestAccessRule({ questId, classId, rule }) {
    const db = readStore();
    let existing = db.accessRules.find((item) => item.questId === questId && item.classId === classId);
    if (!existing) {
      existing = { id: id('access-rule'), questId, classId };
      db.accessRules.push(existing);
    }
    Object.assign(existing, clone(rule), { updatedAt: nowIso() });
    writeStore(db);
    return clone(existing);
  }

  async saveStudentQuestOverride({ questId, classId, studentId, override }) {
    const db = readStore();
    const quest = db.quests.find((item) => item.id === questId);
    let assignment = db.assignments.find((item) => item.questId === questId && item.classId === classId && item.studentId === studentId);
    if (!assignment) {
      assignment = { id: id('assignment'), questId, classId, studentId, questVersionId: quest.publishedVersionId, status: 'not_started', createdAt: nowIso() };
      db.assignments.push(assignment);
    }
    Object.assign(assignment, clone(override), { updatedAt: nowIso() });
    writeStore(db);
    return clone(assignment);
  }

  async bulkSetQuestAccess({ questIds, classIds, accessMode, unlockAt = null, lockAt = null, visibleBeforeUnlock = true }) {
    const results = [];
    for (const questId of questIds) {
      for (const classId of classIds) {
        results.push(await this.saveQuestAccessRule({ questId, classId, rule: { accessMode, unlockAt, lockAt, visibleBeforeUnlock } }));
      }
    }
    return results;
  }

  async getSubmissions(filters = {}) {
    const db = readStore();
    let rows = [...db.submissions];
    if (filters.classId) rows = rows.filter((item) => item.classId === filters.classId);
    if (filters.questId) rows = rows.filter((item) => item.questId === filters.questId);
    if (filters.status) rows = rows.filter((item) => item.status === filters.status);
    if (filters.studentId) rows = rows.filter((item) => item.studentId === filters.studentId);
    return clone(rows.map((submission) => ({
      ...submission,
      student: db.profiles.find((item) => item.id === submission.studentId),
      quest: db.quests.find((item) => item.id === submission.questId),
      class: db.classes.find((item) => item.id === submission.classId),
    })).sort((a, b) => (b.submittedAt ?? b.updatedAt).localeCompare(a.submittedAt ?? a.updatedAt)));
  }

  async getSubmissionForGrading({ submissionId }) {
    const db = readStore();
    const submission = db.submissions.find((item) => item.id === submissionId);
    if (!submission) throw new Error('Submission not found.');
    const assignment = db.assignments.find((item) => item.id === submission.assignmentId);
    const version = db.questVersions.find((item) => item.id === submission.questVersionId);
    return clone({
      submission,
      assignment,
      version,
      content: version?.content,
      student: db.profiles.find((item) => item.id === submission.studentId),
      rubricScores: db.rubricScores.filter((item) => item.submissionId === submissionId),
    });
  }

  async saveRubricScores({ submissionId, scores, overallFeedback = '', status = 'grading' }) {
    const db = readStore();
    const submission = db.submissions.find((item) => item.id === submissionId);
    if (!submission) throw new Error('Submission not found.');
    db.rubricScores = db.rubricScores.filter((item) => item.submissionId !== submissionId);
    scores.forEach((score) => db.rubricScores.push({ id: id('rubric'), submissionId, ...clone(score), isVisibleToStudent: status === 'graded', scoredBy: this._currentProfile(db).id, updatedAt: nowIso() }));
    submission.score = scores.reduce((sum, score) => sum + Number(score.pointsEarned ?? 0), 0);
    submission.maxScore = scores.reduce((sum, score) => sum + Number(score.maxPoints ?? 0), 0);
    submission.overallFeedback = overallFeedback;
    submission.status = status;
    submission.gradedAt = status === 'graded' ? nowIso() : submission.gradedAt;
    writeStore(db);
    return clone(submission);
  }

  async returnSubmissionToStudent({ submissionId, overallFeedback = '' }) {
    const db = readStore();
    const submission = db.submissions.find((item) => item.id === submissionId);
    submission.status = 'graded';
    submission.overallFeedback = overallFeedback || submission.overallFeedback;
    submission.returnedAt = nowIso();
    db.rubricScores.filter((item) => item.submissionId === submissionId).forEach((item) => { item.isVisibleToStudent = true; });
    writeStore(db);
    return clone(submission);
  }

  async requestRevision({ submissionId, feedback, reopenQuestionIds = [] }) {
    const db = readStore();
    const submission = db.submissions.find((item) => item.id === submissionId);
    submission.status = 'revision_requested';
    submission.overallFeedback = feedback;
    submission.reopenQuestionIds = clone(reopenQuestionIds);
    const assignment = db.assignments.find((item) => item.id === submission.assignmentId);
    assignment.status = 'revision_requested';
    writeStore(db);
    return clone(submission);
  }

  async reopenSubmission({ submissionId }) {
    const db = readStore();
    const submission = db.submissions.find((item) => item.id === submissionId);
    submission.status = 'draft';
    const assignment = db.assignments.find((item) => item.id === submission.assignmentId);
    assignment.status = 'in_progress';
    writeStore(db);
    return clone(submission);
  }

  async setUnitState({ unitId, state, classIds = [], priorUnitAction = 'review_only' }) {
    const db = readStore();
    const unit = db.units.find((item) => item.id === unitId);
    unit.state = state;
    if (state === 'active') {
      db.classes.filter((item) => classIds.includes(item.id)).forEach((item) => { item.activeUnitId = unitId; });
      const oldUnits = db.units.filter((item) => item.courseId === unit.courseId && item.id !== unitId && item.state === 'active');
      oldUnits.forEach((item) => { item.state = priorUnitAction; });
    }
    writeStore(db);
    return clone(unit);
  }

  async getHistorianAnalytics({ classId, unitId = null }) {
    const db = readStore();
    const studentIds = db.classMembers.filter((item) => item.classId === classId).map((item) => item.studentId);
    const submissions = db.submissions.filter((item) => item.classId === classId && (!unitId || db.quests.find((quest) => quest.id === item.questId)?.unitId === unitId));
    return {
      totalStudents: studentIds.length,
      totalSubmissions: submissions.length,
      ungraded: submissions.filter((item) => item.status === 'submitted' || item.status === 'grading').length,
      completionRate: studentIds.length ? Math.round((new Set(submissions.filter((item) => item.status === 'graded').map((item) => item.studentId)).size / studentIds.length) * 100) : 0,
      averageScore: submissions.length ? submissions.reduce((sum, item) => sum + Number(item.score ?? 0), 0) / submissions.length : 0,
    };
  }
}
