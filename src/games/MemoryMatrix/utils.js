// utils.js
// Generate a random pattern of unique indices for a grid of given size
export function generatePattern(size, count) {
  const pattern = new Set();
  while (pattern.size < count) {
    const index = Math.floor(Math.random() * size * size);
    pattern.add(index);
  }
  return Array.from(pattern);
}
