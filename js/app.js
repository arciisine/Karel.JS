/**
 * General Utilities
 */
var Util = (function() {
  function positionString(x, y, dir) {
    return '' + x + ',' + y + ',' + (dir === undefined ? '' : dir);
  }

  function bound(v, u, l) {
    return Math.max(l, Math.min(v, u));
  }

  function toDefault(obj, key, def) {
    def = (def === undefined) ? 0 : def;
    obj[key] = (typeof obj[key] !== 'number') ? def : obj[key];
    return obj[key];
  }

  function change(obj, key, delta, rng) {
    var prev = obj[key];
    rng = rng || [0, Number.MAX_VALUE];
    obj[key] = bound(obj[key] + delta, rng[1], rng[0]);
    return prev !== obj[key];
  }

  function isIn(v, rng) {
    return v >= rng[0] && v <= rng[1];
  }

  return {
    positionString : positionString,
    bound : bound,
    toDefault : toDefault,
    change : change,
    isIn : isIn
  }
})();

/**
 * Global Constants
 */
var CONSTANTS = (function() {

  var directions = {
    UP    : { key : 0, axis : 'y', delta : -1, name : 'up'   , inverse : 2 },
    RIGHT : { key : 1, axis : 'x', delta :  1, name : 'right', inverse : 3 },
    DOWN  : { key : 2, axis : 'y', delta :  1, name : 'down',  inverse : 0 },
    LEFT  : { key : 3, axis : 'x', delta : -1, name : 'left',  inverse : 1 }
  };

  (function() {
    var map = {};
    var upper = 0;
    for (var k in directions) {
      var obj = directions[k];
      map[obj.key] = obj;
      upper = Math.max(upper, obj.key);
    }
    directions.MAP = map;
    directions.UPPER = upper;
  })();

  return {
    DIRECTIONS : directions,
    TILE_SIZE : 32
  };
})();

/**
 * World Class
 */
var World = (function($, window) {

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
})(jQuery, window);

/**
 * Robot Class
 */
var Robot = (function($, window) {

  function Robot($bot) {
    var self = this;
    this.$node = $bot;
    this.$node.data().robot = this;
    this.position = {};
    this.orientation = CONSTANTS.DIRECTIONS.UP;
    this.beepers = 0;
    this.angle = 0;

    this.setPosition(0,0);
  }

  $.extend(Robot.prototype, {
    getWorld : function() {
      return this.$node.parents('.world').data().world;
    },
    render : function() {
      var key = 'translate('+this.position.x*CONSTANTS.TILE_SIZE+'px, '+this.position.y*CONSTANTS.TILE_SIZE+'px) rotate('+this.angle+'deg)';
      this.$node.css('transform', key);
      this.$node.css('-webkit-transform', key);
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
    move : function() {
      var dir = this.orientation;
      var tmp = $.extend({}, this.position);

      if (!this.getWorld().hasWall(tmp.x, tmp.y, this.orientation)) {
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

})(jQuery, window);

/**
 * App Class
 */
var App = (function($, window) {

  function App($world) {
    this.robot = null;
    this.world = null;
  }

  $.extend(App.prototype, {

  });

})(jQuery, window);