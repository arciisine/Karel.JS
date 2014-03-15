require(['constants', 'jquery', 'robot', 'world', 'executor', 'render'], function(CONSTANTS, $, Robot, World, Executor, Render) {
  /**
   * App Class
   */
  function App($root) {
    var self = this;
    this.$root = $root;
    this.executor = new Executor($root.find('.code'));
    this.world = new World($root.find('.world'));
    this.robot = new Robot(this.world, $root.find('.robot'));
    this.$canvas = $root.find('.canvas');
    this.$root.on('robot-move robot-rotate robot-blocked beeper-updated wall-updated', Render.process);
    this.$root.on('execute', function(e, fn) {
      fn(self.robot);
    })
  }

  $.extend(App.prototype, {
    init : function(cb) {
      Render.init(this.$canvas);
      Render.drawWorld(this.world);
      cb(Render.ready);
    }
  });

  var karel = window.karel = new App($('body'));

  karel.init(function(cb) {
    for (var i = 0; i < 100; i++) {
      karel.world.setWall({
        x : Math.floor(Math.random() * karel.world.range.x[1]),
        y : Math.floor(Math.random() * karel.world.range.y[1])
      }, CONSTANTS.DIRECTIONS.MAP[Math.floor(Math.random() * 4)], true);
    }
    cb();
  });
});
