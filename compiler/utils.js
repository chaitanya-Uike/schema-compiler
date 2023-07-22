import {
  callExpression,
  memberExpression,
  objectExpression,
  objectProperty,
  stringLiteral,
} from "./templates";

export function pushErrorExpression(message, path, ctx) {
  return callExpression(memberExpression(ctx.ERRORS, "push"), [
    objectExpression([
      objectProperty("message", message),
      objectProperty("path", stringLiteral(path)),
    ]),
  ]);
}
