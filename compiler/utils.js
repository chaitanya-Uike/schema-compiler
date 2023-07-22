import {
  ifStatement,
  binaryExpression,
  callExpression,
  memberExpression,
  stringLiteral,
} from "./templates";

export function binaryTest(left, operator, right, message, ctx) {
  return ifStatement(binaryExpression(left, operator, right), [
    callExpression(memberExpression(ctx.ERRORS, "push"), [
      stringLiteral(message),
    ]),
  ]);
}

export function reviveRegex(regexString) {
  const m = regexString.match(/\/(.*)\/(.*)?/);
  return new RegExp(m[1], m[2] || "");
}
