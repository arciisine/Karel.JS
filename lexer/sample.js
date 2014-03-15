function turnRight() {
  turnLeft();
  turnLeft();
  turnLeft();
}

function turnAround() {
  turnLeft();
  turnLeft();
}

function moveBack() {
  turnAround();
  move();
  turnAround();
}

function moveOrTurn() {
  if (isBlocked()) {
    turnLeft();
  } else {
    move();
  }
}

turnLeft();
moveOrTurn();