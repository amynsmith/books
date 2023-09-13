import * as Language from "./modules/language.js";

// Language.run(`
// do(define(plusOne, fun(a, +(a, 1))),
//    print(plusOne(10)))
// `);

// Language.run(`
// do(define(pow, fun(base, exp,
//      if(==(exp, 0),
//         1,
//         *(base, pow(base, -(exp, 1)))))),
//    print(pow(2, 10)))
// `);


// Language.topScope.array = Function("...values", `return Array.from(values)`)

// Language.topScope.length = Function("array", `return array.length`);

// Language.topScope.element = Function("array", "i", `return array[i]`);

// given solution
// Language.topScope.array = (...values) => values;
// Language.topScope.length = array => array.length;
// Language.topScope.element = (array, i) => array[i];

// Language.run(`
// do(define(sum, fun(array,
//      do(define(i, 0),
//         define(sum, 0),
//         while(<(i, length(array)),
//           do(define(sum, +(sum, element(array, i))),
//              define(i, +(i, 1)))),
//         sum))),
//    print(sum(array(1, 2, 3))))
// `);
// → 6


// closure
// Language.run(`
// do(define(f, fun(a, fun(b, +(a, b)))),
//    print(f(4)(5)))
// `);
// → 9

// function skipSpace modified

// console.log(Language.parse("# hello\nx"));
// // → {type: "word", name: "x"}

// console.log(Language.parse("a # one\n   # two\n()"));
// // → {type: "apply",
// //    operator: {type: "word", name: "a"},
// //    args: []}

// fixing scope
Language.specialForms.set = (args, scope) => {
    if (args.length != 2) throw new SyntaxError("Incorrect use of set")
    let value = Language.evaluate(args[1], scope);
    if (Object.prototype.hasOwnProperty.call(scope, args[0].name)){
        scope[args[0].name] = value;
        return value;
    }
    let outerScope;
    while (outerScope = Object.getPrototypeOf(scope)) {
        if (Object.prototype.hasOwnProperty.call(outerScope, args[0].name)) {
            outerScope[args[0].name] = value;
            return value;
        }
        scope = outerScope;
    }
    throw new ReferenceError(`Undefined binding: ${args[0].name}`);
};

Language.run(`
  do(define(x, 4),
     define(setx, fun(val, set(x, val))),
     setx(50),
     print(x))
  `);
// → 50
Language.run(`set(quux, true)`);
// → Some kind of ReferenceError

// given solution
// specialForms.set = (args, env) => {
//     if (args.length != 2 || args[0].type != "word") {
//       throw new SyntaxError("Bad use of set");
//     }
//     let varName = args[0].name;
//     let value = evaluate(args[1], env);
  
//     for (let scope = env; scope; scope = Object.getPrototypeOf(scope)) {
//       if (Object.prototype.hasOwnProperty.call(scope, varName)) {
//         scope[varName] = value;
//         return value;
//       }
//     }
//     throw new ReferenceError(`Setting undefined variable ${varName}`);
//   };