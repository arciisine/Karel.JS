/**
 * Robot Class
 */
define(['constants', 'util', 'jquery'], function(CONSTANTS, Util, $) {
  function Robot(world) {
    this.world = world;
    this.position = {x:0,y:0,angle:0};
    this.orientation = CONSTANTS.DIRECTIONS.UP;
    this.beepers = 10;
  }

  $.extend(Robot.prototype, {
    turnLeft : function() {
      var k = (this.orientation.key - 1);
      if (k < 0) {
        k = CONSTANTS.DIRECTIONS.UPPER;
      } else if (k > CONSTANTS.DIRECTIONS.UPPER) {
        k = 0;
      }
      this.orientation = CONSTANTS.DIRECTIONS.MAP[k];

      this.position.angle -= 90;
    },
    isBlocked : function() {
      return this.world.hasWall(this.position, this.orientation);
    },
    hasBeeper : function() {
      return this.world.hasBeeper(this.position);
    },
    countBeeper : function() {
      return this.world.countBeeper(this.position);
    },
    move : function() {
      var moving = !this.isBlocked();
      if (moving) {
        var axis = this.orientation.axis;
        var delta = this.orientation.delta;

        this.position.x = this.position.x + (axis === 'x' ? delta : 0);
        this.position.y = this.position.y + (axis === 'y' ? delta : 0);
      }

      return moving;
    },
    pickBeeper : function() {
      var didPick = this.world.takeBeeper(this.position);
      if (didPick) {
        Util.change(this, 'beepers', 1);
      }
      return didPick;
    },
    putBeeper : function() {
      var didDrop = Util.change(this, 'beepers', -1);
      if (didDrop) {
        this.world.putBeeper(this.position);
      }
      return didDrop;
    }
  });

  return Robot;
});