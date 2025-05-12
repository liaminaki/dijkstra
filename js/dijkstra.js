class Dijkstra {
  constructor(grid) {
    this.grid = grid;
    this.unvisited = [];
    this.steps = [];
    this.currentStep = 0;
    this.isPlaying = false;
    this.playInterval = null;
  }

  async findPathSteps() {
    const { startNode, endNode } = this.grid;
    startNode.distance = 0;
    this.unvisited = this.grid.grid.flat();
    this.steps = [];
    this.currentStep = 0;

    while (this.unvisited.length) {
      this.unvisited.sort((a, b) => a.distance - b.distance);
      const current = this.unvisited.shift();
      if (current.isWall) continue;
      if (current.distance === Infinity) break;

      current.visited = true;
      this.steps.push({
        type: 'visit',
        x: current.x,
        y: current.y,
        isStart: current.isStart,
        isEnd: current.isEnd
      });

      if (current === endNode) {
        // Build path steps
        let pathNode = current.previous;
        const pathSteps = [];
        while (pathNode && !pathNode.isStart) {
          pathSteps.push({
            type: 'path',
            x: pathNode.x,
            y: pathNode.y
          });
          pathNode = pathNode.previous;
        }
        this.steps = this.steps.concat(pathSteps.reverse());
        break;
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

  // Render a specific step
  renderStep(stepIdx) {
    // Reset grid visuals
    document.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('visited', 'path');
    });
    // Apply all steps up to stepIdx
    for (let i = 0; i <= stepIdx; i++) {
      const step = this.steps[i];
      if (!step) continue;
      const cell = document.querySelector(`[data-x="${step.x}"][data-y="${step.y}"]`);
      if (step.type === 'visit' && !step.isStart && !step.isEnd) {
        cell.classList.add('visited');
      }
      if (step.type === 'path') {
        cell.classList.add('path');
      }
    }
  }

  play(speed = 50, onFinish) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.playInterval = setInterval(() => {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
        this.renderStep(this.currentStep);
      } else {
        this.pause();
        if (onFinish) onFinish();
      }
    }, speed);
  }

  pause() {
    this.isPlaying = false;
    if (this.playInterval) clearInterval(this.playInterval);
  }

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.renderStep(this.currentStep);
    }
  }

  prev() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep(this.currentStep);
    }
  }

  resetSteps() {
    this.currentStep = 0;
    this.renderStep(0);
  }

  clearSteps() {
    this.steps = [];
    this.currentStep = 0;
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
}

export default Dijkstra;