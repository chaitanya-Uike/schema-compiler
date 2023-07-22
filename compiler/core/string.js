import {
  varDeclaration,
  unaryExpression,
  binaryExpression,
  stringLiteral,
  ifStatement,
  callExpression,
  memberExpression,
  templateLiteral,
  returnStatement,
  arrayExpression,
} from "../templates";
import { pushErrorExpression } from "../utils";
import op from "../operators";

const lengthChecks = {
  min: { op: op.LESS_THAN, msg: "minimum length should be " },
  max: { op: op.GREATER_THAN, msg: "maximum length should be " },
  length: { op: op.NOT_EQUAL, msg: "length should be " },
};

export default function compileStringSchema(schema, path, ctx) {
  const body = [varDeclaration(op.LET, ctx.ERRORS, arrayExpression())];
  const vars = [];
  const tests = [];
  const validations = schema.validations;
  let validation,
    name,
    value,
    message,
    lengthAsg = false,
    patternVarCount = 1,
    errorMsg;

  function addRegexTest(regex, message) {
    const pattern = `${ctx.PATTERN}${patternVarCount++}`;
    vars.push(varDeclaration(op.LET, pattern, regex));
    tests.push(
      ifStatement(
        unaryExpression(
          op.NOT,
          callExpression(memberExpression(pattern, "test"), [ctx.DATA])
        ),
        [pushErrorExpression(stringLiteral(message), path, ctx)]
      )
    );
  }

  for (let i = 0, l = validations.length; i < l; ++i) {
    validation = validations[i];
    name = validation.name;
    value = validation.value;
    message = validation.message;

    const lengthCheck = lengthChecks[name];
    if (lengthCheck) {
      if (!lengthAsg) {
        tests.push(
          varDeclaration(
            op.LET,
            ctx.LENGTH,
            memberExpression(ctx.DATA, "length")
          )
        );
        lengthAsg = true;
      }
      value = parseInt(value);
      errorMsg = message || lengthCheck.msg + value;
      tests.push(
        ifStatement(binaryExpression(ctx.LENGTH, lengthCheck.op, value), [
          pushErrorExpression(stringLiteral(errorMsg), path, ctx),
        ])
      );
    } else if (name === "match") {
      addRegexTest(reviveRegex(value), message || "value not matching regex");
    } else if (name === "isAlpha" && value) {
      addRegexTest(
        /^[a-zA-Z]*$/,
        message || "value should only contain alphabets"
      );
    } else if (name === "isAlNum" && value) {
      addRegexTest(
        /^[a-z0-9]+$/,
        message || "value should only contain alphaNumeric characters"
      );
    } else if (name === "isNum" && value) {
      errorMsg = message || "value should only contain numeric characters";
      tests.push(
        ifStatement(`isNaN(parseFloat(${ctx.DATA}))||!isFinite(${ctx.DATA})`, [
          pushErrorExpression(stringLiteral(errorMsg), path, ctx),
        ])
      );
    } else if (name === "const") {
      errorMsg = message || `value not equal to '${value}'`;
      tests.push(
        ifStatement(
          binaryExpression(ctx.DATA, op.NOT_EQUAL, stringLiteral(value)),
          [pushErrorExpression(stringLiteral(errorMsg), path, ctx)]
        )
      );
    } else if (name === "enum") {
      const len = value.length;
      let argument = "(";
      for (let i = 0; i < len; ++i) {
        if (i > 0) argument += op.OR;
        argument += binaryExpression(
          ctx.DATA,
          op.EQUAL,
          stringLiteral(value[i])
        );
      }
      argument += ")";
      errorMsg = message || `value should be one of [${value.join(", ")}]`;
      tests.push(
        ifStatement(unaryExpression(op.NOT, argument), [
          pushErrorExpression(stringLiteral(errorMsg), path, ctx),
        ])
      );
    }
  }
  body.push(...vars);
  body.push(
    ifStatement(
      binaryExpression(
        unaryExpression(op.TYPE_OF, ctx.DATA),
        op.NOT_EQUAL,
        stringLiteral("string")
      ),
      [
        pushErrorExpression(
          templateLiteral('expected type "string" recieved "${typeof d}"'),
          path,
          ctx
        ),
      ],
      tests
    )
  );
  body.push(returnStatement(ctx.ERRORS));
  return body;
}

function reviveRegex(regexString) {
  const m = regexString.match(/\/(.*)\/(.*)?/);
  return new RegExp(m[1], m[2] || "");
}
