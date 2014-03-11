require(['constants', 'jquery', 'robot', 'world', 'render'], function(CONSTANTS, $, Robot, World, Render) {
  /**
   * App Class
   */
  function App($world) {
    this.robot = null;
    this.world = null;
  }

  $.extend(App.prototype, {

  });

  $('.world').on('render', Render.receive);

  $(function() {
    var w = new World($('.world'));
    for (var i = 2; i < 10; i++) {
      w.setWall(i, 2, CONSTANTS.DIRECTIONS.UP, true);
    }
    w.render();
    var r = new Robot($('.robot'));
    window.robot = r;
  });
});
