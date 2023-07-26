function varDeclarator(identifier, init) {
  let code = identifier;
  if (init) code += `=${init}`;
  return code;
}

function varDeclaration(kind, declarations) {
  let code = `${kind} `;
  for (let i = 0, l = declarations.length; i < l; ++i) {
    if (i > 0) code += ",";
    code += declarations[i];
  }
  return code;
}

function varAssignment(left, operator, right) {
  return left + operator + right;
}

function unaryExpression(operator, argument, prefix = true) {
  let space = "";
  if (operator[0] >= "a" && operator[0] <= "z") space = " ";
  return prefix ? operator + space + argument : argument + space + operator;
}

function binaryExpression(left, operator, right, parentisized = false) {
  let code = "";
  if (parentisized) code += "(";
  code += left + operator + right;
  if (parentisized) code += ")";
  return code;
}

function logicalExpression(left, operator, right, parenthisized = false) {
  // TODO need to differentiate between logical and binary expression using operator type
  let code = "";
  if (parenthisized) code += "(";
  code += left + operator + right;
  if (parenthisized) code += ")";
  return code;
}

function stringLiteral(value) {
  return `"${value}"`;
}

function blockStatement(body, parenthisized = false) {
  let code = " ";
  let l = body.length,
    lastChar;
  if (l > 1 || parenthisized) code = "{";
  for (let i = 0; i < l; ++i) {
    const statement = body[i];
    code += statement;
    lastChar = statement[statement.length - 1];
    if (lastChar !== ";" && lastChar !== "}") {
      code += ";";
    }
  }
  if (l > 1 || parenthisized) {
    if (code[code.length - 1] === ";")
      return code.slice(0, code.length - 1) + "}";
    return code + "}";
  }
  return code;
}

function ifStatement(test, consequent, alternative = []) {
  let code = `if(${test})`;
  code += blockStatement(consequent);
  if (alternative.length) code += `else${blockStatement(alternative)}`;
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
  if (computed) return `${object}[${property}]`;
  let i = 0,
    char = property[i];
  if (
    (char >= "a" && char <= "z") ||
    (char >= "A" && char <= "Z") ||
    char === "_" ||
    char === "$"
  ) {
    char = property[i++];
    while (
      i < property.length &&
      ((char >= "a" && char <= "z") ||
        (char >= "A" && char <= "Z") ||
        (char >= "0" && char <= "9") ||
        char === "_" ||
        char === "$")
    ) {
      char = property[i++];
    }
  }

  return i === property.length
    ? `${object}.${property}`
    : `${object}["${property}"]`;
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

function arrayExpression(elements = []) {
  let code = "[";
  for (let i = 0, l = elements.length; i < l; ++i) {
    if (i > 0) code += ",";
    code += elements[i];
  }
  code += "]";
  return code;
}

function objectExpression(properties = []) {
  let code = "{";
  for (let i = 0, l = properties.length; i < l; ++i) {
    if (i > 0) code += ",";
    code += properties[i];
  }
  code += "}";
  return code;
}

function objectProperty(key, value) {
  return `${key}:${value}`;
}

function ternaryExpression(test, consequent, alternative) {
  return `${test}?${consequent}:${alternative}`;
}

export {
  varDeclarator,
  varDeclaration,
  varAssignment,
  unaryExpression,
  binaryExpression,
  logicalExpression,
  stringLiteral,
  blockStatement,
  ifStatement,
  callExpression,
  memberExpression,
  templateLiteral,
  returnStatement,
  forStatement,
  arrayExpression,
  objectExpression,
  objectProperty,
  ternaryExpression,
};
