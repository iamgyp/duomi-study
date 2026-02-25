export type MathConfig = {
  operation: 'add' | 'sub' | 'mul' | 'mix';
  max: number; // Maximum result or operand
  count: number;
  mode: 'normal' | 'make-ten' | 'take-ten';
  customRange?: { min1: number; max1: number; min2: number; max2: number };
};

export type MathQuestion = {
  id: string;
  num1: number;
  num2: number;
  operator: '+' | '-' | '×' | '÷';
  answer: number;
  // For special modes
  decomposition?: {
    part1: number; // Split of the second number (e.g., 5 -> 2)
    part2: number; // Remainder (e.g., 5 -> 3)
  };
};

export function generateMathQuestions(config: MathConfig): MathQuestion[] {
  const questions: MathQuestion[] = [];
  const { operation, max, count, mode } = config;

  for (let i = 0; i < count; i++) {
    let q: MathQuestion | null = null;
    let attempts = 0;

    // Retry loop to ensure valid questions (no duplicates if possible, non-negative)
    while (!q && attempts < 50) {
      attempts++;
      
      if (mode === 'make-ten') {
        q = generateMakeTenQuestion();
      } else if (mode === 'take-ten') {
        q = generateTakeTenQuestion();
      } else {
        q = generateNormalQuestion(operation, max);
      }
    }

    if (q) {
      q.id = Math.random().toString(36).substr(2, 9);
      questions.push(q);
    }
  }

  return questions;
}

function generateNormalQuestion(op: string, max: number): MathQuestion | null {
  const operator = op === 'mix' ? (Math.random() > 0.5 ? '+' : '-') : (op === 'mul' ? '×' : (op === 'sub' ? '-' : '+'));
  
  let num1 = Math.floor(Math.random() * max); // 0 to max-1 ? usually 1 to max
  let num2 = Math.floor(Math.random() * max);

  // Avoid 0 for pedagogical reasons usually? Let's allow 0 for now but maybe restrict 1-max.
  // Actually for kids, 0+5 is valid.

  if (operator === '+') {
    // Ensure result <= max
    if (num1 + num2 > max) return null;
    return { id: '', num1, num2, operator: '+', answer: num1 + num2 };
  } else if (operator === '-') {
    // Ensure non-negative result
    if (num1 < num2) {
      [num1, num2] = [num2, num1]; // Swap
    }
    return { id: '', num1, num2, operator: '-', answer: num1 - num2 };
  } else if (operator === '×') {
    // For multiplication, max usually refers to the operands, e.g., 9x9 table.
    // If max=20, maybe 1-9?
    const m = Math.min(max, 9); 
    num1 = Math.floor(Math.random() * m) + 1;
    num2 = Math.floor(Math.random() * m) + 1;
    return { id: '', num1, num2, operator: '×', answer: num1 * num2 };
  }

  return null;
}

// 凑十法: 8 + 5 = ? (8+2=10, 5 splits into 2 & 3)
// Num1: 5-9 (needs to be close to 10)
// Num2: such that Num1 + Num2 > 10 AND Num1 + Num2 <= 20
function generateMakeTenQuestion(): MathQuestion | null {
  // 1. Pick num1 from [6, 7, 8, 9] usually.
  const num1 = Math.floor(Math.random() * 4) + 6; // 6,7,8,9
  
  // 2. Pick num2 such that sum > 10.
  // needed: 10 - num1.
  const needed = 10 - num1;
  
  // num2 must be > needed.
  // max sum is 18 (9+9).
  // So num2 can be needed+1 to 9.
  const minNum2 = needed + 1;
  const maxNum2 = 9;
  
  if (minNum2 > maxNum2) return null; // Should not happen for 6-9
  
  const num2 = Math.floor(Math.random() * (maxNum2 - minNum2 + 1)) + minNum2;
  
  return {
    id: '',
    num1,
    num2,
    operator: '+',
    answer: num1 + num2,
    decomposition: {
      part1: needed,
      part2: num2 - needed
    }
  };
}

// 破十法: 13 - 8 = ? (13 splits into 10 & 3, 10-8=2, 2+3=5)
// Minuend (num1): 11-18
// Subtrahend (num2): such that unit digit of num1 < num2
function generateTakeTenQuestion(): MathQuestion | null {
  // Num1 from 11 to 18
  const num1 = Math.floor(Math.random() * 8) + 11;
  
  // Unit digit of num1
  const unit = num1 % 10;
  
  // Num2 must be > unit (to force borrowing/breaking ten) and <= 9
  const minNum2 = unit + 1;
  const maxNum2 = 9;
  
  if (minNum2 > maxNum2) return null; // e.g. 19? max is 18. 18: unit 8. minNum2 9. OK.
  
  const num2 = Math.floor(Math.random() * (maxNum2 - minNum2 + 1)) + minNum2;
  
  return {
    id: '',
    num1,
    num2,
    operator: '-',
    answer: num1 - num2,
    decomposition: {
      part1: 10, // Not used in same way, but keeping structure
      part2: unit
    }
  };
}
