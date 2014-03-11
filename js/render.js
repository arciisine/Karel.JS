define(['constants', 'jquery'], function(CONSTANTS, $) {

  var TRANSITION_EVENTS = 'webkitTransitionEnd transitionend';

  var queue = [];
  var active = false;
  var operations = {
    moveAndRotate : function moveAndRotate(data, cb) {
      var key = [
        'translate(' + data.x*CONSTANTS.TILE_SIZE + 'px, ' + data.y*CONSTANTS.TILE_SIZE +'px)',
        'rotate('+data.angle+'deg)'
      ].join(' ');

      var $node = data.node;
      $node.css('transform', key);
      $node.css('-webkit-transform', key);
      $node.on(TRANSITION_EVENTS, function done() {
        $node.off(TRANSITION_EVENTS, done);
        if (cb) cb();
      });
    },
    pause : function(delay, cb) {
      setTimeout(delay, cb);
    }
  };

  function startQueue() {
    if (!active) {
      active = true;
      processQueue();
    }
  }

  function stopQueue() {
    active = false;
  }

  function processQueue() {
    if (active && queue.length) {
      var top = queue.shift();
      top.fn(top.data, processQueue);
    } else {
      stopQueue();
    }
  }

  function receiveCommand(e, type, data) {
    queue.push({fn:operations[type], data:data});
    setTimeout(startQueue, 1);
  }

  return {
    receive : receiveCommand
  };
});