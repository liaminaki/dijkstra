import Node from './node.js';

class Grid {
  constructor(size) {
    this.size = size;
    this.grid = [];
    this.startNode = null;
    this.endNode = null;
    this.initGrid();
  }

  initGrid() {
    const container = document.getElementById('grid');
    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${this.size}, 40px)`;
    container.style.gridTemplateRows = `repeat(${this.size}, 40px)`;

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        container.appendChild(cell);
      }
    }
    this.grid = Array.from({ length: this.size }, (_, y) =>
      Array.from({ length: this.size }, (_, x) => new Node(x, y))
    );
  }

  getNode(x, y) {
    return this.grid[y][x];
  }

  reset() {
    document.querySelectorAll('.cell').forEach(cell => {
      cell.className = 'cell';
    });
    this.grid.forEach(row => row.forEach(n => {
      n.distance = Infinity;
      n.previous = null;
      n.visited = false;
      n.isWall = false;
      n.isStart = false;
      n.isEnd = false;
    }));
  }
}
export default Grid;