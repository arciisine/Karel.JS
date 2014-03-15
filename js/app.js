require(['constants', 'jquery', 'robot', 'world', 'executor', 'render'], function(CONSTANTS, $, Robot, World, Executor, Render) {
  /**
   * App Class
   */
  function App($root) {
    this.$root = $root;
    this.$world = this.$root.find('.world');
    this.$code = this.$root.find('.code');
    this.$codeText = this.$code.find('textarea');

    var x = this.$world.data().sizeX;
    var y = this.$world.data().sizeY;

    this.world = new World(x,y);
    this.robot = new Robot(this.world);
    this.executor = new Executor(this.robot);
  }

  $.extend(App.prototype, {
    bindUI : function() {
      var self = this;

      var executor = this.executor;

      this.$code.find('button[name="compile"]').on('click', function() {
        executor.compile(self.$codeText.val());
      });

      this.$code.find('button[name="start"]').on('click', executor.start.bind(executor));
      this.$code.find('button[name="pause"]').on('click', executor.pause.bind(executor));
      this.$code.find('button[name="stop"]').on('click', executor.stop.bind(executor));

    },
    init : function(cb) {
      Render.init(this.$world);
      Render.drawWorld(this.world);
      this.bindUI();
      cb.call(this);
    }
  });

  var karel = window.karel = new App($('body'));

  karel.init(function() {

    var updateWall = Render.process.bind(Render, 'wall-updated');

    for (var i = 0; i < 100; i++) {
      var setWalls = this.world.setWall({
        x : Math.floor(Math.random() * this.world.range.x[1]),
        y : Math.floor(Math.random() * this.world.range.y[1])
      }, CONSTANTS.DIRECTIONS.MAP[Math.floor(Math.random() * 4)], true);

      setWalls.forEach(function(obj) { updateWall(obj); });
    }
  });
});
