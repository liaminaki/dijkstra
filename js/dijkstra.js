class Dijkstra {
  constructor(grid) {
    this.grid = grid;
    this.unvisited = [];
  }

  async findPath() {
    const { startNode, endNode } = this.grid;
    startNode.distance = 0;
    this.unvisited = this.grid.grid.flat();

    while (this.unvisited.length) {
      this.unvisited.sort((a, b) => a.distance - b.distance);
      const current = this.unvisited.shift();
      if (current.isWall) continue;
      if (current.distance === Infinity) break;

      current.visited = true;
      const cell = document.querySelector(`[data-x="${current.x}"][data-y="${current.y}"]`);
      if (!current.isStart && !current.isEnd) {
        cell.classList.add('visited');
        await new Promise(r => setTimeout(r, 30));
      }

      if (current === endNode) {
        this.drawPath(current);
        return;
      }

      this.getNeighbors(current).forEach(neighbor => {
        const dx = Math.abs(neighbor.x - current.x);
        const dy = Math.abs(neighbor.y - current.y);
        const moveCost = (dx === 1 && dy === 1) ? Math.SQRT2 : 1;
        const alt = current.distance + moveCost;
        if (alt < neighbor.distance) {
          neighbor.distance = alt;
          neighbor.previous = current;
        }
      });
    }
  }

  getNeighbors(node) {
    const dirs = [
      [0, 1],   // down
      [1, 0],   // right
      [-1, 0],  // left
      [0, -1],  // up
      [1, 1],   // down-right
      [-1, 1],  // down-left
      [1, -1],  // up-right
      [-1, -1]  // up-left
    ];
    const neighbors = [];
    for (const [dx, dy] of dirs) {
      const x = node.x + dx;
      const y = node.y + dy;
      if (x >= 0 && y >= 0 && x < this.grid.size && y < this.grid.size) {
        neighbors.push(this.grid.getNode(x, y));
      }
    }
    return neighbors;
  }

  async drawPath(endNode) {
    let current = endNode.previous;
    while (current && !current.isStart) {
      const cell = document.querySelector(`[data-x="${current.x}"][data-y="${current.y}"]`);
      cell.classList.add('path');
      await new Promise(r => setTimeout(r, 50));
      current = current.previous;
    }
  }
}
export default Dijkstra;