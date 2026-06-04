import { getAllQuizSessions, QuizSubject, QuizAnswer } from './quiz-engine';

export type WrongAnswerItem = {
  sessionId: string;
  subject: QuizSubject;
  timestamp: string;
  questionId: string;
  userAnswer: string;
  correctAnswer?: string;
  questionText?: string;
  options?: string[];
  correctIndex?: number;
};

export type WrongAnswerGroup = {
  subject: QuizSubject;
  subjectLabel: string;
  items: WrongAnswerItem[];
  totalWrong: number;
};

export const SUBJECT_LABELS: Record<QuizSubject, string> = {
  math: '?? ???',
  algebra: '?? ???',
  'chinese-poem': '?? ??????',
  'chinese-speed': '????????',
  english: '?? ??????',
  'english-speed': '?? ??????',
  'speed-challenge': '????????',
};

export const SUBJECT_ROUTES: Record<QuizSubject, string> = {
  math: '/math/quiz',
  algebra: '/math/algebra/quiz',
  'chinese-poem': '/chinese/quiz',
  'chinese-speed': '/chinese/speed-challenge/quiz',
  english: '/english/quiz',
  'english-speed': '/english/speed-challenge/quiz',
  'speed-challenge': '/math/speed-challenge/quiz',
};

export function getWrongAnswers(): WrongAnswerGroup[] {
  const sessions = getAllQuizSessions();
  const bySubject = new Map<QuizSubject, WrongAnswerItem[]>();

  for (const session of sessions) {
    if (session.accuracy >= 1) continue;
    
    for (const answer of session.answers) {
      if (!answer.correct) {
        const items = bySubject.get(session.subject) || [];
        items.push({
          sessionId: session.id,
          subject: session.subject,
          timestamp: session.timestamp,
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          correctAnswer: answer.correctAnswer,
          questionText: answer.questionText,
          options: answer.options,
          correctIndex: answer.options ? answer.options.indexOf(answer.correctAnswer || '') : undefined,
        });
        bySubject.set(session.subject, items);
      }
    }
  }

  const groups: WrongAnswerGroup[] = [];
  for (const [subject, items] of bySubject) {
    // Sort by timestamp descending, keep last 100
    const sorted = items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 100);
    groups.push({
      subject,
      subjectLabel: SUBJECT_LABELS[subject] || subject,
      items: sorted,
      totalWrong: sorted.length,
    });
  }

  return groups;
}

export function getWrongAnswersBySubject(subject: QuizSubject): WrongAnswerItem[] {
  const groups = getWrongAnswers();
  const group = groups.find(g => g.subject === subject);
  return group ? group.items : [];
}
