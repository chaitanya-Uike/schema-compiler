const LET = "let";
const CONST = "const";
const ARRAY_EXP = "[]";
const TYPE_OF = "typeof";
const EQUAL = "===";
const NOT_EQUAL = "!==";
const LESS_THAN = "<";
const GREATER_THAN = ">";
const NOT = "!";
const INCREMENT = "++";
const DECREMENT = "--";
const ASSIGN = "=";
const OR = "||";

function varDeclaration(type, identifier, init) {
  return `${type} ${identifier}=${init}`;
}

function varAssignment(left, operator, right) {
  return `${left} ${operator} ${right}`;
}

function binaryExpression(left, operator, right, parentisized = false) {
  let code = "";
  if (parentisized) code += "(";
  code += left + operator + right;
  if (parentisized) code += ")";
  return code;
}

function unaryExpression(operator, argument, prefix = true) {
  return prefix ? `${operator}  ${argument}` : `${argument} ${operator}`;
}

function logicalExpression(left, operator, right, parentisized = false) {
  // TODO need to differentiate between logical and binary expression
  let code = "";
  if (parentisized) code += "(";
  code += left + operator + right;
  if (parentisized) code += ")";
  return code;
}

function stringLiteral(value) {
  return `"${value}"`;
}

function blockStatement(body) {
  let code = " ";
  let l = body.length;
  if (l > 1) code = "{";
  for (let i = 0; i < l; ++i) {
    const statement = body[i];
    code += statement;
    if (statement[statement.length - 1] !== ";") {
      code += ";";
    }
  }
  if (l > 1) code += "}";
  return code;
}

function ifStatement(test, consequent, alternative) {
  let code = `if(${test})`;
  code += blockStatement(consequent);
  if (alternative) code += `else${blockStatement(alternative)}`;
  return code;
}

function callExpression(callee, args) {
  let code = `${callee}(`;
  for (let i = 0, l = args.length; i < l; ++i) {
    if (i !== 0) code += ",";
    code += args[i];
  }
  code += ")";
  return code;
}

function memberExpression(object, property, computed = false) {
  return computed ? `${object}[${property}]` : `${object}.${property}`;
}

function templateLiteral(value) {
  return "`" + value + "`";
}

function returnStatement(argument) {
  return `return ${argument}`;
}

function forStatement(init, test, update, body) {
  let code = "for(";
  if (init) code += init;
  code += ";";
  code += test + ";";
  if (update) code += update;
  code += ")";
  code += blockStatement(body);
  return code;
}

const DATA = "d";
const ERRORS = "e";
const LENGTH = "l";
const PATTERN = "p";

const lengthChecks = {
  min: { op: LESS_THAN, msg: "minimum length should be " },
  max: { op: GREATER_THAN, msg: "maximum length should be " },
  length: { op: NOT_EQUAL, msg: "length should be " },
};

function compileStringSchema(schema) {
  const body = [varDeclaration(LET, ERRORS, ARRAY_EXP)];
  const vars = [];
  const tests = [];
  const validations = schema.validations;
  let validation,
    name,
    value,
    lengthAsg = false,
    patternVarCount = 1,
    v;

  function addRegexTest(regex, message) {
    const pattern = `${PATTERN}${patternVarCount++}`;
    vars.push(varDeclaration(LET, pattern, regex));
    tests.push(
      ifStatement(
        unaryExpression(
          NOT,
          callExpression(memberExpression(pattern, "test"), [DATA])
        ),
        [
          callExpression(memberExpression(ERRORS, "push"), [
            stringLiteral(message),
          ]),
        ]
      )
    );
  }

  for (let i = 0, l = validations.length; i < l; ++i) {
    validation = validations[i];
    name = validation.name;
    value = validation.value;

    const lengthCheck = lengthChecks[name];
    if (lengthCheck) {
      if (!lengthAsg) {
        tests.push(
          varDeclaration(LET, LENGTH, memberExpression(DATA, "length"))
        );
        lengthAsg = true;
      }
      v = parseInt(value);
      tests.push(binaryTest(LENGTH, lengthCheck.op, v, lengthCheck.msg + v));
    } else if (name === "match") {
      addRegexTest(reviveRegex(value), "value not matching regex");
    } else if (name === "isAlpha" && value) {
      addRegexTest(/^[a-zA-Z]*$/, "value should only contain alphabets");
    } else if (name === "isAlNum" && value) {
      addRegexTest(
        /^[a-z0-9]+$/,
        "value should only contain alphaNumeric characters"
      );
    } else if (name === "isNum" && value) {
      tests.push(
        ifStatement(`isNaN(parseFloat(${DATA})) || !isFinite(${DATA})`, [
          callExpression(memberExpression(ERRORS, "push"), [
            stringLiteral("value should only contain numeric characters"),
          ]),
        ])
      );
    } else if (name === "const") {
      tests.push(
        binaryTest(
          DATA,
          NOT_EQUAL,
          stringLiteral(value),
          `value not equal to '${value}'`
        )
      );
    } else if (name === "enum") {
      const len = value.length;
      let argument = "(";
      for (let i = 0; i < len; ++i) {
        if (i > 0) argument += OR;
        argument += binaryExpression(DATA, EQUAL, stringLiteral(value[i]));
      }
      argument += ")";
      tests.push(
        ifStatement(unaryExpression(NOT, argument), [
          callExpression(memberExpression(ERRORS, "push"), [
            templateLiteral(`value should be one of [${value.join(", ")}]`),
          ]),
        ])
      );
    }
  }

  body.push(...vars);

  body.push(
    ifStatement(
      binaryExpression(
        unaryExpression(TYPE_OF, DATA),
        NOT_EQUAL,
        stringLiteral("string")
      ),
      [
        callExpression(memberExpression(ERRORS, "push"), [
          templateLiteral('expected type "string" recieved "${typeof d}"'),
        ]),
      ],
      tests
    )
  );

  body.push(returnStatement(ERRORS));

  return generateOutput(body);
}

function generateOutput(body) {
  let output = "";
  for (let i = 0, l = body.length; i < l; ++i) {
    const statement = body[i];
    output += statement;
    if (statement[statement.length - 1] !== ";") output += ";";
  }
  return output;
}

function binaryTest(left, operator, right, message) {
  return ifStatement(binaryExpression(left, operator, right), [
    callExpression(memberExpression(ERRORS, "push"), [stringLiteral(message)]),
  ]);
}

function reviveRegex(regexString) {
  const m = regexString.match(/\/(.*)\/(.*)?/);
  return new RegExp(m[1], m[2] || "");
}

const stringSchema = {
  type: "string",
  validations: [
    {
      name: "const",
      value: "hello",
    },
    {
      name: "enum",
      value: ["hello", "world", "this"],
    },
  ],
};

console.log(compileStringSchema(stringSchema));

// import Ajv from "ajv";

// const ajv = new Ajv();

// const validate = ajv.compile({
//   type: "string",
//   minLength: 3,
//   maxLength: 8,
//   pattern: "^[a-zA-Z]+$",
// });

// console.log(validate);

let e = [];
if (typeof d !== "string")
  e.push(`expected type "string" recieved "${typeof d}"`);
else {
  if (d !== "hello") e.push("value not equal to 'hello'");
  if (!(d === "hello" || d === "world" || d === "this"))
    e.push(`value should be one of [hello, world, this]`);
}
return e;
