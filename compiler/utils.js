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
