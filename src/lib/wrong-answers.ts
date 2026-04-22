import { getAllQuizSessions, QuizSubject, QuizSession } from './quiz-engine';

export type WrongAnswerItem = {
  sessionId: string;
  subject: QuizSubject;
  timestamp: string;
  questionId: string;
  userAnswer: string;
};

export type WrongAnswerGroup = {
  subject: QuizSubject;
  items: WrongAnswerItem[];
};

const SUBJECT_ORDER: QuizSubject[] = ['math', 'algebra', 'chinese-poem', 'english'];

export const SUBJECT_LABELS: Record<QuizSubject, string> = {
  math: '数学',
  algebra: '代数',
  'chinese-poem': '语文',
  english: '英语',
};

export const SUBJECT_ROUTES: Record<QuizSubject, string> = {
  math: '/math/quiz',
  algebra: '/math/algebra/quiz',
  'chinese-poem': '/chinese/quiz',
  english: '/english/quiz',
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
        });
        bySubject.set(session.subject, items);
      }
    }
  }

  const groups: WrongAnswerGroup[] = [];
  for (const [subject, items] of bySubject) {
    groups.push({ subject, items });
  }

  return groups.sort((a, b) => SUBJECT_ORDER.indexOf(a.subject) - SUBJECT_ORDER.indexOf(b.subject));
}
