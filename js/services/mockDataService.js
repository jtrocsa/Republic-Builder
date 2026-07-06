import { DataServiceContract } from './dataService.contract.js';
import { QUEST_ACCESS_MODES, UNIT_STATES, isQuestVisible, canStudentOpen, canStudentSubmit, lockMessageForRule } from '../utils/accessRules.js';
import { clone, sanitizeQuestPatch, createVersionSnapshot } from '../utils/contentModel.js';

const STORAGE_KEY = 'republic-builder-teacher-demo-v1';

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function defaultBossAssessment(label, maxPoints, prompt) {
  return {
    id: label.toLowerCase(),
    label,
    maxPoints,
    instructions: 'Use evidence and historical reasoning. Drafts autosave in local demo mode.',
    responseSettings: { autosave: true, allowResubmit: false },
    questions: [{ id: `${label.toLowerCase()}-response`, label: 'Response', prompt, placeholder: 'Write your response here.', responseType: 'textarea', maxPoints }]
  };
}

function seedQuestVersions() {
  return {
    'q-southwest-survey': {
      schemaVersion: 1,
      identity: { title: 'Southwest Survey', subtitle: 'MCQ Challenge', questType: 'royale', xpReward: 45, location: 'American Southwest', mapMarker: { x: 20, y: 45, icon: 'royale', label: 'Southwest Survey' } },
      presentation: { heroKicker: 'MCQ Challenge', heroDescription: 'Compare evidence from regional Native societies.', theme: 'royale' },
      sources: [{ id: 'cabeza', title: 'Cabeza de Vaca', citation: '1542', body: 'Accounts of travel and encounters across Indigenous communities.' }],
      assessments: [{ id: 'mcq', label: 'Evidence Rounds', maxPoints: 3, instructions: 'Choose the best evidence-based answer.', responseSettings: { autosave: true, allowResubmit: true }, questions: [{ id: 'q1', label: 'Q1', prompt: 'Which adaptation supported settled life in parts of the Southwest before 1491?', placeholder: 'Select one option', responseType: 'multiple_choice', maxPoints: 1 }] }],
      rubrics: {},
      rewards: { xp: 45, items: ['Mapmaker Pin'], historianSkillAwards: ['comparison'] }
    },
    'q-maize-bounty': {
      schemaVersion: 1,
      identity: { title: 'The Maize Ledger', subtitle: 'Vocabulary Challenge', questType: 'vocab', xpReward: 40, location: 'River Valleys', mapMarker: { x: 25, y: 25, icon: 'vocab', label: 'Maize Ledger' } },
      presentation: { heroKicker: 'Vocabulary Challenge', heroDescription: 'Track key Unit 1 concepts and misconceptions.', theme: 'vocab' },
      sources: [{ id: 'oviedo', title: 'Natural History of the Indies', citation: '1535', body: 'Descriptions of New World crops and goods.' }],
      assessments: [{ id: 'vocab', label: 'Term Recovery', maxPoints: 4, instructions: 'Define and apply terms.', responseSettings: { autosave: true, allowResubmit: true }, questions: [{ id: 'v1', label: 'Maize cultivation', prompt: 'Explain how maize cultivation shaped settlement patterns.', placeholder: 'Write a concise explanation.', responseType: 'textarea', maxPoints: 1 }] }],
      rubrics: {},
      rewards: { xp: 40, items: ['Glossary Seal'], historianSkillAwards: ['context'] }
    },
    'q-columbus-dispatch': {
      schemaVersion: 1,
      identity: { title: 'Columbus’s Dispatch', subtitle: 'HIPP Challenge', questType: 'hipp', xpReward: 60, location: 'Guanahani / Caribbean', mapMarker: { x: 47, y: 47, icon: 'hipp', label: 'Columbus Dispatch' } },
      presentation: { heroKicker: 'HIPP Challenge', heroDescription: 'Analyze historical situation, audience, purpose, and point of view.', theme: 'hipp' },
      sources: [{ id: 'columbus-1493', title: 'Letter to Luis de Santangel', citation: '1493', body: 'Their Highnesses may see that I shall give them as much gold as they need ...' }],
      assessments: [{ id: 'hipp', label: 'HIPP', maxPoints: 4, instructions: 'Respond in each category with evidence.', responseSettings: { autosave: true, allowResubmit: true }, questions: [{ id: 'h', label: 'Historical Situation', prompt: 'What context explains this document?', placeholder: 'Describe context...', responseType: 'textarea', maxPoints: 1 }, { id: 'i', label: 'Intended Audience', prompt: 'Who is the audience?', placeholder: 'Identify audience...', responseType: 'textarea', maxPoints: 1 }, { id: 'p1', label: 'Purpose', prompt: 'What did Columbus hope to accomplish?', placeholder: 'Explain purpose...', responseType: 'textarea', maxPoints: 1 }, { id: 'p2', label: 'Point of View', prompt: 'How does POV shape the message?', placeholder: 'Explain POV...', responseType: 'textarea', maxPoints: 1 }] }],
      rubrics: {},
      rewards: { xp: 60, items: ['Sourcing Sigil'], historianSkillAwards: ['sourcing'] }
    },
    'q-new-atlantic-chart': {
      schemaVersion: 1,
      identity: { title: 'The New Atlantic Chart', subtitle: 'HIPP Challenge', questType: 'hipp', xpReward: 60, location: 'St. Die / Europe', mapMarker: { x: 75, y: 24, icon: 'hipp', label: 'Atlantic Chart' } },
      presentation: { heroKicker: 'Map as Evidence', heroDescription: 'Interpret a 1507 map in historical context.', theme: 'hipp' },
      sources: [{ id: 'waldseemuller', title: 'Universalis cosmographia', citation: '1507', body: 'Map naming America and depicting western hemisphere separation.' }],
      assessments: [{ id: 'hipp', label: 'HIPP', maxPoints: 4, instructions: 'Use map details and context.', responseSettings: { autosave: true, allowResubmit: true }, questions: [{ id: 'h', label: 'Historical Situation', prompt: 'What developments enabled this map?', placeholder: 'Context...', responseType: 'textarea', maxPoints: 1 }] }],
      rubrics: {},
      rewards: { xp: 60, items: ['Cartographer Token'], historianSkillAwards: ['context', 'sourcing'] }
    },
    'q-tenochtitlan-royale': {
      schemaVersion: 1,
      identity: { title: 'Tenochtitlan Under Watch', subtitle: 'MCQ Challenge', questType: 'royale', xpReward: 55, location: 'Tenochtitlan', mapMarker: { x: 31, y: 62, icon: 'royale', label: 'Tenochtitlan' } },
      presentation: { heroKicker: 'MCQ Challenge', heroDescription: 'Compare European and Indigenous evidence.', theme: 'royale' },
      sources: [{ id: 'cortes', title: 'Second Letter to Charles V', citation: '1520', body: 'Description of city layout and governance.' }],
      assessments: [{ id: 'mcq', label: 'Rounds', maxPoints: 3, instructions: 'Select the best supported claim.', responseSettings: { autosave: true, allowResubmit: true }, questions: [{ id: 'q1', label: 'Q1', prompt: 'Which claim is best supported by map and letter evidence?', placeholder: 'Select one', responseType: 'multiple_choice', maxPoints: 1 }] }],
      rubrics: {},
      rewards: { xp: 55, items: ['City Seal'], historianSkillAwards: ['evidence'] }
    },
    'q-conquest-conscience': {
      schemaVersion: 1,
      identity: { title: 'Conquest & Conscience', subtitle: 'HIPP Challenge', questType: 'hipp', xpReward: 65, location: 'Spanish Indies', mapMarker: { x: 55, y: 52, icon: 'hipp', label: 'Conquest & Conscience' } },
      presentation: { heroKicker: 'HIPP Challenge', heroDescription: 'Analyze critique and colonial policy.', theme: 'hipp' },
      sources: [{ id: 'las-casas', title: 'A Short Account of the Destruction of the Indies', citation: '1552', body: 'Critique of Spanish violence and exploitation.' }],
      assessments: [{ id: 'hipp', label: 'HIPP', maxPoints: 4, instructions: 'Source with evidence.', responseSettings: { autosave: true, allowResubmit: true }, questions: [{ id: 'h', label: 'Historical Situation', prompt: 'What context shaped Las Casas perspective?', placeholder: 'Context...', responseType: 'textarea', maxPoints: 1 }] }],
      rubrics: {},
      rewards: { xp: 65, items: ['Conscience Token'], historianSkillAwards: ['sourcing', 'argument'] }
    },
    'q-virginia-royale': {
      schemaVersion: 1,
      identity: { title: 'Virginia: Promise or Projection?', subtitle: 'MCQ Challenge', questType: 'royale', xpReward: 55, location: 'Roanoke / English Coast', mapMarker: { x: 29, y: 34, icon: 'royale', label: 'Virginia' } },
      presentation: { heroKicker: 'MCQ Challenge', heroDescription: 'Evaluate promotional versus observational sources.', theme: 'royale' },
      sources: [{ id: 'harriot', title: 'A Briefe and True Report', citation: '1590', body: 'Promotional framing of Virginia resources.' }],
      assessments: [{ id: 'mcq', label: 'Rounds', maxPoints: 3, instructions: 'Choose evidence-backed answers.', responseSettings: { autosave: true, allowResubmit: true }, questions: [{ id: 'q1', label: 'Q1', prompt: 'Which motive is most reflected in Hakluyt and Harriot?', placeholder: 'Select one', responseType: 'multiple_choice', maxPoints: 1 }] }],
      rubrics: {},
      rewards: { xp: 55, items: ['Virginia Ledger'], historianSkillAwards: ['comparison', 'evidence'] }
    },
    'q-empires-reckoning': {
      schemaVersion: 1,
      identity: { title: "Empire's Reckoning", subtitle: 'Unit 1 Writing Boss', questType: 'boss_battle', xpReward: 100, location: 'Atlantic World', mapMarker: { x: 59, y: 30, icon: 'boss', label: "Empire's Reckoning" } },
      presentation: { heroKicker: 'SAQ / LEQ / DBQ', heroDescription: 'Draft and revise APUSH writing responses using rubric guidance.', theme: 'boss-battle' },
      sources: [{ id: 'columbus', title: 'Columbus Letter Excerpt', citation: '1493', body: 'Their Highnesses may see...' }],
      assessments: [
        {
          id: 'saq',
          label: 'SAQ Skirmish',
          maxPoints: 3,
          instructions: 'Answer all three parts using specific historical evidence.',
          responseSettings: { autosave: true, allowResubmit: false },
          questions: [
            { id: 'part-a', label: 'A', prompt: 'Briefly describe ONE motive for European exploration reflected in the excerpt.', placeholder: 'Respond directly, with specific historical evidence.', responseType: 'textarea', maxPoints: 1, rubricKey: 'saq-part-a' },
            { id: 'part-b', label: 'B', prompt: 'Briefly explain ONE way the Columbian Exchange changed Indigenous societies between 1492 and 1607.', placeholder: 'Respond directly, with specific historical evidence.', responseType: 'textarea', maxPoints: 1, rubricKey: 'saq-part-b' },
            { id: 'part-c', label: 'C', prompt: 'Briefly explain ONE way European competition shaped colonization before 1607.', placeholder: 'Respond directly, with specific historical evidence.', responseType: 'textarea', maxPoints: 1, rubricKey: 'saq-part-c' }
          ]
        },
        defaultBossAssessment('LEQ Duel', 6, 'Evaluate the extent to which European exploration transformed societies in the Americas from 1491 to 1607.'),
        defaultBossAssessment('DBQ Siege', 7, 'Evaluate the extent to which European exploration and conquest transformed societies in the Americas from 1491 to 1607.')
      ],
      rubrics: {
        'saq-part-a': { maxPoints: 1, criteria: [{ points: 1, label: 'Accurate Part A response', description: 'Responds accurately with relevant historical information.' }] },
        'saq-part-b': { maxPoints: 1, criteria: [{ points: 1, label: 'Accurate Part B response', description: 'Explains change or impact with specific evidence.' }] },
        'saq-part-c': { maxPoints: 1, criteria: [{ points: 1, label: 'Accurate Part C response', description: 'Explains a related development with evidence.' }] }
      },
      rewards: { xp: 100, items: ['Atlantic Charter'], historianSkillAwards: ['argument', 'reasoning'] }
    }
  };
}

