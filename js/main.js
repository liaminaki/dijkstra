import Grid from './grid.js';
import Dijkstra from './dijkstra.js';

let gridSize = 10;
let grid = new Grid(gridSize);
let placingMode = 'start';
let algo = null;

function bindGridEvents() {
  document.getElementById('grid').onclick = (e) => {
    if (!e.target.classList.contains('cell')) return;
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const node = grid.getNode(x, y);

    if (placingMode === 'start') {
      if (grid.startNode) {
        document.querySelector('.start')?.classList.remove('start');
        grid.startNode.isStart = false;
      }
      e.target.classList.add('start');
      node.isStart = true;
      grid.startNode = node;
    } else if (placingMode === 'end') {
      if (grid.endNode) {
        document.querySelector('.end')?.classList.remove('end');
        grid.endNode.isEnd = false;
      }
      e.target.classList.add('end');
      node.isEnd = true;
      grid.endNode = node;
    } else if (!node.isStart && !node.isEnd) {
      node.isWall = !node.isWall;
      e.target.classList.toggle('wall');
    }
  };
}

function bindControlEvents() {
  document.querySelectorAll('input[name="placingMode"]').forEach(radio => {
    radio.onchange = () => {
      if (radio.checked) placingMode = radio.value;
    };
  });

  document.getElementById('clear').onclick = () => {
    grid.reset();
    grid.startNode = null;
    grid.endNode = null;

    if (algo) {
      algo.clearSteps();
      algo = null;
    }
  };

  document.getElementById('findPath').onclick = async () => {
    if (!grid.startNode || !grid.endNode) {
      alert("Please set both start and end points.");
      return;
    }

    if (!algo){
      algo = new Dijkstra(grid);
      await algo.findPathSteps();
    }

    // Render the last step (full solution)
    algo.currentStep = algo.steps.length - 1;
    algo.renderStep(algo.currentStep);
  };

  document.getElementById('play').onclick = async () => {
    if (!grid.startNode || !grid.endNode) {
      alert("Please set both start and end points.");
      return;
    }
    if (!algo) {
      algo = new Dijkstra(grid);
      await algo.findPathSteps();
      algo.currentStep = 0;
      algo.renderStep(algo.currentStep);
    }
    algo.play(50);
  };

  document.getElementById('pause').onclick = () => {
    if (algo) algo.pause();
  };

  document.getElementById('next').onclick = () => {
    if (algo) algo.next();
  };

  document.getElementById('prev').onclick = () => {
    if (algo) algo.prev();
  };

  document.getElementById('resizeGrid').onclick = () => {
    const input = document.getElementById('gridSize');
    let newSize = parseInt(input.value);
    if (isNaN(newSize) || newSize < 2) newSize = 2;
    if (newSize > 26) newSize = 26;
    gridSize = newSize;
    grid = new Grid(gridSize);
    placingMode = 'wall';
    bindGridEvents();
  };
}

// Initial setup
bindGridEvents();
bindControlEvents();