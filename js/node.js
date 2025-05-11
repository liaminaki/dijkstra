class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isStart = false;
    this.isEnd = false;
    this.isWall = false;
    this.distance = Infinity;
    this.previous = null;
    this.visited = false;
  }
}
export default Node;