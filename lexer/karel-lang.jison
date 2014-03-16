%lex

%%
"function"               { return 'FUNCTION'; }
\s+                      { /* SKIP WHITESPACE */ }
";"                      { return ';'; }
"{"                      { return '{'; }
"}"                      { return '}'; }
"("                      { return '('; }
")"                      { return ')'; }
"+"                      { return 'PLUS'; }
"-"                      { return 'MINUS'; }
"/"                      { return 'DIVIDE'; }
"*"                      { return 'MULTIPLY'; }
"||"                     { return 'OR'; }
"&&"                     { return 'AND'; }
"!"                      { return 'NOT'; }
"<"                      { return 'LT'; }
">"                      { return 'GT'; }
"<="                     { return 'LTE'; }
">="                     { return 'GTE'; }
"=="                     { return 'EQ'; }
"!="                     { return 'NEQ'; }
"while"                  { return 'WHILE'; }
"if"                     { return 'IF'; }
"else"                   { return 'ELSE'; }
turnLeft\s*\(\s*\)       { return 'LEFT'; }
move\s*\(\s*\)           { return 'MOVE'; }
isBlocked\s*\(\s*\)      { return 'IS_BLOCKED'; }
hasBeeper\s*\(\s*\)      { return 'HAS_BEEPER'; }
putBeeper\s*\(\s*\)      { return 'PUT_BEEPER'; }
pickBeeper\s*\(\s*\)     { return 'PICK_BEEPER'; }
[A-Za-z$_][A-Za-z0-9$_]* { return 'SYMBOL'}
([0-9]+)                 { return 'NUMBER'}
<<EOF>>                  { return 'EOF'; }

/lex

%left PLUS MINUS
%left MULTIPLY DIVIDE
%left NOT
%left AND OR
%start PROGRAM

%%

PROGRAM
            : FUNCTIONS COMMANDS EOF
                { console.log($1 + "\n" + $2); return $1 + "\n" + $2; }
            | COMMANDS EOF
                { console.log($1); return $1; }
            ;

SYMBOL_LIST
            : SYMBOL_LIST ',' SYMBOL
                { $$ =  $1 + "," + $2; }
            | SYMBOL
                { $$ = "'"+$1+"'"; }
            ;

FUNCTIONS
            : FUNCTIONS FUNCTION_EXPR
                { $$ = $1 + "\n" + $2; }
            | FUNCTION_EXPR
                { $$ = $1; }
            ;

FUNCTION_EXPR
            : FUNCTION SYMBOL '(' ')' '{' COMMANDS '}'
                { $$ = "exports."+$2+" = [function " + $2 + "(locals) {\n" + $6 + "\n};,[]]"; }
            | FUNCTION SYMBOL '(' SYMBOL_LIST ')' '{' COMMANDS '}'
                { $$ = "exports."+$2+" = [function " + $2 + "(locals) {\n" + $7 + "\n}, [" + $4 + "]];"; }
            ;


EXPR_LEAF
            : NUMBER
                { $$ = $1; }
            | SYMBOL
                { $$ = "locals." + $1; }
            ;

EXPRESSION
            : EXPRESSION PLUS EXPRESSION
                { $$ = $1 + ' + ' + $3; }
            | EXPRESSION MINUS EXPRESSION
                { $$ = $1 + ' - ' + $3; }
            | EXPRESSION DIVIDE EXPRESSION
                { $$ = $1 +' / ' + $3; }
            | EXPRESSION MULTIPLY EXPRESSION
                { $$ = $1 +' * ' + $3; }
            | EXPR_LEAF
                { $$ = $1; }
            ;

BOOL_EXPR
            : BOOL_EXPR AND BOOL_EXPR
                { $$ = $1 + "&&" + $3; }
            | BOOL_EXPR OR BOOL_EXPR
                { $$ = $1 + "||" + $3; }
            | NOT BOOL_EXPR
                { $$ = '!' + $2; }
            | EXPR_LEAF LTE EXPR_LEAF
                { $$ = $1 + ' <= ' + $3; }
            | EXPR_LEAF LT EXPR_LEAF
                { $$ = $1 + ' < ' + $3; }
            | EXPR_LEAF GTE EXPR_LEAF
                { $$ = $1 + ' >= ' + $3; }
            | EXPR_LEAF GT EXPR_LEAF
                { $$ = $1 + ' > ' + $3; }
            | EXPR_LEAF EQ EXPR_LEAF
                { $$ = $1 + ' == ' + $3; }
            | EXPR_LEAF NEQ EXPR_LEAF
                { $$ = $1 + ' != ' + $3; }
            | BOOL_COMMAND
                { $$ = $1; }
            ;

BOOL_COMMAND
            : IS_BLOCKED
               { $$ = "locals.robot.isBlocked()"; }
            | HAS_BEEPER
               { $$ = "locals.robot.hasBeeper()"; }
            ;

BRANCH_COMMAND
            : WHILE '(' BOOL_EXPR ')' '{' COMMANDS '}'
                { $$ = "enqueue('while', function(locals) {\n return " + $3 + ";\n}, function(locals) {\n" + $6 + "\n});"; }
            | IF '(' BOOL_EXPR ')' '{' COMMANDS '}' ELSE '{' COMMANDS '}'
                { $$ = "enqueue('if', function(locals) {\n return " + $3 + ";\n}, function(locals) {\n" + $6 + "\n}, function(locals) {\n" + $10 +"\n});"; }
            | IF '(' BOOL_EXPR ')' '{' COMMANDS '}'
                { $$ = "enqueue('if', function(locals) {\n return " + $3 + ";\n}, function(locals) {\n" + $6 + "\n})"; };

COMMANDS
            : COMMANDS COMMAND
                { $$ = $1 + "\n" + $2; }
            | COMMAND
                { $$ = $1; }
            ;

COMMAND
            : COMMAND ';'
                { $$ = $1; }
            | LEFT
                { $$ = "enqueue('turnLeft');"; }
            | MOVE
                { $$ = "enqueue('move');"; }
            | PUT_BEEPER
                { $$ = "enqueue('putBeeper');"; }
            | PICK_BEEPER
                { $$ = "enqueue('pickBeeper');"; }
            | SYMBOL '(' ')'
                { $$ = "enqueue('"+$1+"');"; }
            | SYMBOL '(' EXPRESSION ')'
                { $$ = "enqueue('"+$1+"', function(locals) { return "+$3+"; });"; }
            | BRANCH_COMMAND
                { $$ = $1; }
            ;