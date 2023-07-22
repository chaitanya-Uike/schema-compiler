import {
  ifStatement,
  binaryExpression,
  callExpression,
  memberExpression,
  objectExpression,
  objectProperty,
} from "./templates";

export function binaryTest(
  left,
  operator,
  right,
  message,
  value,
  instancePath = "",
  ctx
) {
  return ifStatement(binaryExpression(left, operator, right), [
    pushErrorExpression(value, message, instancePath, ctx),
  ]);
}

export function pushErrorExpression(value, message, instancePath = "", ctx) {
  return callExpression(memberExpression(ctx.ERRORS, "push"), [
    objectExpression([
      objectProperty("value", value),
      objectProperty("message", message),
      objectProperty("instancePath", instancePath),
    ]),
  ]);
}
