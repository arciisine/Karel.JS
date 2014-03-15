require(['constants', 'jquery', 'robot', 'world', 'render', 'executor'], function(CONSTANTS, $, Robot, World, Render) {
  /**
   * App Class
   */
  function App($root) {
    this.$root = $root;
    this.world = new World($root.find('.world'));
    this.robot = new Robot(this.world, $root.find('.robot'));
    this.$canvas = $root.find('.canvas');
    this.$root.on('robot-move robot-rotate robot-blocked beeper-updated wall-updated', Render.process);
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
