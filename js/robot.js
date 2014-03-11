/**
 * Robot Class
 */
define(['constants', 'util', 'jquery'], function(CONSTANTS, Util, $) {
  function Robot($bot) {
    var self = this;
    this.$node = $bot;
    this.$node.data().robot = this;
    this.position = {x:0,y:0};
    this.orientation = CONSTANTS.DIRECTIONS.UP;
    this.beepers = 0;
    this.angle = 0;
  }

  $.extend(Robot.prototype, {
    getWorld : function() {
      return this.$node.parents('.world').data().world;
    },
    render : function() {
      this.$node.trigger('render', [
        'moveAndRotate',
        {
          node : this.$node,
          x:this.position.x,
          y:this.position.y,
          angle:this.angle
        }
      ]);
    },
    setPosition : function(x, y) {
      this.position.x = x;
      this.position.y = y;
      this.render();
    },
    turnLeft : function() {
      var k = (this.orientation.key - 1);
      if (k < 0) {
        k = CONSTANTS.DIRECTIONS.UPPER;
      } else if (k > CONSTANTS.DIRECTIONS.UPPER) {
        k = 0;
      }
      this.orientation = CONSTANTS.DIRECTIONS.MAP[k];

      this.angle -= 90;
      this.render();
    },
    isBlocked : function() {
      return this.getWorld().hasWall(this.position.x, this.position.y, this.orientation);
    },
    move : function() {
      var moving = !this.isBlocked();
      if (moving) {
        var axis = this.orientation.axis;
        var delta = this.orientation.delta;

        this.setPosition(
          this.position.x + (axis === 'x' ? delta : 0),
          this.position.y + (axis === 'y' ? delta : 0));
      }

      return moving;
    },
    pickupBeeper : function() {
      if (this.getWorld().getBeeper(this.toPositionString())) {
        Util.change(this, 'beepers', 1);
      }
    },
    dropBeeper : function() {
      if (Util.change(this, 'beepers', -1)) {
        this.getWorld().putBeeper(this.toPositionString());
      }
    },
    toPositionString : function(dir) {
      var p = this.position;
      return Util.positionString(p.x, p.y, dir ? this.orientation.key : undefined);
    }
  });

  return Robot;
});