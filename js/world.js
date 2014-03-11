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
    render : function() {
      this.$canvas.empty();

      var ry = this.range.y[1];
      var rx = this.range.x[1];

      for (var y = 0; y < ry; y++) {
        var $row = $('<div/>').addClass('row');
        for (var x = 0; x < rx; x++) {
          var $cell = $('<div/>').addClass('cell');
          for (var k in CONSTANTS.DIRECTIONS) {
            var dir = CONSTANTS.DIRECTIONS[k];
            if (this.hasWall(x, y, dir)) {
              $cell.addClass('wall-'+dir.name);
            }
          }
          $row.append($cell);
        }
        this.$canvas.append($row);
      }
    },
    updateBeeper : function(position, delta) {
      Util.toDefault(this.beepers, position, 0);
      return Util.change(this.beepers, position, delta);
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
      return this.walls[Util.positionString(x,y,dir.key)] === true;
    }
  });

  return World;
});