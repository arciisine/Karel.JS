/**
 * Robot Class
 */
define(['constants', 'util', 'jquery'], function(CONSTANTS, Util, $) {
  function Robot(world, $bot) {
    var self = this;
    this.world = world;
    this.$node = $bot;
    this.position = {x:0,y:0,angle:0};
    this.orientation = CONSTANTS.DIRECTIONS.UP;
    this.beepers = 0;
  }

  $.extend(Robot.prototype, {
    setPosition : function(x, y) {
      this.position.x = x;
      this.position.y = y;
      this.$node.trigger('robot-move', [$.extend({}, this.position, {
        node : this.$node
      })]);
    },
    turnLeft : function() {
      var k = (this.orientation.key - 1);
      if (k < 0) {
        k = CONSTANTS.DIRECTIONS.UPPER;
      } else if (k > CONSTANTS.DIRECTIONS.UPPER) {
        k = 0;
      }
      this.orientation = CONSTANTS.DIRECTIONS.MAP[k];

      this.position.angle -= 90;
      this.$node.trigger('robot-rotate', [$.extend({}, this.position, {
        node : this.$node
      })]);
    },
    isBlocked : function() {
      return this.world.hasWall(this.position.x, this.position.y, this.orientation);
    },
    move : function() {
      var moving = !this.isBlocked();
      if (moving) {
        var axis = this.orientation.axis;
        var delta = this.orientation.delta;

        this.setPosition(
          this.position.x + (axis === 'x' ? delta : 0),
          this.position.y + (axis === 'y' ? delta : 0));

      } else {
        this.$node.trigger('robot-blocked', [this]);
      }

      return moving;
    },
    pickupBeeper : function() {
      if (this.world.takeBeeper(this.position.x, this.position.y)) {
        Util.change(this, 'beepers', 1);
      }
    },
    dropBeeper : function() {
      if (Util.change(this, 'beepers', -1)) {
        this.world.putBeeper(this.position.x, this.position.y);
      }
    }
  });

  return Robot;
});