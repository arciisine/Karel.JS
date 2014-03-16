function turnRight() {
  turnLeft();
  turnLeft();
  turnLeft();
}

function moveN(n) {
  if (n > 0) {
    moveN(n - 1);
  }
}

function weird() {
  turnRight();
  move();
  turnRight();
  moveN(2);
}

weird();