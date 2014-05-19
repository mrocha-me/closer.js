(function() {
  var ArrayExpression, AssertArity, AssignmentExpression, BinaryExpression, BlockStatement, Boolean, BreakStatement, CallExpression, CatchClause, ConditionalExpression, ContinueStatement, EmptyStatement, ExpressionStatement, Float, ForStatement, FunctionDeclaration, FunctionExpression, HashMap, HashSet, Identifier, IfStatement, Integer, Keyword, List, LogicalExpression, MemberExpression, NewExpression, Nil, Program, ReturnStatement, SequenceExpression, String, ThisExpression, ThrowStatement, TryStatement, UnaryExpression, UpdateExpression, VariableDeclaration, VariableDeclarator, Vector, WhileStatement, closer, eq, helpers, json_diff, looseEq, looseParseOpts, parseOpts, _ref, _ref1, _ref2;

  closer = (_ref = (_ref1 = (_ref2 = typeof window !== "undefined" && window !== null ? window.closer : void 0) != null ? _ref2 : typeof self !== "undefined" && self !== null ? self.closer : void 0) != null ? _ref1 : typeof global !== "undefined" && global !== null ? global.closer : void 0) != null ? _ref : require('../src/closer');

  json_diff = require('json-diff');

  helpers = require('./closer-helpers');

  Integer = helpers.Literal;

  Float = helpers.Literal;

  String = helpers.Literal;

  Boolean = helpers.Literal;

  Nil = helpers.Literal;

  Keyword = helpers['keyword'];

  Vector = helpers['vector'];

  List = helpers['list'];

  HashSet = helpers['hash_$_set'];

  HashMap = helpers['hash_$_map'];

  AssertArity = helpers.AssertArity;

  Identifier = helpers.Identifier;

  ThisExpression = helpers.ThisExpression;

  UnaryExpression = helpers.UnaryExpression;

  UpdateExpression = helpers.UpdateExpression;

  BinaryExpression = helpers.BinaryExpression;

  LogicalExpression = helpers.LogicalExpression;

  SequenceExpression = helpers.SequenceExpression;

  ArrayExpression = helpers.ArrayExpression;

  AssignmentExpression = helpers.AssignmentExpression;

  CallExpression = helpers.CallExpression;

  MemberExpression = helpers.MemberExpression;

  NewExpression = helpers.NewExpression;

  ConditionalExpression = helpers.ConditionalExpression;

  FunctionExpression = helpers.FunctionExpression;

  EmptyStatement = helpers.EmptyStatement;

  ExpressionStatement = helpers.ExpressionStatement;

  ForStatement = helpers.ForStatement;

  WhileStatement = helpers.WhileStatement;

  IfStatement = helpers.IfStatement;

  BreakStatement = helpers.BreakStatement;

  ContinueStatement = helpers.ContinueStatement;

  ReturnStatement = helpers.ReturnStatement;

  TryStatement = helpers.TryStatement;

  CatchClause = helpers.CatchClause;

  ThrowStatement = helpers.ThrowStatement;

  VariableDeclaration = helpers.VariableDeclaration;

  VariableDeclarator = helpers.VariableDeclarator;

  FunctionDeclaration = helpers.FunctionDeclaration;

  BlockStatement = helpers.BlockStatement;

  Program = helpers.Program;

  beforeEach(function() {
    return this.addMatchers({
      toDeepEqual: helpers.toDeepEqual
    });
  });

  parseOpts = {
    loc: false,
    forceNoLoc: true
  };

  looseParseOpts = {
    loc: false,
    forceNoLoc: true,
    loose: true
  };

  eq = function(src, ast) {
    return expect(closer.parse(src, parseOpts)).toDeepEqual(ast);
  };

  looseEq = function(src, ast) {
    var actual;
    actual = closer.parse(src, looseParseOpts);
    delete actual.errors;
    return expect(actual).toDeepEqual(ast);
  };

  describe('Closer parser', function() {
    it('parses an empty program', function() {
      return eq('\n', Program());
    });
    it('parses an empty s-expression', function() {
      return eq('()\n', Program(EmptyStatement()));
    });
    it('parses comments', function() {
      return eq('; Heading\n() ; trailing ()\r\n;\r;;;\n\r\r', Program(EmptyStatement()));
    });
    it('parses an identifier', function() {
      return eq('x\n', Program(ExpressionStatement(Identifier('x'))));
    });
    it('parses integer, float, string, boolean, and nil literals', function() {
      return eq('-24\n-23.67\n-22.45E-5\n""\n"string"\ntrue\nfalse\nnil\n', Program(ExpressionStatement(UnaryExpression('-', Integer(24))), ExpressionStatement(UnaryExpression('-', Float(23.67))), ExpressionStatement(UnaryExpression('-', Float(22.45e-5))), ExpressionStatement(String('')), ExpressionStatement(String('string')), ExpressionStatement(Boolean(true)), ExpressionStatement(Boolean(false)), ExpressionStatement(Nil())));
    });
    it('parses keywords', function() {
      return eq(':keyword', Program(ExpressionStatement(Keyword('keyword'))));
    });
    it('parses vector and list literals', function() {
      return eq('[] ["string" true] \'() \'("string" true)', Program(ExpressionStatement(Vector()), ExpressionStatement(Vector(String('string'), Boolean(true))), ExpressionStatement(List()), ExpressionStatement(List(String('string'), Boolean(true)))));
    });
    it('parses set and map literals', function() {
      eq('#{} #{"string" true}', Program(ExpressionStatement(HashSet()), ExpressionStatement(HashSet(String('string'), Boolean(true)))));
      eq('{} {"string" true}', Program(ExpressionStatement(HashMap()), ExpressionStatement(HashMap(String('string'), Boolean(true)))));
      return expect(function() {
        return closer.parse('{1 2 3}');
      }).toThrow();
    });
    it('parses commas as whitespace', function() {
      return eq(',,, ,,,  ,,\n', Program());
    });
    it('parses a function call with 0 arguments', function() {
      return eq('(fn-name)\n', Program(ExpressionStatement(CallExpression(MemberExpression(Identifier('fn_$_name'), Identifier('call')), [ThisExpression()]))));
    });
    it('parses a function call with > 0 arguments', function() {
      return eq('(fn-name arg1 arg2)\n', Program(ExpressionStatement(CallExpression(MemberExpression(Identifier('fn_$_name'), Identifier('call')), [ThisExpression(), Identifier('arg1'), Identifier('arg2')]))));
    });
    it('parses an anonymous function definition', function() {
      return eq('(fn [x] x)\n', Program(ExpressionStatement(FunctionExpression(null, [Identifier('x')], null, BlockStatement(AssertArity(1), ReturnStatement(Identifier('x')))))));
    });
    it('parses an anonymous function call', function() {
      return eq('((fn [x] x) 2)\n', Program(ExpressionStatement(CallExpression(MemberExpression(FunctionExpression(null, [Identifier('x')], null, BlockStatement(AssertArity(1), ReturnStatement(Identifier('x')))), Identifier('call')), [ThisExpression(), Integer(2)]))));
    });
    it('parses anonymous function literals', function() {
      eq('(#(apply + % %2 %&) 1 2 3 4)', Program(ExpressionStatement(CallExpression(MemberExpression(FunctionExpression(null, [Identifier('__$1'), Identifier('__$2')], null, BlockStatement(AssertArity(2, Infinity), VariableDeclaration(VariableDeclarator(Identifier('__$rest'), CallExpression(Identifier('seq'), [CallExpression(MemberExpression(MemberExpression(MemberExpression(Identifier('Array'), Identifier('prototype')), Identifier('slice')), Identifier('call')), [Identifier('arguments'), Integer(2)])]))), ReturnStatement(CallExpression(MemberExpression(Identifier('apply'), Identifier('call')), [ThisExpression(), Identifier('_$PLUS_'), Identifier('__$1'), Identifier('__$2'), Identifier('__$rest')])))), Identifier('call')), [ThisExpression(), Integer(1), Integer(2), Integer(3), Integer(4)]))));
      return eq('(map #(if (even? %1) (- %) %) [1 2 3])', Program(ExpressionStatement(CallExpression(MemberExpression(Identifier('map'), Identifier('call')), [ThisExpression(), FunctionExpression(null, [Identifier('__$1')], null, BlockStatement(AssertArity(1), ReturnStatement(ConditionalExpression(CallExpression(MemberExpression(Identifier('even_$QMARK_'), Identifier('call')), [ThisExpression(), Identifier('__$1')]), CallExpression(MemberExpression(Identifier('_$_'), Identifier('call')), [ThisExpression(), Identifier('__$1')]), Identifier('__$1'))))), Vector(Integer(1), Integer(2), Integer(3))]))));
    });
    it('parses a named function definition', function() {
      return eq('(defn fn-name [x] x)\n', Program(VariableDeclaration(VariableDeclarator(Identifier('fn_$_name'), FunctionExpression(null, [Identifier('x')], null, BlockStatement(AssertArity(1), ReturnStatement(Identifier('x'))))))));
    });
    it('parses rest arguments', function() {
      return eq('(defn avg [& rest] (/ (apply + rest) (count rest)))\n', Program(VariableDeclaration(VariableDeclarator(Identifier('avg'), FunctionExpression(null, [], null, BlockStatement(AssertArity(0, Infinity), VariableDeclaration(VariableDeclarator(Identifier('rest'), CallExpression(Identifier('seq'), [CallExpression(MemberExpression(MemberExpression(MemberExpression(Identifier('Array'), Identifier('prototype')), Identifier('slice')), Identifier('call')), [Identifier('arguments'), Integer(0)])]))), ReturnStatement(CallExpression(MemberExpression(Identifier('_$SLASH_'), Identifier('call')), [ThisExpression(), CallExpression(MemberExpression(Identifier('apply'), Identifier('call')), [ThisExpression(), Identifier('_$PLUS_'), Identifier('rest')]), CallExpression(MemberExpression(Identifier('count'), Identifier('call')), [ThisExpression(), Identifier('rest')])]))))))));
    });
    it('parses destructuring forms', function() {
      eq('(defn fn-name [[a & b] c & [d & e :as coll]])', Program(VariableDeclaration(VariableDeclarator(Identifier('fn_$_name'), FunctionExpression(null, [Identifier('__$destruc0'), Identifier('c')], null, BlockStatement(AssertArity(2, Infinity), TryStatement(BlockStatement(VariableDeclaration(VariableDeclarator(Identifier('a'), CallExpression(Identifier('nth'), [Identifier('__$destruc0'), Integer(0)])))), CatchClause(Identifier('__$error'), BlockStatement(IfStatement(BinaryExpression('!==', MemberExpression(Identifier('__$error'), Identifier('name')), String('IndexOutOfBoundsError')), ThrowStatement(Identifier('__$error'))), ExpressionStatement(AssignmentExpression(Identifier('a'), Nil()))))), VariableDeclaration(VariableDeclarator(Identifier('b'), CallExpression(Identifier('drop'), [Integer(1), Identifier('__$destruc0')]))), VariableDeclaration(VariableDeclarator(Identifier('coll'), CallExpression(Identifier('seq'), [CallExpression(MemberExpression(MemberExpression(MemberExpression(Identifier('Array'), Identifier('prototype')), Identifier('slice')), Identifier('call')), [Identifier('arguments'), Integer(2)])]))), TryStatement(BlockStatement(VariableDeclaration(VariableDeclarator(Identifier('d'), CallExpression(Identifier('nth'), [Identifier('coll'), Integer(0)])))), CatchClause(Identifier('__$error'), BlockStatement(IfStatement(BinaryExpression('!==', MemberExpression(Identifier('__$error'), Identifier('name')), String('IndexOutOfBoundsError')), ThrowStatement(Identifier('__$error'))), ExpressionStatement(AssignmentExpression(Identifier('d'), Nil()))))), VariableDeclaration(VariableDeclarator(Identifier('e'), CallExpression(Identifier('drop'), [Integer(1), Identifier('coll')]))), ReturnStatement(Nil())))))));
      return eq('(defn fn-name [{:as m :keys [b] :strs [c] a :a}])', Program(VariableDeclaration(VariableDeclarator(Identifier('fn_$_name'), FunctionExpression(null, [Identifier('m')], null, BlockStatement(AssertArity(1), VariableDeclaration(VariableDeclarator(Identifier('b'), CallExpression(Identifier('get'), [Identifier('m'), Keyword('b')]))), VariableDeclaration(VariableDeclarator(Identifier('c'), CallExpression(Identifier('get'), [Identifier('m'), String('c')]))), VariableDeclaration(VariableDeclarator(Identifier('a'), CallExpression(Identifier('get'), [Identifier('m'), Keyword('a')]))), ReturnStatement(Nil())))))));
    });
    it('parses collections and keywords in function position', function() {
      eq('([1 2 3 4] 1)', Program(ExpressionStatement(CallExpression(MemberExpression(Vector(Integer(1), Integer(2), Integer(3), Integer(4)), Identifier('call')), [ThisExpression(), Integer(1)]))));
      eq('({1 2 3 4} 1)', Program(ExpressionStatement(CallExpression(MemberExpression(HashMap(Integer(1), Integer(2), Integer(3), Integer(4)), Identifier('call')), [ThisExpression(), Integer(1)]))));
      eq('(#{1 2 3 4} 1)', Program(ExpressionStatement(CallExpression(MemberExpression(HashSet(Integer(1), Integer(2), Integer(3), Integer(4)), Identifier('call')), [ThisExpression(), Integer(1)]))));
      return eq('(:key {:key :val})', Program(ExpressionStatement(CallExpression(MemberExpression(Keyword('key'), Identifier('call')), [ThisExpression(), HashMap(Keyword('key'), Keyword('val'))]))));
    });
    it('parses an if statement without else', function() {
      return eq('(if (>= x 0) x)\n', Program(ExpressionStatement(ConditionalExpression(CallExpression(MemberExpression(Identifier('_$GT__$EQ_'), Identifier('call')), [ThisExpression(), Identifier('x'), Integer(0)]), Identifier('x'), Nil()))));
    });
    it('parses an if-else statement', function() {
      return eq('(if (>= x 0) x (- x))\n', Program(ExpressionStatement(ConditionalExpression(CallExpression(MemberExpression(Identifier('_$GT__$EQ_'), Identifier('call')), [ThisExpression(), Identifier('x'), Integer(0)]), Identifier('x'), CallExpression(MemberExpression(Identifier('_$_'), Identifier('call')), [ThisExpression(), Identifier('x')])))));
    });
    it('parses a when form', function() {
      return eq('(when (condition?) (println \"hello\") true)\n', Program(IfStatement(CallExpression(MemberExpression(Identifier('condition_$QMARK_'), Identifier('call')), [ThisExpression()]), BlockStatement(ExpressionStatement(CallExpression(MemberExpression(Identifier('println'), Identifier('call')), [ThisExpression(), String('hello')])), ExpressionStatement(Boolean(true))))));
    });
    it('parses an unbound var definition', function() {
      return eq('(def var-name)', Program(VariableDeclaration(VariableDeclarator(Identifier('var_$_name'), null))));
    });
    it('parses a var bound to a literal', function() {
      return eq('(def greeting \"Hello\")', Program(VariableDeclaration(VariableDeclarator(Identifier('greeting'), String('Hello')))));
    });
    it('parses a var bound to the result of an expression', function() {
      return eq('(def sum (+ 3 5))', Program(VariableDeclaration(VariableDeclarator(Identifier('sum'), CallExpression(MemberExpression(Identifier('_$PLUS_'), Identifier('call')), [ThisExpression(), Integer(3), Integer(5)])))));
    });
    it('parses a var bound to an fn form', function() {
      return eq('(def add (fn [& numbers] (apply + numbers)))', Program(VariableDeclaration(VariableDeclarator(Identifier('add'), FunctionExpression(null, [], null, BlockStatement(AssertArity(0, Infinity), VariableDeclaration(VariableDeclarator(Identifier('numbers'), CallExpression(Identifier('seq'), [CallExpression(MemberExpression(MemberExpression(MemberExpression(Identifier('Array'), Identifier('prototype')), Identifier('slice')), Identifier('call')), [Identifier('arguments'), Integer(0)])]))), ReturnStatement(CallExpression(MemberExpression(Identifier('apply'), Identifier('call')), [ThisExpression(), Identifier('_$PLUS_'), Identifier('numbers')]))))))));
    });
    it('parses assignment forms like (set! var value) and (set! (.prop obj) value)', function() {
      eq('(set! x 4)', Program(ExpressionStatement(AssignmentExpression(Identifier('x'), Integer(4)))));
      return eq('(set! (.length (to-array (range 5))) 3)', Program(ExpressionStatement(AssignmentExpression(MemberExpression(CallExpression(MemberExpression(Identifier('to_$_array'), Identifier('call')), [ThisExpression(), CallExpression(MemberExpression(Identifier('range'), Identifier('call')), [ThisExpression(), Integer(5)])]), Identifier('length')), Integer(3)))));
    });
    it('parses a let form with no bindings and no body', function() {
      return eq('(let [])', Program(ExpressionStatement(CallExpression(MemberExpression(FunctionExpression(null, [], null, BlockStatement(ReturnStatement(Nil()))), Identifier('call')), [ConditionalExpression(BinaryExpression('!==', UnaryExpression('typeof', ThisExpression()), String('undefined')), ThisExpression(), Nil())]))));
    });
    it('parses a let form with non-empty bindings and a non-empty body', function() {
      return eq('(let [x 3 y (- x)] (+ x y))', Program(ExpressionStatement(CallExpression(MemberExpression(FunctionExpression(null, [], null, BlockStatement(VariableDeclaration(VariableDeclarator(Identifier('x'), Integer(3))), VariableDeclaration(VariableDeclarator(Identifier('y'), CallExpression(MemberExpression(Identifier('_$_'), Identifier('call')), [ThisExpression(), Identifier('x')]))), ReturnStatement(CallExpression(MemberExpression(Identifier('_$PLUS_'), Identifier('call')), [ThisExpression(), Identifier('x'), Identifier('y')])))), Identifier('call')), [ConditionalExpression(BinaryExpression('!==', UnaryExpression('typeof', ThisExpression()), String('undefined')), ThisExpression(), Nil())]))));
    });
    it('parses loop + recur forms', function() {
      eq('(loop [] (recur))', Program(ExpressionStatement(CallExpression(MemberExpression(FunctionExpression(null, [], null, BlockStatement(WhileStatement(Boolean(true), BlockStatement(BlockStatement(ContinueStatement()), BreakStatement())))), Identifier('call')), [ConditionalExpression(BinaryExpression('!==', UnaryExpression('typeof', ThisExpression()), String('undefined')), ThisExpression(), Nil())]))));
      return eq('(loop [x 10] (when (> x 1) (.log console x) (recur (- x 2))))', Program(ExpressionStatement(CallExpression(MemberExpression(FunctionExpression(null, [], null, BlockStatement(VariableDeclaration(VariableDeclarator(Identifier('x'), Integer(10))), WhileStatement(Boolean(true), BlockStatement(IfStatement(CallExpression(MemberExpression(Identifier('_$GT_'), Identifier('call')), [ThisExpression(), Identifier('x'), Integer(1)]), BlockStatement(ExpressionStatement(CallExpression(MemberExpression(Identifier('console'), String('log'), true), [Identifier('x')])), BlockStatement(ExpressionStatement(AssignmentExpression(Identifier('__$recur0'), CallExpression(MemberExpression(Identifier('_$_'), Identifier('call')), [ThisExpression(), Identifier('x'), Integer(2)]))), ExpressionStatement(AssignmentExpression(Identifier('x'), Identifier('__$recur0'))), ContinueStatement())), ReturnStatement(Nil())), BreakStatement())))), Identifier('call')), [ConditionalExpression(BinaryExpression('!==', UnaryExpression('typeof', ThisExpression()), String('undefined')), ThisExpression(), Nil())]))));
    });
    it('parses fn + recur forms', function() {
      return eq('(fn [n acc] (if (zero? n) acc (recur (dec n) (* acc n))))', Program(ExpressionStatement(FunctionExpression(null, [Identifier('n'), Identifier('acc')], null, BlockStatement(AssertArity(2), WhileStatement(Boolean(true), BlockStatement(IfStatement(CallExpression(MemberExpression(Identifier('zero_$QMARK_'), Identifier('call')), [ThisExpression(), Identifier('n')]), ReturnStatement(Identifier('acc')), BlockStatement(ExpressionStatement(AssignmentExpression(Identifier('__$recur0'), CallExpression(MemberExpression(Identifier('dec'), Identifier('call')), [ThisExpression(), Identifier('n')]))), ExpressionStatement(AssignmentExpression(Identifier('__$recur1'), CallExpression(MemberExpression(Identifier('_$STAR_'), Identifier('call')), [ThisExpression(), Identifier('acc'), Identifier('n')]))), ExpressionStatement(AssignmentExpression(Identifier('n'), Identifier('__$recur0'))), ExpressionStatement(AssignmentExpression(Identifier('acc'), Identifier('__$recur1'))), ContinueStatement())))))))));
    });
    it('parses dotimes forms', function() {
      return eq('(dotimes [i expr] (println i))', Program(ForStatement(VariableDeclaration(VariableDeclarator(Identifier('i'), Integer(0)), VariableDeclarator(Identifier('__$max0'), Identifier('expr'))), BinaryExpression('<', Identifier('i'), Identifier('__$max0')), UpdateExpression('++', Identifier('i')), BlockStatement(ExpressionStatement(CallExpression(MemberExpression(Identifier('println'), Identifier('call')), [ThisExpression(), Identifier('i')]))))));
    });
    it('parses doseq forms', function() {
      return eq('(doseq [x (range 5)] (println x))', Program(ForStatement(VariableDeclaration(VariableDeclarator(Identifier('__$doseqSeq0'), CallExpression(MemberExpression(Identifier('range'), Identifier('call')), [ThisExpression(), Integer(5)])), VariableDeclarator(Identifier('x'), CallExpression(Identifier('first'), [Identifier('__$doseqSeq0')]))), BinaryExpression('!==', Identifier('x'), Nil()), SequenceExpression(AssignmentExpression(Identifier('__$doseqSeq0'), CallExpression(Identifier('rest'), [Identifier('__$doseqSeq0')])), AssignmentExpression(Identifier('x'), CallExpression(Identifier('first'), [Identifier('__$doseqSeq0')]))), BlockStatement(ExpressionStatement(CallExpression(MemberExpression(Identifier('println'), Identifier('call')), [ThisExpression(), Identifier('x')]))))));
    });
    it('parses while forms', function() {
      return eq('(while (< i 5) (set! i (inc i)))', Program(WhileStatement(CallExpression(MemberExpression(Identifier('_$LT_'), Identifier('call')), [ThisExpression(), Identifier('i'), Integer(5)]), BlockStatement(ExpressionStatement(AssignmentExpression(Identifier('i'), CallExpression(MemberExpression(Identifier('inc'), Identifier('call')), [ThisExpression(), Identifier('i')])))))));
    });
    it('parses an empty do form', function() {
      return eq('(do)', Program(ExpressionStatement(CallExpression(MemberExpression(FunctionExpression(null, [], null, BlockStatement(ReturnStatement(Nil()))), Identifier('call')), [ConditionalExpression(BinaryExpression('!==', UnaryExpression('typeof', ThisExpression()), String('undefined')), ThisExpression(), Nil())]))));
    });
    it('parses a non-empty do form', function() {
      return eq('(do (+ 1 2) (+ 3 4))', Program(ExpressionStatement(CallExpression(MemberExpression(FunctionExpression(null, [], null, BlockStatement(ExpressionStatement(CallExpression(MemberExpression(Identifier('_$PLUS_'), Identifier('call')), [ThisExpression(), Integer(1), Integer(2)])), ReturnStatement(CallExpression(MemberExpression(Identifier('_$PLUS_'), Identifier('call')), [ThisExpression(), Integer(3), Integer(4)])))), Identifier('call')), [ConditionalExpression(BinaryExpression('!==', UnaryExpression('typeof', ThisExpression()), String('undefined')), ThisExpression(), Nil())]))));
    });
    it('parses dot special forms', function() {
      eq('(.move-x-y this 10 20)', Program(ExpressionStatement(CallExpression(MemberExpression(ThisExpression(), String('move-x-y'), true), [Integer(10), Integer(20)]))));
      return eq('(.pos this)', Program(ExpressionStatement(ConditionalExpression(LogicalExpression('&&', BinaryExpression('===', UnaryExpression('typeof', MemberExpression(ThisExpression(), String('pos'), true)), String('function')), BinaryExpression('===', MemberExpression(MemberExpression(ThisExpression(), String('pos'), true), Identifier('length')), Integer(0))), CallExpression(MemberExpression(ThisExpression(), String('pos'), true), []), MemberExpression(ThisExpression(), String('pos'), true)))));
    });
    it('parses new forms like (new Array 1 2 3)', function() {
      eq('(new Array 1 2 3)', Program(ExpressionStatement(NewExpression(Identifier('Array'), [Integer(1), Integer(2), Integer(3)]))));
      return eq('(Array. 1 2 3)', Program(ExpressionStatement(NewExpression(Identifier('Array'), [Integer(1), Integer(2), Integer(3)]))));
    });
    it('parses logical expressions (and / or)', function() {
      eq('(and) (or)', Program(ExpressionStatement(Boolean(true)), ExpressionStatement(Nil())));
      eq('(and expr1 expr2 expr3)', Program(ExpressionStatement(LogicalExpression('&&', LogicalExpression('&&', Identifier('expr1'), Identifier('expr2')), Identifier('expr3')))));
      return eq('(or expr1 expr2 expr3)', Program(ExpressionStatement(LogicalExpression('||', LogicalExpression('||', Identifier('expr1'), Identifier('expr2')), Identifier('expr3')))));
    });
    describe('Loose mode', function() {
      it('parses incomplete forms in loose mode', function() {
        return looseEq('(let [x 1\n', Program(ExpressionStatement(CallExpression(MemberExpression(FunctionExpression(null, [], null, BlockStatement(VariableDeclaration(VariableDeclarator(Identifier('x'), Integer(1))), ReturnStatement(Nil()))), Identifier('call')), [ConditionalExpression(BinaryExpression('!==', UnaryExpression('typeof', ThisExpression()), String('undefined')), ThisExpression(), Nil())]))));
      });
      it('parses forms with excess closing delimiters at the end', function() {
        return looseEq('(let [x 1])) )\n)', Program(ExpressionStatement(CallExpression(MemberExpression(FunctionExpression(null, [], null, BlockStatement(VariableDeclaration(VariableDeclarator(Identifier('x'), Integer(1))), ReturnStatement(Nil()))), Identifier('call')), [ConditionalExpression(BinaryExpression('!==', UnaryExpression('typeof', ThisExpression()), String('undefined')), ThisExpression(), Nil())]))));
      });
      it('parses forms with unmatched closing delimiters at the end', function() {
        return looseEq('(let [x 1) \n  ]', Program(ExpressionStatement(CallExpression(MemberExpression(FunctionExpression(null, [], null, BlockStatement(VariableDeclaration(VariableDeclarator(Identifier('x'), Integer(1))), ReturnStatement(Nil()))), Identifier('call')), [ConditionalExpression(BinaryExpression('!==', UnaryExpression('typeof', ThisExpression()), String('undefined')), ThisExpression(), Nil())]))));
      });
      it('returns an empty AST for forms with excess closing delimiters in between', function() {
        return looseEq('(let [x 1)]\nx\n', Program());
      });
      return it('returns an empty AST for forms with unmatched closing delimiters in between', function() {
        return looseEq('(let [x 1)]\nx\n', Program());
      });
    });
    return xit('parses source locations');
  });

}).call(this);