function seedDemoData() {
  const questContent = seedQuestVersions();
  const students = [
    { id: 'student-aria', displayName: 'Aria Bennett', studentIdentifier: 'P3-001', avatarKey: 'aria', classId: 'demo-period-3', pronouns: 'she/her', profession: 'Printer' },
    { id: 'student-jordan', displayName: 'Jordan Lee', studentIdentifier: 'P3-002', avatarKey: 'jordan', classId: 'demo-period-3', pronouns: 'they/them', profession: 'Merchant' },
    { id: 'student-maya', displayName: 'Maya Alvarez', studentIdentifier: 'P3-003', avatarKey: 'maya', classId: 'demo-period-3', pronouns: 'she/her', profession: 'Healer' },
    { id: 'student-noah', displayName: 'Noah Grant', studentIdentifier: 'P3-004', avatarKey: 'noah', classId: 'demo-period-3', pronouns: 'he/him', profession: 'Surveyor' },
    { id: 'student-evan', displayName: 'Evan Wright', studentIdentifier: 'P3-005', avatarKey: 'evan', classId: 'demo-period-3', pronouns: 'he/him', profession: 'Blacksmith' },
    { id: 'student-samira', displayName: 'Samira Patel', studentIdentifier: 'P5-001', avatarKey: 'samira', classId: 'demo-period-5', pronouns: 'she/her', profession: 'Scholar' },
    { id: 'student-kai', displayName: 'Kai Robinson', studentIdentifier: 'P5-002', avatarKey: 'kai', classId: 'demo-period-5', pronouns: 'they/them', profession: 'Orator' },
    { id: 'student-lena', displayName: 'Lena Cho', studentIdentifier: 'P5-003', avatarKey: 'lena', classId: 'demo-period-5', pronouns: 'she/her', profession: 'Maker' },
    { id: 'student-marcus', displayName: 'Marcus Reed', studentIdentifier: 'P5-004', avatarKey: 'marcus', classId: 'demo-period-5', pronouns: 'he/him', profession: 'Pathfinder' },
    { id: 'student-zuri', displayName: 'Zuri Thompson', studentIdentifier: 'P5-005', avatarKey: 'zuri', classId: 'demo-period-5', pronouns: 'she/her', profession: 'Steward' }
  ];

  const classes = [
    { id: 'demo-period-3', courseId: 'demo-course', teacherId: 'demo-teacher', name: 'APUSH Atlantic', periodLabel: 'Period 3', joinCode: 'ATLAS3', activeUnitId: 'unit-1' },
    { id: 'demo-period-5', courseId: 'demo-course', teacherId: 'demo-teacher', name: 'APUSH Atlantic', periodLabel: 'Period 5', joinCode: 'ATLAS5', activeUnitId: 'unit-1' }
  ];

  const units = [
    { id: 'unit-1', courseId: 'demo-course', orderIndex: 1, title: 'Unit 1 Atlantic Crossroads', subtitle: '1491-1607', state: UNIT_STATES.ACTIVE, defaultAccessMode: QUEST_ACCESS_MODES.AVAILABLE },
    { id: 'unit-2', courseId: 'demo-course', orderIndex: 2, title: 'Unit 2 Colonial Regions', subtitle: '1607-1754', state: UNIT_STATES.UPCOMING, defaultAccessMode: QUEST_ACCESS_MODES.HIDDEN }
  ];

  const questRows = Object.keys(questContent).map((id, index) => {
    const content = questContent[id];
    const version = createVersionSnapshot({ questId: id, versionNumber: 1, content, changeNote: 'Initial imported Unit 1 content', state: 'published' });
    return {
      quest: {
        id,
        unitId: 'unit-1',
        slug: id.replace(/^q-/, ''),
        questType: content.identity.questType,
        title: content.identity.title,
        locationKey: content.identity.location,
        xpReward: content.identity.xpReward,
        markerLabel: content.identity.mapMarker.label,
        defaultAccessMode: QUEST_ACCESS_MODES.AVAILABLE,
        status: QUEST_ACCESS_MODES.AVAILABLE,
        publishedVersionId: version.id,
        currentDraftVersionId: version.id,
        tabLocks: { saq: false, leq: false, dbq: false },
        orderIndex: index + 1
      },
      version
    };
  });

  const questIds = questRows.map((item) => item.quest.id);
  const allAssignments = [];
  const submissions = [];
  const rubricScores = [];

  function createAssignment(student, questId, status, opts = {}) {
    const assignmentId = uid('assign');
    const draftAnswers = opts.draftAnswers || {};
    const assignment = {
      id: assignmentId,
      questId,
      classId: student.classId,
      studentId: student.id,
      questVersionId: questRows.find((item) => item.quest.id === questId).quest.publishedVersionId,
      status,
      firstOpenedAt: nowIso(),
      submittedAt: opts.submittedAt || null,
      gradedAt: opts.gradedAt || null,
      revisionRequestedAt: opts.revisionRequestedAt || null,
      accessOverride: opts.accessOverride || null,
      overrideUnlockAt: opts.overrideUnlockAt || null,
      overrideNote: opts.overrideNote || null,
      draftAnswers,
      inventoryRewards: opts.inventoryRewards || []
    };
    allAssignments.push(assignment);

    if (opts.submission) {
      const submissionId = uid('sub');
      submissions.push({
        id: submissionId,
        assignmentId,
        studentId: student.id,
        classId: student.classId,
        questId,
        questVersionId: assignment.questVersionId,
        attemptNumber: 1,
        status: opts.submission.status,
        submittedAt: opts.submission.submittedAt || nowIso(),
        updatedAt: nowIso(),
        score: opts.submission.score ?? null,
        maxScore: opts.submission.maxScore ?? null,
        overallFeedback: opts.submission.feedback || '',
        answers: clone(opts.submission.answers || {}),
        reopenQuestionIds: clone(opts.submission.reopenQuestionIds || [])
      });

      if (opts.submission.rubricScores) {
        opts.submission.rubricScores.forEach((row) => {
          rubricScores.push({
            id: uid('rub'),
            submissionId,
            criterionKey: row.criterionKey,
            pointsEarned: row.pointsEarned,
            maxPoints: row.maxPoints,
            feedback: row.feedback || '',
            isVisibleToStudent: row.isVisibleToStudent ?? (opts.submission.status === 'graded')
          });
        });
      }
    }
  }

  const byId = Object.fromEntries(students.map((student) => [student.id, student]));

  // Behind student
  createAssignment(byId['student-aria'], 'q-southwest-survey', 'in_progress', { draftAnswers: { q1: 'maize and irrigation' } });
  createAssignment(byId['student-aria'], 'q-maize-bounty', 'not_started', {});

  // Completed-everything student
  questIds.forEach((questId) => {
    createAssignment(byId['student-jordan'], questId, 'graded', {
      submittedAt: nowIso(),
      gradedAt: nowIso(),
      submission: {
        status: 'graded',
        score: questId === 'q-empires-reckoning' ? 14 : 3,
        maxScore: questId === 'q-empires-reckoning' ? 16 : 3,
        feedback: 'Strong historical reasoning and evidence selection.',
        answers: { note: 'Completed response' }
      }
    });
  });

  // Revision requested student
  createAssignment(byId['student-maya'], 'q-empires-reckoning', 'revision_requested', {
    revisionRequestedAt: nowIso(),
    submission: {
      status: 'revision_requested',
      score: 1,
      maxScore: 3,
      feedback: 'Revise Part B with specific evidence and clearer explanation.',
      reopenQuestionIds: ['part-b'],
      answers: { 'part-a': 'Economic motives', 'part-b': 'Needs revision', 'part-c': 'Spanish-English rivalry' },
      rubricScores: [
        { criterionKey: 'saq-part-a', pointsEarned: 1, maxPoints: 1, feedback: 'Part A earns the point.', isVisibleToStudent: true },
        { criterionKey: 'saq-part-b', pointsEarned: 0, maxPoints: 1, feedback: 'Add specific evidence.' , isVisibleToStudent: true},
        { criterionKey: 'saq-part-c', pointsEarned: 0, maxPoints: 1, feedback: 'Clarify causal link.' , isVisibleToStudent: true}
      ]
    }
  });

  // Submitted ungraded
  createAssignment(byId['student-noah'], 'q-columbus-dispatch', 'submitted', {
    submittedAt: nowIso(),
    submission: {
      status: 'submitted',
      maxScore: 4,
      answers: { h: 'post-Reconquista context', i: 'Spanish crown officials', p1: 'secure patronage', p2: 'self-justifying narrative' }
    }
  });

  // Draft saved
  createAssignment(byId['student-evan'], 'q-empires-reckoning', 'in_progress', {
    draftAnswers: { 'part-a': 'wealth and trade routes', 'part-b': 'disease effects' },
    submission: {
      status: 'draft',
      maxScore: 3,
      answers: { 'part-a': 'wealth and trade routes', 'part-b': 'disease effects' }
    }
  });

  // Period 5 mixed progress + overrides
  createAssignment(byId['student-samira'], 'q-southwest-survey', 'graded', {
    submittedAt: nowIso(),
    gradedAt: nowIso(),
    submission: { status: 'graded', score: 3, maxScore: 3, feedback: 'Accurate and concise.' }
  });
  createAssignment(byId['student-kai'], 'q-empires-reckoning', 'not_started', {
    accessOverride: QUEST_ACCESS_MODES.LOCKED,
    overrideNote: 'Teacher has locked this boss tab until Friday.'
  });
  createAssignment(byId['student-lena'], 'q-virginia-royale', 'in_progress', { draftAnswers: { q1: 'imperial competition' } });
  createAssignment(byId['student-marcus'], 'q-new-atlantic-chart', 'review_only', {
    submission: { status: 'graded', score: 4, maxScore: 4, feedback: 'Great map interpretation.' }
  });
  createAssignment(byId['student-zuri'], 'q-empires-reckoning', 'submitted', {
    submittedAt: nowIso(),
    submission: {
      status: 'submitted',
      maxScore: 3,
      answers: { 'part-a': 'mercantilism motive', 'part-b': 'smallpox demographic collapse', 'part-c': 'imperial rivalry' }
    }
  });

  const accessRules = [
    {
      id: uid('rule'),
      questId: 'q-empires-reckoning',
      classId: 'demo-period-5',
      accessMode: QUEST_ACCESS_MODES.SCHEDULED,
      unlockAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      visibleBeforeUnlock: true,
      noteToStudent: 'Unlocks Friday at 3:00 PM',
      prerequisiteQuestIds: ['q-virginia-royale']
    },
    {
      id: uid('rule'),
      questId: 'q-conquest-conscience',
      classId: 'demo-period-3',
      accessMode: QUEST_ACCESS_MODES.LOCKED,
      visibleBeforeUnlock: true,
      noteToStudent: 'Complete Virginia MCQ Challenge first',
      prerequisiteQuestIds: ['q-virginia-royale']
    }
  ];

  const announcements = [
    { id: uid('ann'), classId: 'demo-period-3', title: "Empire's Reckoning opens Friday", body: 'Prepare SAQ drafts before release.', publishAt: nowIso(), createdBy: 'demo-teacher' },
    { id: uid('ann'), classId: 'demo-period-5', title: 'Vocabulary challenges due Thursday', body: 'All Unit 1 terms must be mastered by Thursday night.', publishAt: nowIso(), createdBy: 'demo-teacher' }
  ];

  const skills = [];
  students.forEach((student) => {
    ['context', 'evidence', 'argument', 'sourcing', 'reasoning', 'comparison'].forEach((skill) => {
      skills.push({ id: uid('skill'), classId: student.classId, studentId: student.id, skillKey: skill, currentValue: 5 + Math.floor(Math.random() * 4) });
    });
  });

  return {
    seededAt: nowIso(),
    mode: 'mock',
    session: { userId: null },
    profiles: [{ id: 'demo-teacher', role: 'teacher', displayName: 'Ms. Rivera', email: 'teacher@demo.local' }, ...students.map((student) => ({ id: student.id, role: 'student', ...student }))],
    courses: [{ id: 'demo-course', ownerId: 'demo-teacher', title: 'Atlantic Crossroads APUSH', slug: 'atlantic-crossroads-apush', activeUnitId: 'unit-1' }],
    classes,
    classMembers: students.map((student) => ({ classId: student.classId, studentId: student.id, joinedAt: nowIso() })),
    units,
    quests: questRows.map((item) => item.quest),
    questVersions: questRows.map((item) => item.version),
    accessRules,
    assignments: allAssignments,
    submissions,
    rubricScores,
    announcements,
    historianSkills: skills,
    feedbackBank: [
      { id: uid('fb'), category: 'Evidence', label: 'Use specific evidence', body: 'Add one concrete historical detail to support your claim.' },
      { id: uid('fb'), category: 'Reasoning', label: 'Explain how/why', body: 'Move beyond description by explaining how this evidence supports your argument.' }
    ]
  };
}

function readStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedDemoData();
    writeStore(seeded);
    return seeded;
  }
  return JSON.parse(raw);
}

function writeStore(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function effectiveRule(store, assignment) {
  const quest = store.quests.find((row) => row.id === assignment.questId);
  const classRule = store.accessRules.find((row) => row.questId === assignment.questId && row.classId === assignment.classId);
  const accessMode = assignment.accessOverride || classRule?.accessMode || quest.defaultAccessMode || QUEST_ACCESS_MODES.HIDDEN;
  return {
    ...classRule,
    accessMode,
    noteToStudent: assignment.overrideNote || classRule?.noteToStudent || lockMessageForRule({ accessMode }),
    prerequisiteQuestIds: classRule?.prerequisiteQuestIds || []
  };
}

function resolveAssignmentView(store, assignment) {
  const rule = effectiveRule(store, assignment);
  const quest = store.quests.find((row) => row.id === assignment.questId);
  const scheduledLocked = rule.accessMode === QUEST_ACCESS_MODES.SCHEDULED && rule.unlockAt && new Date(rule.unlockAt).getTime() > Date.now();
  const visible = isQuestVisible(rule.accessMode) || rule.visibleBeforeUnlock;
  const canOpen = !scheduledLocked && canStudentOpen(rule.accessMode);
  const canSubmit = !scheduledLocked && canStudentSubmit(rule.accessMode);
  return {
    assignmentId: assignment.id,
    quest,
    rule,
    accessMode: rule.accessMode,
    canSee: Boolean(visible),
    canOpen,
    canSubmit,
    noteToStudent: rule.noteToStudent,
    assignmentStatus: assignment.status
  };
}

function ensureAssignmentsForStudentClass(store, classId, studentId) {
  const classQuestIds = store.quests
    .filter((quest) => {
      const unit = store.units.find((row) => row.id === quest.unitId);
      return Boolean(unit) && unit.courseId === 'demo-course';
    })
    .map((quest) => quest.id);

  classQuestIds.forEach((questId) => {
    const existing = store.assignments.find((entry) => entry.classId === classId && entry.studentId === studentId && entry.questId === questId);
    if (existing) return;

    const quest = store.quests.find((entry) => entry.id === questId);
    store.assignments.push({
      id: uid('assign'),
      questId,
      classId,
      studentId,
      questVersionId: quest?.publishedVersionId || null,
      status: 'not_started',
      firstOpenedAt: null,
      submittedAt: null,
      gradedAt: null,
      revisionRequestedAt: null,
      accessOverride: null,
      overrideUnlockAt: null,
      overrideNote: null,
      draftAnswers: {},
      inventoryRewards: []
    });
  });
}

export class MockDataService extends DataServiceContract {
  async getCurrentSession() {
    const store = readStore();
    const user = store.profiles.find((profile) => profile.id === store.session.userId) || null;
    return { user: clone(user), mode: 'mock' };
  }

  async signInDemoTeacher() {
    const store = readStore();
    store.session = { userId: 'demo-teacher' };
    writeStore(store);
    return this.getCurrentSession();
  }

  async signOut() {
    const store = readStore();
    store.session = { userId: null };
    writeStore(store);
    return { ok: true };
  }

  async getTeacherClasses() {
    const store = readStore();
    return clone(store.classes);
  }

  async getTeacherDashboard({ classId } = {}) {
    const store = readStore();
    const classes = classId ? store.classes.filter((row) => row.id === classId) : store.classes;
    const classIds = classes.map((row) => row.id);
    const roster = store.classMembers.filter((row) => classIds.includes(row.classId));
    const submissions = store.submissions.filter((row) => classIds.includes(row.classId));
    const assignments = store.assignments.filter((row) => classIds.includes(row.classId));
    const graded = submissions.filter((row) => row.status === 'graded').length;
    const completionPct = assignments.length ? Math.round((graded / assignments.length) * 100) : 0;
    const needsAttention = assignments.filter((row) => row.status === 'revision_requested' || row.status === 'not_started').length;

    return {
      activeUnit: store.units.find((row) => row.state === UNIT_STATES.ACTIVE) || null,
      studentCount: roster.length,
      ungradedCount: submissions.filter((row) => row.status === 'submitted' || row.status === 'grading').length,
      completionPct,
      needsAttention,
      recentActivity: submissions.slice().sort((a, b) => (b.submittedAt || b.updatedAt).localeCompare(a.submittedAt || a.updatedAt)).slice(0, 8).map((submission) => {
        const student = store.profiles.find((profile) => profile.id === submission.studentId);
        const quest = store.quests.find((questRow) => questRow.id === submission.questId);
        return {
          id: submission.id,
          type: submission.status,
          message: `${student?.displayName || 'Student'} ${submission.status} ${quest?.title || 'quest'}`,
          at: submission.submittedAt || submission.updatedAt
        };
      }),
      quickActions: ['Unlock Quest', 'Open Grading Queue', 'Advance Unit', 'Create Announcement', 'View Student Progress']
    };
  }

  async getTeacherUnits() {
    const store = readStore();
    return clone(store.units.sort((a, b) => a.orderIndex - b.orderIndex));
  }

  async setUnitState({ unitId, state }) {
    const store = readStore();
    const unit = store.units.find((row) => row.id === unitId);
    if (!unit) throw new Error('Unit not found.');
    unit.state = state;
    if (state === UNIT_STATES.ACTIVE) {
      store.units.forEach((row) => {
        if (row.id !== unitId && row.state === UNIT_STATES.ACTIVE) row.state = UNIT_STATES.REVIEW_ONLY;
      });
      store.classes.forEach((row) => { row.activeUnitId = unitId; });
    }
    writeStore(store);
    return clone(unit);
  }

  async advanceUnit({ nextUnitId, unlockMode = 'immediate', keepPriorReview = true, lockOldBossBattles = false, classIds = [] }) {
    const store = readStore();
    const nextUnit = store.units.find((unit) => unit.id === nextUnitId);
    if (!nextUnit) throw new Error('Next unit not found.');
    const affected = classIds.length ? classIds : store.classes.map((row) => row.id);
    store.units.forEach((unit) => {
      if (unit.id === nextUnit.id) unit.state = unlockMode === 'immediate' ? UNIT_STATES.ACTIVE : UNIT_STATES.UPCOMING;
      else if (unit.state === UNIT_STATES.ACTIVE) unit.state = keepPriorReview ? UNIT_STATES.REVIEW_ONLY : UNIT_STATES.ARCHIVED;
    });
    store.classes.forEach((row) => {
      if (affected.includes(row.id) && unlockMode === 'immediate') row.activeUnitId = nextUnitId;
    });
    if (lockOldBossBattles) {
      store.quests.forEach((quest) => {
        if (quest.questType === 'boss_battle' && quest.unitId !== nextUnitId) quest.defaultAccessMode = QUEST_ACCESS_MODES.LOCKED;
      });
    }
    writeStore(store);
    return { unit: clone(nextUnit), classIds: clone(affected) };
  }

  async getTeacherQuestStudio({ classId } = {}) {
    const store = readStore();
    const classFilter = classId || store.classes[0]?.id;
    return clone(store.quests.map((quest) => {
      const rule = store.accessRules.find((row) => row.questId === quest.id && row.classId === classFilter);
      const versions = store.questVersions.filter((version) => version.questId === quest.id).sort((a, b) => b.versionNumber - a.versionNumber);
      return {
        ...quest,
        accessMode: rule?.accessMode || quest.defaultAccessMode,
        unlockAt: rule?.unlockAt || null,
        noteToStudent: rule?.noteToStudent || '',
        versionCount: versions.length,
        latestVersion: versions[0]?.versionNumber || 1
      };
    }));
  }

  async getTeacherQuest({ questId }) {
    const store = readStore();
    const quest = store.quests.find((row) => row.id === questId);
    if (!quest) throw new Error('Quest not found.');
    const versions = store.questVersions.filter((row) => row.questId === questId).sort((a, b) => b.versionNumber - a.versionNumber);
    const draft = versions.find((row) => row.id === quest.currentDraftVersionId) || versions[0];
    const published = versions.find((row) => row.id === quest.publishedVersionId) || versions[0];
    return clone({ quest, versions, draft, published });
  }

  async createQuestFromTemplate({ unitId = 'unit-1', templateKey = 'royale', identity = {}, source = null, questions = [] }) {
    const store = readStore();
    const questId = uid('q-custom');
    const questTypeMap = {
      hipp: 'hipp',
      royale: 'evidence',
      vocab: 'vocabulary',
      boss: 'boss_battle'
    };
    const title = String(identity.title || 'Untitled Quest').trim() || 'Untitled Quest';
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled-quest';
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 5)}`;

    const builtQuestions = questions.length ? questions : [{
      id: 'q1',
      label: 'Q1',
      prompt: 'Write your first prompt.',
      choices: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
      answer: 0,
      responseType: 'multiple_choice',
      maxPoints: 1
    }];

    const content = {
      schemaVersion: 1,
      identity: {
        title,
        subtitle: String(identity.subtitle || ''),
        questType: templateKey,
        xpReward: Number(identity.xpReward || 50),
        location: String(identity.location || 'Atlantic World'),
        mapMarker: {
          x: Number(identity.mapX || 50),
          y: Number(identity.mapY || 50),
          icon: String(identity.markerIcon || templateKey),
          label: title
        }
      },
      presentation: {
        heroKicker: String(identity.heroKicker || 'Teacher Built Quest'),
        heroDescription: String(identity.heroDescription || 'Custom quest created in Quest Studio builder.'),
        theme: templateKey
      },
      sources: source ? [clone(source)] : [],
      assessments: [{
        id: templateKey,
        label: String(identity.assessmentLabel || 'Assessment'),
        maxPoints: builtQuestions.reduce((sum, item) => sum + Number(item.maxPoints || 1), 0),
        instructions: String(identity.instructions || 'Respond to all prompts with evidence and explanation.'),
        responseSettings: { autosave: true, allowResubmit: true },
        questions: builtQuestions.map((question, index) => ({
          id: question.id || `q${index + 1}`,
          label: question.label || `Q${index + 1}`,
          prompt: question.prompt || 'Prompt text',
          choices: Array.isArray(question.choices) ? question.choices : ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
          answer: Number(question.answer || 0),
          responseType: question.responseType || 'multiple_choice',
          maxPoints: Number(question.maxPoints || 1)
        }))
      }],
      rubrics: {},
      rewards: { xp: Number(identity.xpReward || 50), items: [], historianSkillAwards: [] }
    };

    const version = createVersionSnapshot({
      questId,
      versionNumber: 1,
      content,
      changeNote: 'Created from teacher builder template',
      state: 'draft'
    });

    const quest = {
      id: questId,
      unitId,
      slug,
      questType: questTypeMap[templateKey] || 'other',
      title,
      locationKey: content.identity.location,
      xpReward: content.identity.xpReward,
      markerLabel: title,
      defaultAccessMode: QUEST_ACCESS_MODES.DRAFT,
      status: QUEST_ACCESS_MODES.DRAFT,
      publishedVersionId: version.id,
      currentDraftVersionId: version.id,
      tabLocks: { saq: false, leq: false, dbq: false },
      orderIndex: store.quests.length + 1
    };

    store.quests.push(quest);
    store.questVersions.push(version);
    writeStore(store);
    return clone({ quest, version });
  }

  async saveQuestDraft({ questId, patch, metadata = {}, changeNote = '' }) {
    const store = readStore();
    const quest = store.quests.find((row) => row.id === questId);
    if (!quest) throw new Error('Quest not found.');
    const latest = store.questVersions.filter((row) => row.questId === questId).sort((a, b) => b.versionNumber - a.versionNumber)[0];
    const mergedContent = { ...clone(latest.content), ...sanitizeQuestPatch(patch) };
    const snapshot = createVersionSnapshot({ questId, versionNumber: latest.versionNumber + 1, content: mergedContent, changeNote, state: 'draft' });
    store.questVersions.push(snapshot);
    quest.currentDraftVersionId = snapshot.id;
    Object.assign(quest, metadata);
    writeStore(store);
    return clone(snapshot);
  }

  async publishQuestVersion({ questId, versionId, changeNote = '' }) {
    const store = readStore();
    const quest = store.quests.find((row) => row.id === questId);
    const version = store.questVersions.find((row) => row.id === versionId && row.questId === questId);
    if (!quest || !version) throw new Error('Quest version not found.');
    store.questVersions.forEach((row) => {
      if (row.questId === questId && row.state === 'published') row.state = 'archived';
    });
    version.state = 'published';
    version.publishedAt = nowIso();
    version.changeNote = changeNote || version.changeNote;
    quest.publishedVersionId = version.id;
    quest.currentDraftVersionId = version.id;
    quest.title = version.content.identity?.title || quest.title;
    writeStore(store);
    return clone({ quest, version });
  }

  async duplicateQuest({ questId, unitId }) {
    const store = readStore();
    const source = store.quests.find((row) => row.id === questId);
    if (!source) throw new Error('Quest to duplicate not found.');
    const sourceVersion = store.questVersions.find((row) => row.id === source.publishedVersionId) || store.questVersions.find((row) => row.questId === questId);
    const newQuestId = uid('q-dup');
    const version = createVersionSnapshot({ questId: newQuestId, versionNumber: 1, content: clone(sourceVersion.content), changeNote: `Duplicated from ${source.title}`, state: 'draft' });
    const quest = {
      ...clone(source),
      id: newQuestId,
      unitId: unitId || source.unitId,
      slug: `${source.slug}-copy-${Math.random().toString(36).slice(2, 6)}`,
      title: `${source.title} (Copy)`,
      defaultAccessMode: QUEST_ACCESS_MODES.DRAFT,
      status: QUEST_ACCESS_MODES.DRAFT,
      publishedVersionId: version.id,
      currentDraftVersionId: version.id
    };
    store.quests.push(quest);
    store.questVersions.push(version);
    writeStore(store);
    return clone(quest);
  }

  async archiveQuest({ questId }) {
    const store = readStore();
    const quest = store.quests.find((row) => row.id === questId);
    if (!quest) throw new Error('Quest not found.');
    quest.defaultAccessMode = QUEST_ACCESS_MODES.ARCHIVED;
    quest.status = QUEST_ACCESS_MODES.ARCHIVED;
    writeStore(store);
    return clone(quest);
  }

  async restoreQuestVersion({ questId, versionId }) {
    return this.publishQuestVersion({ questId, versionId, changeNote: 'Restored previous version' });
  }

  async getQuestVersionHistory({ questId }) {
    const store = readStore();
    return clone(store.questVersions.filter((row) => row.questId === questId).sort((a, b) => b.versionNumber - a.versionNumber));
  }

  async getQuestAccessRules({ questId, classId }) {
    const store = readStore();
    return clone(store.accessRules.filter((rule) => rule.questId === questId && (!classId || rule.classId === classId)));
  }

  async saveQuestAccessRule({ questId, classId, rule }) {
    const store = readStore();
    let row = store.accessRules.find((entry) => entry.questId === questId && entry.classId === classId);
    if (!row) {
      row = { id: uid('rule'), questId, classId };
      store.accessRules.push(row);
    }
    Object.assign(row, clone(rule), { updatedAt: nowIso() });
    writeStore(store);
    return clone(row);
  }

  async saveStudentQuestOverride({ questId, classId, studentId, override }) {
    const store = readStore();
    const assignment = store.assignments.find((entry) => entry.questId === questId && entry.classId === classId && entry.studentId === studentId);
    if (!assignment) throw new Error('Student assignment not found for override.');
    Object.assign(assignment, clone(override), { updatedAt: nowIso() });
    writeStore(store);
    return clone(assignment);
  }

  async bulkSetQuestAccess({ questIds, classIds, accessMode, unlockAt = null, lockAt = null, visibleBeforeUnlock = true }) {
    const updated = [];
    for (const questId of questIds) {
      for (const classId of classIds) {
        const rule = await this.saveQuestAccessRule({
          questId,
          classId,
          rule: { accessMode, unlockAt, lockAt, visibleBeforeUnlock, noteToStudent: lockMessageForRule({ accessMode, unlockAt }) }
        });
        updated.push(rule);
      }
    }
    return updated;
  }

  async getRoster({ classId }) {
    const store = readStore();
    const members = store.classMembers.filter((row) => row.classId === classId).map((row) => row.studentId);
    return clone(store.profiles.filter((profile) => profile.role === 'student' && members.includes(profile.id)));
  }

  async addStudent({ classId, student }) {
    const store = readStore();
    const profile = { id: uid('student'), role: 'student', ...clone(student) };
    store.profiles.push(profile);
    store.classMembers.push({ classId, studentId: profile.id, joinedAt: nowIso() });
    writeStore(store);
    return clone(profile);
  }

  async updateStudent({ studentId, updates }) {
    const store = readStore();
    const profile = store.profiles.find((row) => row.id === studentId && row.role === 'student');
    if (!profile) throw new Error('Student not found.');
    Object.assign(profile, clone(updates));
    writeStore(store);
    return clone(profile);
  }

  async removeStudent({ classId, studentId }) {
    const store = readStore();
    store.classMembers = store.classMembers.filter((row) => !(row.classId === classId && row.studentId === studentId));
    writeStore(store);
    return { removed: true };
  }

  async importRosterCsvDemo({ classId, students }) {
    const added = [];
    for (const student of students) {
      added.push(await this.addStudent({ classId, student }));
    }
    return added;
  }

  async getStudentDetail({ classId, studentId }) {
    const store = readStore();
    const student = store.profiles.find((row) => row.id === studentId);
    const assignments = store.assignments.filter((row) => row.classId === classId && row.studentId === studentId);
    const submissions = store.submissions.filter((row) => row.classId === classId && row.studentId === studentId);
    const skills = store.historianSkills.filter((row) => row.classId === classId && row.studentId === studentId);
    return clone({ student, assignments, submissions, skills });
  }

  async getSubmissions(filters = {}) {
    const store = readStore();
    let rows = store.submissions.slice();
    if (filters.classId) rows = rows.filter((row) => row.classId === filters.classId);
    if (filters.studentId) rows = rows.filter((row) => row.studentId === filters.studentId);
    if (filters.questId) rows = rows.filter((row) => row.questId === filters.questId);
    if (filters.status) rows = rows.filter((row) => row.status === filters.status);
    if (filters.assessmentType) {
      rows = rows.filter((row) => {
        const quest = store.quests.find((questRow) => questRow.id === row.questId);
        return quest?.questType === filters.assessmentType || row.questId === 'q-empires-reckoning';
      });
    }

    return clone(rows.sort((a, b) => (b.submittedAt || b.updatedAt).localeCompare(a.submittedAt || a.updatedAt)).map((submission) => {
      const student = store.profiles.find((profile) => profile.id === submission.studentId);
      const quest = store.quests.find((questRow) => questRow.id === submission.questId);
      const klass = store.classes.find((row) => row.id === submission.classId);
      return {
        ...submission,
        student,
        quest,
        classPeriod: klass?.periodLabel || ''
      };
    }));
  }

  async getSubmissionForGrading({ submissionId }) {
    const store = readStore();
    const submission = store.submissions.find((row) => row.id === submissionId);
    if (!submission) throw new Error('Submission not found.');
    const assignment = store.assignments.find((row) => row.id === submission.assignmentId);
    const version = store.questVersions.find((row) => row.id === submission.questVersionId);
    const student = store.profiles.find((row) => row.id === submission.studentId);
    const rubricScores = store.rubricScores.filter((row) => row.submissionId === submissionId);
    return clone({ submission, assignment, version, content: version?.content, student, rubricScores });
  }

  async saveRubricScores({ submissionId, scores, overallFeedback = '', status = 'grading' }) {
    const store = readStore();
    const submission = store.submissions.find((row) => row.id === submissionId);
    if (!submission) throw new Error('Submission not found.');
    store.rubricScores = store.rubricScores.filter((row) => row.submissionId !== submissionId);
    scores.forEach((score) => {
      store.rubricScores.push({
        id: uid('rub'),
        submissionId,
        criterionKey: score.criterionKey,
        pointsEarned: Number(score.pointsEarned || 0),
        maxPoints: Number(score.maxPoints || 0),
        feedback: score.feedback || '',
        isVisibleToStudent: status === 'graded'
      });
    });
    submission.score = scores.reduce((sum, score) => sum + Number(score.pointsEarned || 0), 0);
    submission.maxScore = scores.reduce((sum, score) => sum + Number(score.maxPoints || 0), 0);
    submission.overallFeedback = overallFeedback;
    submission.status = status;
    submission.updatedAt = nowIso();
    writeStore(store);
    return clone(submission);
  }

  async returnSubmissionToStudent({ submissionId, overallFeedback = '' }) {
    const store = readStore();
    const submission = store.submissions.find((row) => row.id === submissionId);
    if (!submission) throw new Error('Submission not found.');
    submission.status = 'graded';
    submission.overallFeedback = overallFeedback || submission.overallFeedback;
    submission.returnedAt = nowIso();
    store.rubricScores.filter((row) => row.submissionId === submissionId).forEach((row) => { row.isVisibleToStudent = true; });
    const assignment = store.assignments.find((row) => row.id === submission.assignmentId);
    if (assignment) assignment.status = 'graded';
    writeStore(store);
    return clone(submission);
  }

  async requestRevision({ submissionId, feedback, reopenQuestionIds = [] }) {
    const store = readStore();
    const submission = store.submissions.find((row) => row.id === submissionId);
    if (!submission) throw new Error('Submission not found.');
    submission.status = 'revision_requested';
    submission.overallFeedback = feedback;
    submission.reopenQuestionIds = clone(reopenQuestionIds);
    const assignment = store.assignments.find((row) => row.id === submission.assignmentId);
    if (assignment) assignment.status = 'revision_requested';
    writeStore(store);
    return clone(submission);
  }

  async reopenSubmission({ submissionId }) {
    const store = readStore();
    const submission = store.submissions.find((row) => row.id === submissionId);
    if (!submission) throw new Error('Submission not found.');
    submission.status = 'draft';
    const assignment = store.assignments.find((row) => row.id === submission.assignmentId);
    if (assignment) assignment.status = 'in_progress';
    writeStore(store);
    return clone(submission);
  }

  async getHistorianAnalytics({ classId, unitId = null }) {
    const store = readStore();
    const roster = store.classMembers.filter((row) => row.classId === classId).map((row) => row.studentId);
    const assignments = store.assignments.filter((row) => row.classId === classId && (!unitId || store.quests.find((quest) => quest.id === row.questId)?.unitId === unitId));
    const submissions = store.submissions.filter((row) => row.classId === classId && (!unitId || store.quests.find((quest) => quest.id === row.questId)?.unitId === unitId));
    const skills = store.historianSkills.filter((row) => row.classId === classId);

    const completedByStudent = {};
    assignments.forEach((assignment) => {
      completedByStudent[assignment.studentId] ||= { total: 0, completed: 0 };
      completedByStudent[assignment.studentId].total += 1;
      if (assignment.status === 'graded' || assignment.status === 'completed') completedByStudent[assignment.studentId].completed += 1;
    });

    const heatmap = Object.entries(completedByStudent).map(([studentId, value]) => {
      const student = store.profiles.find((row) => row.id === studentId);
      return {
        studentId,
        studentName: student?.displayName || studentId,
        completionPct: value.total ? Math.round((value.completed / value.total) * 100) : 0
      };
    });

    const behindStudents = heatmap.filter((entry) => entry.completionPct < 40).map((entry) => entry.studentName);

    const missedCriteria = {};
    store.rubricScores.forEach((score) => {
      if (scoresForClass(score, submissions) && Number(score.pointsEarned) < Number(score.maxPoints)) {
        missedCriteria[score.criterionKey] = (missedCriteria[score.criterionKey] || 0) + 1;
      }
    });

    return {
      studentCount: roster.length,
      ungraded: submissions.filter((row) => row.status === 'submitted' || row.status === 'grading').length,
      completionByStudent: heatmap,
      completionByUnit: [{ unitId: unitId || 'unit-1', completionPct: heatmap.length ? Math.round(heatmap.reduce((sum, entry) => sum + entry.completionPct, 0) / heatmap.length) : 0 }],
      historianSkills: skills,
      behindStudents,
      commonMissedCriteria: Object.entries(missedCriteria).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([criterionKey, count]) => ({ criterionKey, count }))
    };

    function scoresForClass(score, classSubmissions) {
      return classSubmissions.some((submission) => submission.id === score.submissionId);
    }
  }

  async createAnnouncement({ classId, title, body, publishAt = null }) {
    const store = readStore();
    const announcement = { id: uid('ann'), classId, title, body, publishAt: publishAt || nowIso(), createdBy: 'demo-teacher', createdAt: nowIso() };
    store.announcements.unshift(announcement);
    writeStore(store);
    return clone(announcement);
  }

  async listAnnouncements({ classId } = {}) {
    const store = readStore();
    const rows = classId ? store.announcements.filter((row) => row.classId === classId) : store.announcements;
    return clone(rows.slice().sort((a, b) => b.publishAt.localeCompare(a.publishAt)));
  }

  async exportGradesCsv({ classId, unitId = null }) {
    const submissions = await this.getSubmissions({ classId });
    const rows = submissions.filter((row) => !unitId || row.quest?.unitId === unitId);
    const header = ['Student ID', 'Student', 'Class', 'Quest', 'Status', 'Score', 'Max Score', 'Submitted At'];
    const lines = [header.join(',')];
    rows.forEach((row) => {
      lines.push([
        csvEscape(row.student?.studentIdentifier),
        csvEscape(row.student?.displayName),
        csvEscape(row.classPeriod),
        csvEscape(row.quest?.title),
        csvEscape(row.status),
        csvEscape(row.score),
        csvEscape(row.maxScore),
        csvEscape(row.submittedAt || row.updatedAt)
      ].join(','));
    });
    return lines.join('\n');
  }

  async resetDemoData() {
    const seeded = seedDemoData();
    writeStore(seeded);
    return { resetAt: nowIso(), key: STORAGE_KEY };
  }

  async getStudentQuestFeed({ classId, studentId }) {
    const store = readStore();
    const targetStudentId = studentId || store.session.userId;
    ensureAssignmentsForStudentClass(store, classId, targetStudentId);
    writeStore(store);
    const assignments = store.assignments.filter((row) => row.classId === classId && row.studentId === targetStudentId);
    return clone(assignments.map((assignment) => resolveAssignmentView(store, assignment)).filter((entry) => entry.canSee));
  }

  async getStudentQuestContent({ assignmentId }) {
    const store = readStore();
    const assignment = store.assignments.find((row) => row.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found.');
    const view = resolveAssignmentView(store, assignment);
    if (!view.canOpen) {
      return { locked: true, lockMessage: view.noteToStudent, accessMode: view.accessMode };
    }
    const version = store.questVersions.find((row) => row.id === assignment.questVersionId);
    return clone({ locked: false, accessMode: view.accessMode, content: version?.content || null, assignment });
  }

  async saveStudentDraft({ assignmentId, answers }) {
    const store = readStore();
    const assignment = store.assignments.find((row) => row.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found.');
    assignment.draftAnswers = clone(answers);
    assignment.status = assignment.status === 'not_started' ? 'in_progress' : assignment.status;
    let draft = store.submissions.find((row) => row.assignmentId === assignmentId && row.status === 'draft');
    if (!draft) {
      draft = {
        id: uid('sub'),
        assignmentId,
        studentId: assignment.studentId,
        classId: assignment.classId,
        questId: assignment.questId,
        questVersionId: assignment.questVersionId,
        attemptNumber: 1,
        status: 'draft',
        answers: clone(answers),
        submittedAt: null,
        updatedAt: nowIso()
      };
      store.submissions.push(draft);
    } else {
      draft.answers = clone(answers);
      draft.updatedAt = nowIso();
    }
    writeStore(store);
    return clone(draft);
  }

  async submitStudentWork({ assignmentId, answers }) {
    const draft = await this.saveStudentDraft({ assignmentId, answers });
    const store = readStore();
    const submission = store.submissions.find((row) => row.id === draft.id);
    submission.status = 'submitted';
    submission.submittedAt = nowIso();
    const assignment = store.assignments.find((row) => row.id === assignmentId);
    assignment.status = 'submitted';
    writeStore(store);
    return clone(submission);
  }
}
