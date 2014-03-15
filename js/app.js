require(['constants', 'jquery', 'robot', 'world', 'executor', 'render'], function(CONSTANTS, $, Robot, World, Executor, Render) {
  /**
   * App Class
   */
  function App($root) {
    var self = this;

    this.$root = $root;
    this.$world = this.$root.find('.world');
    this.$code = this.$root.find('.code');
    this.$codeText = this.$code.find('textarea');

    var x = this.$world.data().sizeX;
    var y = this.$world.data().sizeY;

    var world = this.world = new World(x,y);
    var robot = this.robot = new Robot(world);
    var executor = this.executor = new Executor(robot);


    this.$code.find('button[name="compile"]').on('click', function() {
      executor.compile(self.$codeText.val());
    });

    this.$code.find('button[name="start"]').on('click', executor.start.bind(executor));
    this.$code.find('button[name="pause"]').on('click', executor.pause.bind(executor));
    this.$code.find('button[name="stop"]').on('click', executor.stop.bind(executor));
  }

  $.extend(App.prototype, {
    init : function(cb) {
      Render.init(this.$world);
      Render.drawWorld(this.world);
      cb();
    }
  });

  var karel = window.karel = new App($('body'));

  karel.init(function() {

    var updateWall = Render.process.bind(Render, 'wall-updated');

    for (var i = 0; i < 100; i++) {
      var setWalls = karel.world.setWall({
        x : Math.floor(Math.random() * karel.world.range.x[1]),
        y : Math.floor(Math.random() * karel.world.range.y[1])
      }, CONSTANTS.DIRECTIONS.MAP[Math.floor(Math.random() * 4)], true);

      setWalls.forEach(function(obj) { updateWall(obj); });
    }
  });
});
