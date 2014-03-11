define(['constants', 'jquery'], function(CONSTANTS, $) {

  var TRANSITION_EVENTS = 'webkitTransitionEnd transitionend';
  var queue = [];
  var pending = false;

  var sound = {
    denied : '/sound/denied.ogg'
  };

  function initSounds() {
    for (var k in sound) {
      var url = sound[k];
      sound[k] = new Audio(url);
      $('body').append(sound[k]);
    }
  }

  function moveAndRotate(data, cls, cb) {
    var key = [
      'translate(' + data.x * CONSTANTS.TILE_SIZE + 'px, ' + data.y * CONSTANTS.TILE_SIZE +'px)',
      'rotate(' + data.angle + 'deg)'
    ].join(' ');

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
          if (world.hasWall(x, y, dir)) {
            $cell.addClass('wall-'+dir.name);
          }
        }
        $row.append($cell);
      }
      $canvas.append($row);
    }
  }

  function processQueue() {
    if (!pending) {
      if (queue.length) {
        pending = true;
        var top = queue.shift();
        console.log(top.fn, top.data);
        top.fn(top.data, function() {
          pending = false;
          window.requestAnimationFrame(processQueue);
        });
      }
    }
  }

  function process(e, data) {
    queue.push({fn:operations[e.type], data:data});
    window.requestAnimationFrame(processQueue);
  }

  $(function() {
    processQueue();
    initSounds();
  });

  return {
    process : process,
    drawWorld : drawWorld
  };
});