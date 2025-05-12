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
      updateFindPathBtn(false);
    } else if (placingMode === 'end') {
      if (grid.endNode) {
        document.querySelector('.end')?.classList.remove('end');
        grid.endNode.isEnd = false;
      }
      e.target.classList.add('end');
      node.isEnd = true;
      grid.endNode = node;
      updateFindPathBtn(false);
    } else if (!node.isStart && !node.isEnd) {
      node.isWall = !node.isWall;
      e.target.classList.toggle('wall');
    }
  };
}

// Helper to render the last step (full solution)
async function renderLastStep() {
  if (!grid.startNode || !grid.endNode) {
    alert("Please set both start and end points.");
    return;
  }
  if (!algo) {
    algo = new Dijkstra(grid);
    await algo.findPathSteps();
  }
  algo.currentStep = algo.steps.length - 1;
  algo.renderStep(algo.currentStep);
}

function updateFindPathBtn(isPlaying) {
  const findPathBtn = document.getElementById('findPath');
  const hint = document.getElementById('findPathHint');
  const noEndpoints = !grid.startNode || !grid.endNode;
  const isDone = algo && algo.currentStep === algo.steps.length - 1;

  if (isPlaying) {
    findPathBtn.textContent = "Pause";
    findPathBtn.disabled = false;
    hint.style.display = "none";
  } else if (noEndpoints) {
    findPathBtn.textContent = "Find Shortest Path";
    findPathBtn.disabled = true;
    hint.style.display = "block";
  } else if (isDone) {
    findPathBtn.textContent = "Done";
    findPathBtn.disabled = true;
    hint.style.display = "none";
  } else if (algo && algo.steps.length > 0 && algo.currentStep < algo.steps.length - 1) {
    findPathBtn.textContent = "Continue";
    findPathBtn.disabled = false;
    hint.style.display = "none";
  } else {
    findPathBtn.textContent = "Find Shortest Path";
    findPathBtn.disabled = false;
    hint.style.display = "none";
  }
}

function bindControlEvents() {
  document.querySelectorAll('input[name="placingMode"]').forEach(radio => {
    radio.onchange = () => {
      if (radio.checked) placingMode = radio.value;
    };
  });

  const findPathBtn = document.getElementById('findPath');
  let isPlaying = false;

  findPathBtn.onclick = async () => {
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
    if (!isPlaying) {
      algo.play(50, () => {
        isPlaying = false;
        updateFindPathBtn(isPlaying);
      });
      isPlaying = true;
    } else {
      algo.pause();
      isPlaying = false;
    }
    updateFindPathBtn(isPlaying);
  };

  document.getElementById('clear').onclick = () => {
    grid.reset();
    grid.startNode = null;
    grid.endNode = null;
    if (algo) {
      algo.clearSteps();
      algo = null;
    }
    isPlaying = false;
    updateFindPathBtn(isPlaying);
  };

  document.getElementById('last').onclick = async () => {
    await renderLastStep();
    isPlaying = false;
    updateFindPathBtn(isPlaying);
  };

  document.getElementById('first').onclick = () => {
    if (algo && algo.steps.length > 0) {
      algo.currentStep = 0;
      algo.renderStep(0);
      isPlaying = false;
      updateFindPathBtn(isPlaying);
    }
  };

  document.getElementById('next').onclick = () => {
    if (algo) {
      algo.next();
      isPlaying = false;
      updateFindPathBtn(isPlaying);
    }
  };

  document.getElementById('prev').onclick = () => {
    if (algo) {
      algo.prev();
      isPlaying = false;
      updateFindPathBtn(isPlaying);
    }
  };

  document.getElementById('gridSize').addEventListener('input', () => {
    let newSize = parseInt(document.getElementById('gridSize').value);
    if (isNaN(newSize) || newSize < 2) newSize = 2;
    if (newSize > 26) newSize = 26;
    gridSize = newSize;
    grid = new Grid(gridSize);
    bindGridEvents();
    isPlaying = false;
    updateFindPathBtn(isPlaying);
  });
}

// Initial setup
bindGridEvents();
bindControlEvents();
updateFindPathBtn(false);