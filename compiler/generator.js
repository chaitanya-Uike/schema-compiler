import * as t from "./templates";
import op from "./operators";

const generator = {
  DATA: "d",
  ERRORS: "e",
  LENGTH: "l",

  object: function (schema, state, path) {},

  string: function (schema, state, path) {
    const tests = [];
    const dataVar = this.id(this.DATA, this.level(path));
    const validations = schema.validations;
    let name,
      value,
      error,
      lengthAsg = false,
      patterns = 0;

    const LENGTH_CHECKS = {
      min: { op: op.LESS_THAN, msg: "minimum length should be " },
      max: { op: op.GREATER_THAN, msg: "maximum length should be " },
      length: { op: op.NOT_EQUAL, msg: "length should be " },
    };

    const addRegexTest = (regex, message) => {
      const pattern = this.id("p", patterns++);
      state.addGlobal(t.varDeclarator(pattern, regex));
      tests.push(
        t.ifStatement(
          t.unaryExpression(
            op.NOT,
            t.callExpression(t.memberExpression(pattern, "test"), [dataVar])
          ),
          [this.pushErrorExpression(t.stringLiteral(message), path)]
        )
      );
    };

    const reviveRegex = (regexString) => {
      const m = regexString.match(/\/(.*)\/(.*)?/);
      return new RegExp(m[1], m[2] || "");
    };

    for (let i = 0, l = validations.length; i < l; ++i) {
      ({ name, value, message: error } = validations[i]);
      const check = LENGTH_CHECKS[name];
      if (check) {
        if (!lengthAsg) {
          tests.push(
            t.varDeclaration(op.LET, [
              t.varDeclarator(
                this.LENGTH,
                t.memberExpression(dataVar, "length")
              ),
            ])
          );
          lengthAsg = true;
        }
        value = parseInt(value);
        error = error || check.msg + value;
        tests.push(
          t.ifStatement(t.binaryExpression(this.LENGTH, check.op, value), [
            this.pushErrorExpression(t.stringLiteral(error), path),
          ])
        );
      } else if (name === "match") {
        addRegexTest(reviveRegex(value), error || "value not matching regex");
      } else if (name === "isAlpha" && value) {
        addRegexTest(
          /^[a-zA-Z]*$/,
          error || "value should only contain alphabets"
        );
      } else if (name === "isAlNum" && value) {
        addRegexTest(
          /^[a-z0-9]+$/,
          error || "value should only contain alphaNumeric characters"
        );
      } else if (name === "isNum" && value) {
        error = error || "value should only contain numeric characters";
        tests.push(
          t.ifStatement(
            `isNaN(parseFloat(${dataVar}))||!isFinite(${dataVar})`,
            [this.pushErrorExpression(t.stringLiteral(error), path)]
          )
        );
      } else if (name === "const") {
        error = error || `value not equal to '${value}'`;
        tests.push(
          t.ifStatement(
            t.binaryExpression(dataVar, op.NOT_EQUAL, t.stringLiteral(value)),
            [this.pushErrorExpression(t.stringLiteral(error), path)]
          )
        );
      } else if (name === "enum") {
        const len = value.length;
        let argument = "(";
        for (let i = 0; i < len; ++i) {
          if (i > 0) argument += op.OR;
          argument += t.binaryExpression(
            dataVar,
            op.EQUAL,
            t.stringLiteral(value[i])
          );
        }
        argument += ")";
        error = error || `value should be one of [${value.join(", ")}]`;
        tests.push(
          t.ifStatement(t.unaryExpression(op.NOT, argument), [
            this.pushErrorExpression(t.stringLiteral(error), path),
          ])
        );
      }
    }
    state.write(
      t.ifStatement(
        t.binaryExpression(
          t.unaryExpression(op.TYPE_OF, dataVar),
          op.NOT_EQUAL,
          t.stringLiteral("string")
        ),
        [
          this.pushErrorExpression(
            t.templateLiteral(
              `expected type "string" recieved "\${typeof ${dataVar}}"`
            ),
            path
          ),
        ],
        tests
      )
    );
  },

  pushErrorExpression(message, path) {
    return t.callExpression(t.memberExpression(this.ERRORS, "push"), [
      t.objectExpression([
        t.objectProperty("message", message),
        t.objectProperty("path", t.stringLiteral(path)),
      ]),
    ]);
  },

  id(id, count) {
    return count ? id + count : id;
  },

  level(path) {
    let level = 0;
    for (let i = path.length; i--; ) if (path[i] === "/") level++;
    return level - 1;
  },

  globals(state) {
    return t.varDeclaration(op.LET, state.globals) + ";";
  },

  errorsDec() {
    return t.varDeclarator(this.ERRORS, t.arrayExpression());
  },

  returnStatement() {
    return t.returnStatement(this.ERRORS);
  },
};

export default generator;
