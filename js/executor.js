define(['lexer', 'jquery'], function(lexer, $) {

  function Executor($node) {
    this.$node = $node;
    this.__generated = null;
    this.$text = $node.find('textarea:first');
    this.$text.on('keypress', this.__dirty.bind(this));
    this.$node.find('button').on('click', this.execute.bind(this));
  }

  $.extend(Executor.prototype, {
    __dirty : function() {
      this.__generated = null;
    },
    execute : function() {
      this.$node.trigger('execute', [this.generate()]);
    },
    generate : function() {
      if (!this.__generated) {
        var code = lexer.parse(this.getCode());
        this.__generated = new Function('robot', code);
      }
      return this.__generated;
    },
    getCode : function() {
      return this.$text.val();
    }
  });

  return Executor;
});