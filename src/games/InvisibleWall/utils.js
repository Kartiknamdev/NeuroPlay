// utils.js
// Maze generator (recursive backtracker) + BFS shortest path

export function generateMaze(rows = 7, cols = 7) {
  // Each cell: { r, c, walls: {N: true, S: true, E: true, W: true} }
  const grid = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      r,
      c,
      walls: { N: true, S: true, E: true, W: true },
      visited: false,
    }))
  );

  const stack = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  const neighbors = (cell) => {
    const n = [];
    const { r, c } = cell;
    if (r > 0) n.push(grid[r - 1][c]); // N
    if (r < rows - 1) n.push(grid[r + 1][c]); // S
    if (c > 0) n.push(grid[r][c - 1]); // W
    if (c < cols - 1) n.push(grid[r][c + 1]); // E
    return n.filter((x) => !x.visited);
  };

  while (stack.length) {
    const current = stack[stack.length - 1];
    const nbs = neighbors(current);
    if (nbs.length === 0) {
      stack.pop();
      continue;
    }
    const next = nbs[Math.floor(Math.random() * nbs.length)];
    // remove wall between current and next
    if (next.r === current.r - 1 && next.c === current.c) {
      current.walls.N = false;
      next.walls.S = false;
    } else if (next.r === current.r + 1 && next.c === current.c) {
      current.walls.S = false;
      next.walls.N = false;
    } else if (next.c === current.c - 1 && next.r === current.r) {
      current.walls.W = false;
      next.walls.E = false;
    } else if (next.c === current.c + 1 && next.r === current.r) {
      current.walls.E = false;
      next.walls.W = false;
    }
    next.visited = true;
    stack.push(next);
  }

  // cleanup visited flags
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      delete grid[r][c].visited;
    }
  }

  return grid;
}

// BFS for shortest path from start to end (returns array of {r,c})
export function findShortestPath(grid, start = { r: 0, c: 0 }, goal) {
  const rows = grid.length;
  const cols = grid[0].length;
  const key = (r, c) => `${r},${c}`;
  const q = [];
  const cameFrom = new Map();
  const visited = new Set();

  q.push(start);
  visited.add(key(start.r, start.c));
  cameFrom.set(key(start.r, start.c), null);

  while (q.length) {
    const cur = q.shift();
    if (cur.r === goal.r && cur.c === goal.c) break;

    const cell = grid[cur.r][cur.c];
    // try neighbors where there's NO wall
    const neighbors = [];
    if (!cell.walls.N && cur.r > 0) neighbors.push({ r: cur.r - 1, c: cur.c });
    if (!cell.walls.S && cur.r < rows - 1) neighbors.push({ r: cur.r + 1, c: cur.c });
    if (!cell.walls.W && cur.c > 0) neighbors.push({ r: cur.r, c: cur.c - 1 });
    if (!cell.walls.E && cur.c < cols - 1) neighbors.push({ r: cur.r, c: cur.c + 1 });

    for (const nb of neighbors) {
      const k = key(nb.r, nb.c);
      if (visited.has(k)) continue;
      visited.add(k);
      cameFrom.set(k, cur);
      q.push(nb);
    }
  }

  // Reconstruct
  const path = [];
  const goalKey = key(goal.r, goal.c);
  if (!cameFrom.has(goalKey)) return []; // unreachable (shouldn't happen)
  let curKey = goalKey;
  while (curKey) {
    const [r, c] = curKey.split(",").map(Number);
    path.push({ r, c });
    curKey = (() => {
      const prev = cameFrom.get(curKey);
      return prev ? `${prev.r},${prev.c}` : null;
    })();
  }
  return path.reverse();
}
