require(['constants', 'jquery', 'robot', 'world', 'render'], function(CONSTANTS, $, Robot, World, Render) {
  /**
   * App Class
   */
  function App($root) {
    this.$root = $root;
    this.world = new World($root.find('.world'));
    this.robot = new Robot(this.world, $root.find('.robot'));
    this.$canvas = $root.find('.canvas');;
    this.$root.on('robot-move robot-rotate robot-blocked beeper-updated', Render.process);
  }

  $.extend(App.prototype, {
    ready : function() {
      Render.drawWorld(this.$canvas, this.world);
    }
  });

  var karel = window.karel = new App($('body'));
  for (var i = 2; i < 10; i++) {
    karel.world.setWall({x:i, y:2}, CONSTANTS.DIRECTIONS.UP, true);
  }
  karel.ready();
});
