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

      data.node.addClass('moving');
      data.node.css('transform', key);
      data.node.css('-webkit-transform', key);
      data.node.on(TRANSITION_EVENTS, function done() {
        data.node.off(TRANSITION_EVENTS, done);
        data.node.removeClass('moving');
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