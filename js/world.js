/**
 * World Class
 */
define(['constants', 'util', 'jquery'], function(CONSTANTS, Util, $) {

  function World(x, y) {
    this.beepers = {};
    this.walls = {};

    this.range = {
      x : [0, x],
      y : [0, y]
    };
  }

  $.extend(World.prototype, {
    updateBeeper : function(pos, delta) {
      var posStr = Util.positionString(pos);
      Util.toDefault(this.beepers, posStr, 0);
      return Util.change(this.beepers, posStr, delta);
    },
    countBeeper : function(position) {
      var val = this.beepers[Util.positionString(position)];
      return typeof val === 'number' ? val : 0;
    },
    takeBeeper : function(position) {
      return this.updateBeeper(position, -1);
    },
    putBeeper : function(position) {
      return this.updateBeeper(position, 1);
    },
    hasBeeper : function(position) {
      return this.countBeeper(position) > 0;
    },
    setWall : function(pos, dir, st) {
      if (typeof dir === 'string') {
        dir = CONSTANTS.DIRECTIONS[dir.toUpperCase()];
      }

      var positions = [];

      if (Util.isIn(pos.x, this.range.x) && Util.isIn(pos.y, this.range.y)) {
        var self = this;
        var flag = st === true;
        var tmp = $.extend({dir:dir, state:flag}, pos);
        var dest = $.extend({}, tmp);
        positions.push(tmp);

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
        });
      }

      return positions;
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