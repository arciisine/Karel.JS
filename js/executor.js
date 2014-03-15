define(['lexer', 'jquery', 'render'], function(lexer, $, Render) {

  function Executor(robot) {
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
    __processCommand : function(command) {
      var cmd = command[0];
      var renderCommand = null;

      if (cmd in this.__userOperations) { //If custom op
        this.__userOperations[cmd]();
      } else {
        switch (cmd) {
        case 'turnLeft':
          this.robot.turnLeft();
          renderCommand = ['robot-rotate', this.robot.position];
          break;
        case 'move':
          if (this.robot.move()) {
            renderCommand = ['robot-move', this.robot.position];
          } else {
            renderCommand = ['robot-blocked'];
          }
          break;
        case 'putBeeper':
        case 'pickBeeper':
          if (this.robot[cmd]()) {
            renderCommand = ['beeper-updated', $.extend({}, robot.position, {
              count : robot.countBeeper()
            })];
          } else {
            renderCommand = ['beeper-failed'];
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

      return renderCommand;
    },
    iterate : function(cb) {

      if (!this.running || this.paused || !this.stack.length) {
        return this.stack.length;
      }

      this.pending = [];

      var self = this;
      var callback = function() {
        if (cb) {
          //Indicate if there are more
          self.running = stack.length > 0;
          cb(self.running);
        } else {
          //Do nothing
        }
      }

      var renderCommand = this.__processCommand(this.stack.shift());

      if (renderCommand) {
        renderCommand[2] = callback;
        Render.process.apply(null, renderCommand);
      } else {
        //Call immediately
        setTimeout(callback, 1);
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