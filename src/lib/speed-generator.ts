export type SpeedQuizConfig = {
  timeLimitSeconds: 30 | 60 | 120;
  max: number;
  operation: 'add' | 'sub' | 'mul' | 'div' | 'mix' | 'add-sub' | 'mul-div';
};

export type SpeedQuestion = {
  id: string;
  num1: number;
  num2: number;
  operator: '+' | '-' | '×' | '÷';
  answer: number;
  questionText: string;
};

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

  q.id = `speed-${Math.random().toString(36).substr(2, 9)}`;
  return q;
}

function generateOne(op: SpeedQuizConfig['operation'], max: number): SpeedQuestion | null {
  const opPool: Array<{ op: SpeedQuestion['operator']; gen: () => SpeedQuestion | null }> = [
    { op: '+', gen: () => {
      const a = Math.floor(Math.random() * max) + 1;
      const b = Math.floor(Math.random() * max) + 1;
      if (a + b > max) return null;
      return { id: '', num1: a, num2: b, operator: '+', answer: a + b, questionText: `${a} + ${b} = ?` };
    }},
    { op: '-', gen: () => {
      let a = Math.floor(Math.random() * max) + 1;
      let b = Math.floor(Math.random() * max) + 1;
      if (a < b) [a, b] = [b, a];
      return { id: '', num1: a, num2: b, operator: '-', answer: a - b, questionText: `${a} - ${b} = ?` };
    }},
    { op: '×', gen: () => {
      const m = Math.min(max, 9);
      const a = Math.floor(Math.random() * m) + 1;
      const b = Math.floor(Math.random() * m) + 1;
      return { id: '', num1: a, num2: b, operator: '×', answer: a * b, questionText: `${a} × ${b} = ?` };
    }},
    { op: '÷', gen: () => {
      const m = Math.min(max, 9);
      const divisor = Math.floor(Math.random() * m) + 1;
      const answer = Math.floor(Math.random() * m) + 1;
      return { id: '', num1: divisor * answer, num2: divisor, operator: '÷', answer, questionText: `${divisor * answer} ÷ ${divisor} = ?` };
    }},
  ];

  const pool = op === 'mix' ? opPool : opPool.filter(p => {
    if (op === 'add') return p.op === '+';
    if (op === 'add-sub') return p.op === '+' || p.op === '-';
    if (op === 'mul-div') return p.op === '×' || p.op === '÷';
    if (op === 'sub') return p.op === '-';
    if (op === 'mul') return p.op === '×';
    if (op === 'div') return p.op === '÷';
    return false;
  });

  if (pool.length === 0) return null;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  return chosen.gen();
}
