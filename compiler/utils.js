import {
  ifStatement,
  binaryExpression,
  callExpression,
  memberExpression,
  objectExpression,
  objectProperty,
  stringLiteral,
} from "./templates";

export function binaryTest(left, operator, right, message, path, ctx) {
  return ifStatement(binaryExpression(left, operator, right), [
    pushErrorExpression(message, path, ctx),
  ]);
}

export function pushErrorExpression(message, path, ctx) {
  return callExpression(memberExpression(ctx.ERRORS, "push"), [
    objectExpression([
      objectProperty("message", message),
      objectProperty("path", stringLiteral(path)),
    ]),
  ]);
}
