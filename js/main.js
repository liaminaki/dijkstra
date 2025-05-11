import Grid from './grid.js';
import Dijkstra from './dijkstra.js';

const gridSize = 10;
const grid = new Grid(gridSize);
let placingMode = 'wall';

document.getElementById('grid').addEventListener('click', (e) => {
  const x = parseInt(e.target.dataset.x);
  const y = parseInt(e.target.dataset.y);
  const node = grid.getNode(x, y);

  if (placingMode === 'start') {
    if (grid.startNode) {
      document.querySelector('.start').classList.remove('start');
      grid.startNode.isStart = false;
    }
    e.target.classList.add('start');
    node.isStart = true;
    grid.startNode = node;
  } else if (placingMode === 'end') {
    if (grid.endNode) {
      document.querySelector('.end').classList.remove('end');
      grid.endNode.isEnd = false;
    }
    e.target.classList.add('end');
    node.isEnd = true;
    grid.endNode = node;
  } else if (!node.isStart && !node.isEnd) {
    node.isWall = !node.isWall;
    e.target.classList.toggle('wall');
  }
});

document.getElementById('setStart').onclick = () => placingMode = 'start';
document.getElementById('setEnd').onclick = () => placingMode = 'end';
document.getElementById('clear').onclick = () => {
  grid.reset();
  grid.startNode = null;
  grid.endNode = null;
};
document.getElementById('findPath').onclick = async () => {
  if (!grid.startNode || !grid.endNode) {
    alert("Please set both start and end points.");
    return;
  }
  const algo = new Dijkstra(grid);
  await algo.findPath();
};