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
      if (!this.isBlocked()) {
        var dir = this.orientation;
        var tmp = $.extend({}, this.position);
        Util.change(tmp, dir.axis, dir.delta, this.getWorld().range[dir.axis]);
        this.setPosition(tmp.x, tmp.y);
      }
    },
    pickupBeeper : function() {
      if (this.getWorld().updateBeeper(this.toPositionString(), -1)) {
        Util.change(this, 'beepers', 1);
      }
    },
    dropBeeper : function() {
      if (Util.change(this, 'beepers', -1)) {
        this.getWorld().updateBeeper(this.toPositionString(), 1);
      }
    },
    toPositionString : function(dir) {
      var p = this.position;
      return Util.positionString(p.x, p.y, dir ? this.orientation.key : undefined);
    }
  });

  return Robot;
});