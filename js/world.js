/**
 * World Class
 */
define(['constants', 'util', 'jquery'], function(CONSTANTS, Util, $) {

  function World($world, x, y) {
    var self = this;

    this.$node = $world;
    this.$node.data().world = this;

    this.beepers = {};
    this.walls = {};
    x = x || this.$node.data().sizeX;
    y = y || this.$node.data().sizeY;

    this.range = {
      x : [0, x],
      y : [0, y]
    };
  };

  $.extend(World.prototype, {
    updateBeeper : function(pos, delta) {
      var posStr = Util.positionString(pos);
      Util.toDefault(this.beepers, posStr, 0);
      var res = Util.change(this.beepers, posStr, delta);

      if (res) {
        this.$node.trigger('beeper-updated', [{
          x : pos.x,
          y : pos.y,
          count : this.beepers[posStr],
          node : this.$node
        }]);
      }
      return res;
    },
    takeBeeper : function(position) {
      return this.updateBeeper(position, -1);
    },
    putBeeper : function(position) {
      return this.updateBeeper(position, 1);
    },
    hasBeeper : function(position) {
      return !!this.beepers[Util.positionString(position)];
    },
    setWall : function(pos, dir, st) {
      if (typeof dir === 'string') {
        dir = CONSTANTS.DIRECTIONS[dir.toUpperCase()];
      }
      if (Util.isIn(pos.x, this.range.x) && Util.isIn(pos.y, this.range.y)) {
        var self = this;
        var positions = [Util.positionString(pos, dir.key)]
        var tmp = $.extend({}, pos);
        var dest = $.extend({}, tmp);
        Util.change(dest, dir.axis, dir.delta, this.range[dir.axis]);
        var flag = st === true;

        //Track otherside of wall (making them 2-sided)
        if (dest.x !== tmp.x || dest.y !== tmp.y) {
          positions.push(Util.positionString(dest, dir.inverse));
        }

        positions.forEach(function(key) {
          self.walls[key] = flag;
        });
      }
    },
    hasWall : function(pos, dir) {
      return this.walls[Util.positionString(pos, dir.key)] === true
        || pos.x >= this.range.x[1] - 1 && dir.name == 'right'
        || pos.x <= this.range.x[0] && dir.name == 'left'
        || pos.y >= this.range.y[1] - 1 && dir.name == 'down'
        || pos.y <= this.range.y[0] && dir.name == 'up';
    }
  });

  return World;
});