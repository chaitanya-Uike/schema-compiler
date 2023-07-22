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
} from "../templates";
import { binaryTest, reviveRegex } from "../utils";
import op from "../operators";

const lengthChecks = {
  min: { op: op.LESS_THAN, msg: "minimum length should be " },
  max: { op: op.GREATER_THAN, msg: "maximum length should be " },
  length: { op: op.NOT_EQUAL, msg: "length should be " },
};

export default function compileStringSchema(schema, ctx) {
  const body = [varDeclaration(op.LET, ctx.ERRORS, op.ARRAY_EXP)];
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
    const pattern = `${ctx.PATTERN}${patternVarCount++}`;
    vars.push(varDeclaration(op.LET, pattern, regex));
    tests.push(
      ifStatement(
        unaryExpression(
          op.NOT,
          callExpression(memberExpression(pattern, "test"), [ctx.DATA])
        ),
        [
          callExpression(memberExpression(ctx.ERRORS, "push"), [
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
          varDeclaration(
            op.LET,
            ctx.LENGTH,
            memberExpression(ctx.DATA, "length")
          )
        );
        lengthAsg = true;
      }
      v = parseInt(value);
      tests.push(
        binaryTest(ctx.LENGTH, lengthCheck.op, v, lengthCheck.msg + v, ctx)
      );
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
        ifStatement(
          `isNaN(parseFloat(${ctx.DATA})) || !isFinite(${ctx.DATA})`,
          [
            callExpression(memberExpression(ctx.ERRORS, "push"), [
              stringLiteral("value should only contain numeric characters"),
            ]),
          ]
        )
      );
    } else if (name === "const") {
      tests.push(
        binaryTest(
          ctx.DATA,
          op.NOT_EQUAL,
          stringLiteral(value),
          `value not equal to '${value}'`,
          ctx
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
      tests.push(
        ifStatement(unaryExpression(op.NOT, argument), [
          callExpression(memberExpression(ctx.ERRORS, "push"), [
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
        unaryExpression(op.TYPE_OF, ctx.DATA),
        op.NOT_EQUAL,
        stringLiteral("string")
      ),
      [
        callExpression(memberExpression(ctx.ERRORS, "push"), [
          templateLiteral('expected type "string" recieved "${typeof d}"'),
        ]),
      ],
      tests
    )
  );
  body.push(returnStatement(ctx.ERRORS));
  return body;
}
