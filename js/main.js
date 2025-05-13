import Grid from './grid.js';
import Dijkstra from './dijkstra.js';

let gridSize = 10;
let grid = new Grid(gridSize);
let placingMode = 'start';
let algo = null;
let speed = 50;
const minMs = 10;
const maxMs = 500;

// --- DOM Elements (global) ---
const speedRange = document.getElementById('speedRange');
const findPathBtn = document.getElementById('findPath');
const clearBtn = document.getElementById('clear');
const lastBtn = document.getElementById('last');
const firstBtn = document.getElementById('first');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const gridSizeInput = document.getElementById('gridSize');
const hint = document.getElementById('findPathHint');
const placingModeRadios = document.querySelectorAll('input[name="placingMode"]');

function getSpeedFromSlider(val) {
  // val: 0 (slowest) to 100 (fastest)
  // Reverse: left = maxMs, right = minMs
  return Math.round(maxMs - (val / 100) * (maxMs - minMs));
}

function bindGridEvents() {
  document.getElementById('grid').onclick = (e) => {
    if (!e.target.classList.contains('cell')) return;
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const node = grid.getNode(x, y);

    if (placingMode === 'start') {
      if (grid.startNode) {
        const prevCell = document.querySelector('.start');
        if (prevCell) {
          grid.startNode.isStart = false;
          prevCell.classList.remove('start');
          prevCell.title = '';
        }
      }
      e.target.classList.add('start');
      node.isStart = true;
      grid.startNode = node;
      e.target.title = 'Start';
      updateButtons(false);
    } else if (placingMode === 'end') {
      if (grid.endNode) {
        const prevCell = document.querySelector('.end');
        if (prevCell) {
          grid.endNode.isEnd = false;
          prevCell.classList.remove('end');
          prevCell.title = '';
        }
      }
      e.target.classList.add('end');
      node.isEnd = true;
      grid.endNode = node;
      e.target.title = 'End';
      updateButtons(false);
    } else if (!node.isStart && !node.isEnd) {
      node.isWall = !node.isWall;
      e.target.classList.toggle('wall');
      e.target.title = node.isWall ? 'Wall' : '';
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
  } else if (algo && algo.steps.length > 0 && algo.currentStep < algo.steps.length - 1 && algo.currentStep > 0) {
    findPathBtn.textContent = "Continue";
    findPathBtn.disabled = false;
    hint.style.display = "none";
  } else {
    findPathBtn.textContent = "Find Shortest Path";
    findPathBtn.disabled = false;
    hint.style.display = "none";
  }
}

function updatePlaybackBtns() {
  const noEndpoints = !grid.startNode || !grid.endNode;
  const disablePlayback = noEndpoints || !algo || !algo.steps || algo.steps.length === 0;
  const isDone = algo && algo.currentStep === algo.steps.length - 1;

  firstBtn.disabled = disablePlayback || algo.currentStep === 0;
  prevBtn.disabled = disablePlayback || algo.currentStep === 0;
  nextBtn.disabled = disablePlayback || isDone;
  lastBtn.disabled = disablePlayback || isDone;
}

function updateButtons(isPlaying) {
  updateFindPathBtn(isPlaying);
  updatePlaybackBtns();
}

function bindControlEvents() {
  placingModeRadios.forEach(radio => {
    radio.onchange = () => {
      if (radio.checked) placingMode = radio.value;
    };
  });

  // Find Path (Play/Pause)
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
      algo.play(speed, () => {
        isPlaying = false;
        updateButtons(isPlaying);
      });
      isPlaying = true;
    } else {
      algo.pause();
      isPlaying = false;
    }
    updateButtons(isPlaying);
  };

  clearBtn.onclick = () => {
    grid.reset();
    grid.startNode = null;
    grid.endNode = null;
    if (algo) {
      algo.clearSteps();
      algo = null;
    }
    isPlaying = false;
    updateButtons(isPlaying);
  };

  lastBtn.onclick = async () => {
    await renderLastStep();
    isPlaying = false;
    updateButtons(isPlaying);
  };

  firstBtn.onclick = () => {
    if (algo && algo.steps.length > 0) {
      algo.currentStep = 0;
      algo.renderStep(0);
      isPlaying = false;
      updateButtons(isPlaying);
    }
  };

  nextBtn.onclick = () => {
    if (algo) {
      algo.next();
      isPlaying = false;
      updateButtons(isPlaying);
    }
  };

  prevBtn.onclick = () => {
    if (algo) {
      algo.prev();
      isPlaying = false;
      updateButtons(isPlaying);
    }
  };

  gridSizeInput.addEventListener('input', () => {
    let newSize = parseInt(gridSizeInput.value);
    if (isNaN(newSize) || newSize < 2) newSize = 2;
    if (newSize > 26) newSize = 26;
    gridSize = newSize;
    grid = new Grid(gridSize);
    bindGridEvents();
    isPlaying = false;
    updateButtons(isPlaying);
  });

  // Speed slider event
  speedRange.addEventListener('input', (e) => {
    speed = getSpeedFromSlider(e.target.value);

    // If currently playing, restart with new speed
    if (isPlaying && algo) {
      algo.pause();
      algo.play(speed, () => {
        isPlaying = false;
        updateButtons(isPlaying);
      });
    }
  });
}

// Initial setup
bindGridEvents();
bindControlEvents();
updateButtons(false);