function turnRight() {
  turnLeft();
  turnLeft();
  turnLeft();
}

function moveTwice() {
  move();
  move();
}

function weird() {
  turnRight();
  move();
  turnRight();
  moveTwice();
}

weird();