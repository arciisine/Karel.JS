/**
 * World Class
 */
define(['constants', 'util', 'jquery'], function(CONSTANTS, Util, $) {

  function World($world, x, y) {
    var self = this;

    this.$node = $world;
    this.$node.data().world = this;
    this.$canvas = this.$node.find('.canvas');

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
    updateBeeper : function(x, y, delta) {
      var pos = Util.positionString(x,y);
      Util.toDefault(this.beepers, pos, 0);
      var res = Util.change(this.beepers, pos, delta);

      if (res) {
        this.$node.trigger('beeper-updated', [{
          x : x,
          y : y,
          count : this.beepers[position]
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
    setWall : function(x, y, dir, st) {
      if (Util.isIn(x, this.range.x) && Util.isIn(y, this.range.y)) {
        var self = this;
        var positions = [Util.positionString(x,y,dir.key)]
        var tmp = {x : x, y : y};
        var dest = {x : x, y: y}
        Util.change(dest, dir.axis, dir.delta, this.range[dir.axis]);
        var flag = st === true;

        //Track otherside of wall (making them 2-sided)
        if (dest.x !== tmp.x || dest.y !== tmp.y) {
          positions.push(Util.positionString(dest.x, dest.y, dir.inverse));
        }

        positions.forEach(function(key) {
          self.walls[key] = flag;
        });
      }
    },
    hasWall : function(x, y, dir) {
      return this.walls[Util.positionString(x,y,dir.key)] === true
        || x >= this.range.x[1] - 1 && dir.name == 'right'
        || x <= this.range.x[0] && dir.name == 'left'
        || y >= this.range.y[1] - 1 && dir.name == 'down'
        || y <= this.range.y[0] && dir.name == 'up';
    }
  });

  return World;
});