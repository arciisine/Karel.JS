/**
 * World Class
 */
define(['constants', 'util', 'jquery'], function(CONSTANTS, Util, $) {

  function World($world, x, y) {
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
  }

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
        var flag = st === true;
        var tmp = $.extend({dir:dir, state:flag}, pos);
        var dest = $.extend({}, tmp);
        var positions = [tmp]

        Util.change(dest, dir.axis, dir.delta, this.range[dir.axis]);

        //Track otherside of wall (making them 2-sided)
        if ((dest.x !== tmp.x || dest.y !== tmp.y)
          && Util.isIn(dest.x, this.range.x)
          && Util.isIn(dest.y, this.range.y)
        ) {
          positions.push($.extend({}, dest, {dir:dir.inverse}));
        }

        positions.forEach(function(obj) {
          self.walls[Util.positionString(obj, obj.dir)] = flag;
          self.$node.trigger('wall-updated', obj)
        });
      }
    },
    hasWall : function(pos, dir) {
      return this.walls[Util.positionString(pos, dir)] === true
        || pos.x >= this.range.x[1] - 1 && dir.name == 'right'
        || pos.x <= this.range.x[0] && dir.name == 'left'
        || pos.y >= this.range.y[1] - 1 && dir.name == 'down'
        || pos.y <= this.range.y[0] && dir.name == 'up';
    }
  });

  return World;
});