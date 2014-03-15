define(['lexer'], function(lexer) {

  function generateCode(code) {
    return eval('function(robot) {' + lexer.lexer(code) + '}');
  }

  return {
    generate : generateCode
  };
});