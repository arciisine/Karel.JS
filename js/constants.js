/**
 * Global Constants
 */
define([], function() {

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

    for (var k in map) {
      map[k].inverse = map[map[k].inverse];
    }
  })();

  return {
    DIRECTIONS : directions,
    TILE_SIZE : 32
  };
});