export type SpeedQuizConfig = {
  timeLimitSeconds: 30 | 60 | 120;
  max: number;
  operation: 'add' | 'sub' | 'mul' | 'mix';
};

export type SpeedQuestion = {
  id: string;
  num1: number;
  num2: number;
  operator: '+' | '-' | '×';
  answer: number;
  questionText: string;
};

let idCounter = 0;

export function generateSpeedQuestion(config: SpeedQuizConfig): SpeedQuestion {
  let q: SpeedQuestion | null = null;
  let attempts = 0;

  while (!q && attempts < 50) {
    attempts++;
    q = generateOne(config.operation, config.max);
  }

  // Fallback if generation fails (shouldn't happen)
  if (!q) {
    q = { id: '', num1: 1, num2: 1, operator: '+', answer: 2, questionText: '1 + 1 = ?' };
  }

  idCounter++;
  q.id = `speed-${Date.now()}-${idCounter}`;
  return q;
}

function generateOne(op: string, max: number): SpeedQuestion | null {
  const operator = op === 'mix'
    ? (Math.random() > 0.5 ? '+' : '-')
    : (op === 'mul' ? '×' : (op === 'sub' ? '-' : '+'));

  let num1 = Math.floor(Math.random() * max) + 1;
  let num2 = Math.floor(Math.random() * max) + 1;

  if (operator === '+') {
    if (num1 + num2 > max) return null;
    return {
      id: '',
      num1,
      num2,
      operator: '+',
      answer: num1 + num2,
      questionText: `${num1} + ${num2} = ?`,
    };
  }

  if (operator === '-') {
    if (num1 < num2) {
      [num1, num2] = [num2, num1];
    }
    return {
      id: '',
      num1,
      num2,
      operator: '-',
      answer: num1 - num2,
      questionText: `${num1} - ${num2} = ?`,
    };
  }

  // multiplication
  const m = Math.min(max, 9);
  num1 = Math.floor(Math.random() * m) + 1;
  num2 = Math.floor(Math.random() * m) + 1;
  return {
    id: '',
    num1,
    num2,
    operator: '×',
    answer: num1 * num2,
    questionText: `${num1} × ${num2} = ?`,
  };
}
