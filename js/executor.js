define(['lexer', 'jquery', 'Render'], function(lexer, $, Render) {

  function Executor(world, robot) {
    this.stack = [];
    this.pending = [];
    this.position = 0;
    this.running = false;
    this.paused = false;
    this.robot = robot;
    this.__compiled = null;
  }

  $.extend(Executor.prototype, {
    start : function() {
      if (this.running || !this.__compiled) {
        return;
      }

      this.running = true;
      this.paused = false;

      this.stack = [];
      this.pending = [];
      this.__userOperations = {};
      this.__compiled(this.enqueue.bind(this), this.__userOperations);

      //Bootstrap first execution by taking the pending items as the stack
      this.stack = this.pending;
      this.pending = [];
    },
    pause : function() {
      if (this.running) {
        this.paused = !this.paused;
      }
    },
    stop : function() {
      this.running = false;
    },
    enqueue : function(act, a, b, c) {
      this.pending.push([act, a, b, c]);
    },
    compile : function(text) {
      var code = lexer.parse(text);
      this.__compiled = new Function('enqueue', 'exports', code);
    },
    iterate : function() {

      if (!this.running || this.paused) {
        return false;
      }

      if (!this.stack.length) {
        this.running = false;
        return false;
      }

      var command = this.stack.shift();

      this.pending = [];

      var cmd = command[0];

      var again = this.iterate.bind(this);

      if (cmd in this.__userOperations) { //If custom op
        this.__userOperations[cmd]();
      } else {
        switch (cmd) {
        case 'turnLeft':
          this.robot.turnLeft();
          Render.process('robot-rotate', this.robot.position, again);
          break;
        case 'move':
          if (this.robot.move()) {
            Render.process('robot-move', this.robot.position, again);
          } else {
            Render.process('robot-blocked', null, again);
          }
          break;
        case 'putBeeper':
        case 'pickBeeper':
          if (this.robot[cmd]()) {
            Render.process('beeper-updated');
            Render.process('beeper-updated', $.extend({}, robot.position, {
              count : robot.countBeeper()
            }), again);
          } else {
            Render.process('beeper-failed', null, again);
          }
          break;
        case 'if':
          if (command[1](this.robot)) {
            command[2]();
          } else if (command[3]) {
            command[3]();
          }
          break;
        case 'while':
          if (command[1](this.robot)) {
            command[2]();
            this.pending.push(command);
          }
          break;
        default:
          throw new Error("unknown operation: " + cmd);
        }
      }

      //Allows us to override queue w/ recently gathered items
      this.stack = this.pending.concat(this.stack);

      //Clear pending
      this.pending = [];

      //Is there more?
      return this.stack.length;
    }
  });

  return Executor;
});