// Utility for BubbleMath game
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// generateProblem creates an equation question and several numeric bubbles containing
// one correct answer and several distractors.
// options: { count: number of bubbles, max: max operand, ops: allowed operators }
export function generateEquations(count = 5, level = 1) {
  // count: number of equation bubbles to generate
  // level: increases operand size to scale difficulty
  const ops = ["+", "-", "*"];
  const equations = [];
  const max = Math.max(4, 6 + level * 3);
  // Ensure unique numeric answers per round to avoid ambiguous duplicates (e.g. 8+2 and 3+7)
  const answers = new Set();
  let attempts = 0;
  while (equations.length < count && attempts < count * 20) {
    attempts++;
    let a = randInt(1, max);
    let b = randInt(1, max);
    const op = ops[Math.floor(Math.random() * ops.length)];

    // avoid negative results: ensure a >= b for subtraction
    if (op === "-" && a < b) {
      const tmp = a; a = b; b = tmp;
    }

    let answer;
    switch (op) {
      case "+": answer = a + b; break;
      case "-": answer = a - b; break;
      case "*": answer = a * b; break;
      default: answer = a + b;
    }

    // skip duplicates
    if (answers.has(answer)) continue;

    answers.add(answer);
    equations.push({
      id: Math.random().toString(36).slice(2, 9),
      question: `${a} ${op} ${b}`,
      answer
    });
  }

  // If we couldn't reach the desired unique count (small operand range), fill remaining
  // slots by expanding the operand range slightly.
  let extraSeed = max + 1;
  while (equations.length < count) {
    const a = randInt(extraSeed, extraSeed + 6);
    const b = randInt(1, Math.max(2, extraSeed));
    const op = ops[Math.floor(Math.random() * ops.length)];
    let answer = op === '+' ? a + b : op === '-' ? Math.max(0, a - b) : a * b;
    if (answers.has(answer)) { extraSeed++; continue; }
    answers.add(answer);
    equations.push({ id: Math.random().toString(36).slice(2, 9), question: `${a} ${op} ${b}`, answer });
    extraSeed++;
  }

  return equations;
}
