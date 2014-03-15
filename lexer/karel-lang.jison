%lex

%%
"function"               { return 'FUNCTION'; }
\s+                      { /* SKIP WHITESPACE */ }
";"                      { return ';'; }
"{"                      { return '{'; }
"}"                      { return '}'; }
"("                      { return '('; }
")"                      { return ')'; }
"||"                     { return '||'; }
"&&"                     { return '&&'; }
"!"                      { return "NOT"; }
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
<<EOF>>                  { return 'EOF'; }

/lex

%start PROGRAM

%%

PROGRAM
            : FUNCTIONS COMMANDS EOF
                { console.log($1 + "\n" + $2); return $1 + "\n" + $2; }
            | COMMANDS EOF
                { console.log($1); return $1; }
            ;

FUNCTIONS
            : FUNCTIONS FUNCTION_EXPR
                { $$ = $1 + "\n" + $2; }
            | FUNCTION_EXPR
                { $$ = $1; }
            ;

FUNCTION_EXPR
            : FUNCTION SYMBOL '(' ')' '{' COMMANDS '}'
                { $$ = 'function ' + $2 + '() {\n' + $6 + '\n}'; }
            ;

BOOL_COMMANDS
            : BOOL_COMMAND '&&' BOOL_COMMAND
                { $$ = $1 + "&&" + $3; }
            | BOOL_COMMAND '||' BOOL_COMMAND
                { $$ = $1 + "||" + $3; }
            | BOOL_COMMAND
                { $$ = $1; }
            ;


BOOL_COMMAND
            : NOT BOOL_COMMAND
               { $$ = "!" + $2; }
            | IS_BLOCKED
               { $$ = "robot.isBlocked()"; }
            | HAS_BEEPER
               { $$ = "robot.hasBeeper()"; }
            ;

COMMANDS
            : COMMANDS COMMAND
                { $$ = $1 + "\n" + $2; }
            | COMMAND
                { $$ = $1; }
            ;

COMMAND
            : LEFT ';'
                { $$ = "robot.turnLeft();"; }
            | MOVE ';'
                { $$ = "robot.move();"; }
            | PUT_BEEPER ';'
                { $$ = "robot.putBeeper();"; }
            | PICK_BEEPER ';'
                { $$ = "robot.pickBeeper();"; }
            | SYMBOL '(' ')' ';'
                { $$ = $1 + '();' }
            | WHILE '(' BOOL_COMMANDS ')' '{' COMMANDS '}'
                { $$ = "while (\n" + $3 + ") {\n" + $6 + "\n}"; }
            | IF '(' BOOL_COMMANDS ')' '{' COMMANDS '}' ELSE '{' COMMANDS '}'
                { $$ = "if (" + $3 + ") {\n" + $6 + "\n} else {\n" + $10 + "\n}"; }
            | IF '(' BOOL_COMMANDS ')' '{' COMMANDS '}'
                { $$ = "if (" + $3 + ") {\n" + $6 + "\n}"; }
            ;
