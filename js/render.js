define(['constants', 'jquery', 'util'], function(CONSTANTS, $, Util) {

  var TRANSITION_EVENTS = 'webkitTransitionEnd transitionend';
  var $world = null;
  var $worldCanvas = null;
  var $robot = null;
  var $beepers = {};
  var $cells = {};
  var sound = {
    denied : '/sound/denied.ogg'
  };

  function init($_world) {
    $world = $_world;
    $worldCanvas = $_world.find('.canvas');
    $robot = $_world.find('.robot');

    for (var k in sound) {
      var url = sound[k];
      sound[k] = new Audio(url);
      $('body').append(sound[k]);
    }
  }

  function buildTranslate(data) {
    return 'translate(' + data.x * CONSTANTS.TILE_SIZE + 'px, ' + data.y * CONSTANTS.TILE_SIZE +'px)';
  }

  function moveAndRotate($node, data, cls, cb) {
    var key = [buildTranslate(data)];
    if (data.hasOwnProperty('angle')) {
      key.push('rotate(' + data.angle + 'deg)');
    }

    key = key.join(' ');

    $node.addClass(cls);
    $node.css('transform', key);
    $node.css('-webkit-transform', key);
    $node.on(TRANSITION_EVENTS, function done() {
      $node.off(TRANSITION_EVENTS, done);
      $node.removeClass(cls);
      if (cb) cb();
    });
  }

  function playSound(name, cb) {
    sound[name].load();
    sound[name].play();
    sound[name].addEventListener('ended', function done(e) {
      sound[name].removeEventListener('ended', done, false);
      if (cb) cb();
    }, false);
  }

  var operations = {
    'robot-move' : function move(data, cb) {
      moveAndRotate($robot, data, 'moving', cb);
    },
    'robot-rotate' : function rotate(data, cb) {
      moveAndRotate($robot, data, 'rotating', cb);
    },
    'robot-blocked' : function blocked(robot, cb) {
      playSound('denied', cb);
    },
    'wall-updated' : function updated(data, cb) {
      var $cell = $cells[Util.positionString(data)];
      if (data.state) {
        $cell.addClass('wall-'+data.dir.name);
      } else {
        $cell.removeClass('wall-'+data.dir.name);
      }
      if (cb) cb();
    },
    'beeper-updated': function updated(data, cb) {
      var pos = Util.positionString(data);

      if (data.count == 0 && $beepers[pos]) {
        $beepers[pos].remove();
        delete $beepers[pos];
      } else if (data.count && !$beepers[pos]) {
        var key = buildTranslate(data);
        $beepers[pos] = $('<div/>').addClass('beeper');
        $beepers[pos].css('transform', key);
        $beepers[pos].css('-webkit-transform', key);
        $worldCanvas.append($beepers[pos]);
      }
      if (cb) cb();
    },
    'pause' : function(delay, cb) {
      setTimeout(delay, cb);
    }
  };

  function drawWorld(world) {
    $cells = {};
    $worldCanvas.empty();

    var ry = world.range.y[1];
    var rx = world.range.x[1];

    for (var y = 0; y < ry; y++) {
      var $row = $('<div/>').addClass('row');
      for (var x = 0; x < rx; x++) {
        var $cell = $('<div/>').addClass('cell');
        $cells[Util.positionString({x:x, y:y})] = $cell;
        $row.append($cell);
      }
      $worldCanvas.append($row);
    }
  }

  function process(op, data, done) {
    operations[op](data, done);
  }

  return {
    init : init,
    process : process,
    drawWorld : drawWorld
  };
});