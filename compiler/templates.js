function varDeclaration(type, identifier, init) {
  let code = `${type} ${identifier}`;
  if (init) code += `=${init}`;
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

function logicalExpression(left, operator, right, parentisized = false) {
  // TODO need to differentiate between logical and binary expression using operator type
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
  let code = "";
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
    const prop = properties[i];
    code += `${prop.key}:${prop.value}`;
  }
  code += "}";
  return code;
}

export {
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
};
