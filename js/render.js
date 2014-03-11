define(['constants', 'jquery', 'util'], function(CONSTANTS, $, Util) {

  var TRANSITION_EVENTS = 'webkitTransitionEnd transitionend';
  var queue = [];
  var pending = false;

  var sound = {
    denied : '/sound/denied.ogg'
  };
  var beepers = {};

  function buildTranslate(data) {
    return 'translate(' + data.x * CONSTANTS.TILE_SIZE + 'px, ' + data.y * CONSTANTS.TILE_SIZE +'px)';
  }

  function initSounds() {
    for (var k in sound) {
      var url = sound[k];
      sound[k] = new Audio(url);
      $('body').append(sound[k]);
    }
  }

  function moveAndRotate(data, cls, cb) {
    var key = [buildTranslate(data)];
    if (data.hasOwnProperty('angle')) {
      key.push('rotate(' + data.angle + 'deg)');
    }

    key = key.join(' ');

    data.node.addClass(cls);
    data.node.css('transform', key);
    data.node.css('-webkit-transform', key);
    data.node.on(TRANSITION_EVENTS, function done() {
      data.node.off(TRANSITION_EVENTS, done);
      data.node.removeClass(cls);
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
      moveAndRotate(data, 'moving', cb);
    },
    'robot-rotate' : function rotate(data, cb) {
      moveAndRotate(data, 'rotating', cb);
    },
    'robot-blocked' : function blocked(robot, cb) {
      playSound('denied', cb);
    },
    'beeper-updated': function updated(data, cb) {
      var pos = Util.positionString(data);

      if (data.count == 0 && beepers[pos]) {
        beepers[pos].remove();
        delete beeper[pos];
      } else if (data.count && !beepers[pos]) {
        var key = buildTranslate(data);
        beepers[pos] = $('<div/>').addClass('beeper');
        beepers[pos].css('transform', key);
        beepers[pos].css('-webkit-transform', key);
        data.node.append(beepers[pos]);
      }
      setTimeout(cb, 1);
    },
    'pause' : function(delay, cb) {
      setTimeout(delay, cb);
    }
  };

  function drawWorld($canvas, world) {
    $canvas.empty();

    var ry = world.range.y[1];
    var rx = world.range.x[1];

    for (var y = 0; y < ry; y++) {
      var $row = $('<div/>').addClass('row');
      for (var x = 0; x < rx; x++) {
        var $cell = $('<div/>').addClass('cell');
        for (var k in CONSTANTS.DIRECTIONS) {
          var dir = CONSTANTS.DIRECTIONS[k];
          if (world.hasWall({x:x, y:y}, dir)) {
            $cell.addClass('wall-'+dir.name);
          }
        }
        $row.append($cell);
      }
      $canvas.append($row);
    }
  }

  function processQueueIterate() {
    window.requestAnimationFrame(processQueue);
  }

  function processQueue() {
    if (queue.length) {
      var top = queue.shift();
      top.fn(top.data, processQueueIterate);
    } else {
      pending = false;
    }
  }

  function process(e, data) {
    queue.push({fn:operations[e.type], data:data});
    setTimeout(function() {
      if (!pending) {
        pending = true;
        processQueue();
      }
    }, 1);
  }

  $(function() {
    initSounds();
  });

  return {
    process : process,
    drawWorld : drawWorld
  };
});