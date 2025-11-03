// utils.js
export function generateQuestion(level = 1) {
  // increase operator difficulty as level increases
  const pool = [];
  pool.push("+");
  pool.push("-");
  if (level >= 2) {
    pool.push("×");
  }
  if (level >= 4) {
    pool.push("÷");
  }

  const op = pool[Math.floor(Math.random() * pool.length)];
  const rangeBase = 6 + level * 4; // grows with level
  let a = Math.floor(Math.random() * rangeBase) + 1;
  let b = Math.floor(Math.random() * Math.max(1, rangeBase - 1)) + 1;

  // For division, make a divisible by b to avoid awkward decimals
  if (op === "÷") {
    a = a * b;
  }

  let answer;
  switch (op) {
    case "+":
      answer = a + b;
      break;
    case "-":
      answer = a - b;
      break;
    case "×":
      answer = a * b;
      break;
    case "÷":
      answer = Math.floor(a / b);
      break;
    default:
      answer = a + b;
  }

  return { question: `${a} ${op} ${b}`, answer };
}
