import * as t from "./templates";
import op from "./operators";

const generator = {
  DATA: "data",
  ERRORS: "errors",
  LENGTH: "len",

  object: function (schema, path, ctx) {
    const level = this.level(path);
    const dataVar = this.id(this.DATA, level);
    const properties = schema.properties;
    let property, name, type, required, childPath;

    const childDataVar = this.id(this.DATA, level + 1);
    const propTests = [
      t.varDeclaration(op.LET, [t.varDeclarator(childDataVar)]),
    ];

    for (let i = 0, l = properties.length; i < l; ++i) {
      property = properties[i];
      ({ name, type, required } = property);
      childPath = this.addToPath(path, name);

      const propertyValLogic = [
        t.varAssignment(
          childDataVar,
          op.ASSIGN,
          t.memberExpression(dataVar, name)
        ),
        this[type](property, childPath, ctx),
      ];

      if (required) {
        propTests.push(
          t.ifStatement(
            t.binaryExpression(
              t.memberExpression(dataVar, name),
              op.EQUAL,
              "undefined"
            ),
            [
              this.pushErrorExpression(
                t.stringLiteral(`required field '${name}' is missing`),
                childPath
              ),
            ],
            propertyValLogic
          )
        );
      } else {
        propTests.push(
          t.ifStatement(
            t.binaryExpression(
              t.memberExpression(dataVar, name),
              op.NOT_EQUAL,
              "undefined"
            ),
            propertyValLogic
          )
        );
      }
    }

    const typeCheck = `!${dataVar}||typeof ${dataVar}!=="object"||Array.isArray(${dataVar})`;
    let output = t.ifStatement(
      typeCheck,
      [
        this.pushErrorExpression(
          t.stringLiteral("expected type 'object'"),
          path
        ),
      ],
      propTests
    );

    return this.addSemiColon(output);
  },

  array: function (schema, path, ctx) {
    const level = this.level(path);
    const dataVar = this.id(this.DATA, level);
    const itemSchema = schema.items;
    const childDataVar = this.id(this.DATA, level + 1);
    const alternative = [];
    const validations = schema.validations || [];

    if (itemSchema) {
      const type = itemSchema.type;
      // var declaration
      alternative.push(
        t.varDeclaration(op.LET, [
          t.varDeclarator(this.LENGTH, t.memberExpression(dataVar, "length")),
          t.varDeclarator(childDataVar),
        ])
      );
      //for loop
      alternative.push(
        t.forStatement(
          t.varDeclaration(op.LET, [t.varDeclarator("i", "0")]),
          t.binaryExpression("i", op.LESS_THAN, this.LENGTH),
          t.unaryExpression(op.INCREMENT, "i", false),
          [
            t.varAssignment(
              childDataVar,
              op.ASSIGN,
              t.memberExpression(dataVar, "i", true)
            ),
            this[type](itemSchema, this.addToPath(path, "${i}"), ctx),
          ]
        )
      );
    }

    if (validations.length) {
      if (!itemSchema) {
        alternative.push(
          t.varDeclaration(op.LET, [
            t.varDeclarator(this.LENGTH, t.memberExpression(dataVar, "length")),
          ])
        );
      }

      const LENGTH_CHECKS = {
        min: { op: op.LESS_THAN, msg: "minimum length should be " },
        max: { op: op.GREATER_THAN, msg: "maximum length should be " },
        length: { op: op.NOT_EQUAL, msg: "length should be " },
      };

      let name, value, error;
      for (let i = 0, l = validations.length; i < l; ++i) {
        ({ name, value, message: error } = validations[i]);
        value = parseInt(value, 10);
        const check = LENGTH_CHECKS[name];
        error = error || check.msg + value;
        if (check) {
          alternative.push(
            t.ifStatement(t.binaryExpression(this.LENGTH, check.op, value), [
              this.pushErrorExpression(t.stringLiteral(error), path),
            ])
          );
        }
      }
    }

    const output = t.ifStatement(
      t.unaryExpression(
        op.NOT,
        t.callExpression(t.memberExpression("Array", "isArray"), [dataVar])
      ),
      [
        this.pushErrorExpression(
          t.stringLiteral("expected type 'array'"),
          path
        ),
      ],
      alternative
    );

    return this.addSemiColon(output);
  },

  string: function (schema, path, ctx) {
    const tests = [];
    const level = this.level(path);
    const dataVar = this.id(this.DATA, level);
    const lengthVar = this.id(this.LENGTH, level);
    const validations = schema.validations;
    let name,
      value,
      error,
      check,
      lengthAsg = false;

    const LENGTH_CHECKS = {
      min: { op: op.LESS_THAN, msg: "minimum length should be " },
      max: { op: op.GREATER_THAN, msg: "maximum length should be " },
      length: { op: op.NOT_EQUAL, msg: "length should be " },
    };

    const addRegexTest = (regex, message) => {
      const pattern = this.id("p", ctx.patterns++);
      ctx.globals.push(t.varDeclarator(pattern, regex));
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
      try {
        const m = regexString.match(/\/(.*)\/(.*)?/);
        return new RegExp(m[1], m[2] || "");
      } catch (error) {
        console.error(error);
        throw new Error("Error constructing regex");
      }
    };

    for (let i = 0, l = validations.length; i < l; ++i) {
      ({ name, value, message: error } = validations[i]);
      if (LENGTH_CHECKS[name]) {
        check = LENGTH_CHECKS[name];
        if (!lengthAsg) {
          tests.push(
            t.varDeclaration(op.LET, [
              t.varDeclarator(lengthVar, t.memberExpression(dataVar, "length")),
            ])
          );
          lengthAsg = true;
        }
        value = parseInt(value, 10);
        error = error || check.msg + value;
        tests.push(
          t.ifStatement(t.binaryExpression(lengthVar, check.op, value), [
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

    const output = t.ifStatement(
      t.binaryExpression(
        t.unaryExpression(op.TYPE_OF, dataVar),
        op.NOT_EQUAL,
        t.stringLiteral("string")
      ),
      [
        this.pushErrorExpression(
          t.stringLiteral("expected type 'string'"),
          path
        ),
      ],
      tests
    );

    return this.addSemiColon(output);
  },

  number: function (schema, path) {
    const tests = [];
    const dataVar = this.id(this.DATA, this.level(path));
    const validations = schema.validations;
    let name, value, error, check;

    const COMPARISON_CHECKS = {
      gt: { op: op.LESS_THAN_EQUAL, msg: "value should be greater than " },
      gte: {
        op: op.LESS_THAN,
        msg: "value should be greater than or equal to ",
      },
      lt: { op: op.GREATER_THAN_EQUAL, msg: "value should be less than " },
      lte: {
        op: op.GREATER_THAN,
        msg: "value should be less than or equal to ",
      },
    };

    const DOMAIN_CHECKS = {
      positive: {
        op: op.LESS_THAN_EQUAL,
        msg: "positive ( > 0) value expected",
      },
      negative: {
        op: op.GREATER_THAN_EQUAL,
        msg: "negative (< 0) value expected",
      },
      "non-negative": {
        op: op.LESS_THAN,
        msg: "non-negative ( ≥ 0) value expected",
      },
      "non-positive": {
        op: op.GREATER_THAN,
        msg: "non-positive ( ≤ 0) value expected",
      },
    };

    for (let i = 0, l = validations.length; i < l; ++i) {
      ({ name, value, message: error } = validations[i]);

      if (COMPARISON_CHECKS[name]) {
        check = COMPARISON_CHECKS[name];
        value = parseFloat(value);
        error = error || check.msg + value;
        tests.push(
          t.ifStatement(t.binaryExpression(dataVar, check.op, value), [
            this.pushErrorExpression(t.stringLiteral(error), path),
          ])
        );
      } else if (DOMAIN_CHECKS[name] && value) {
        check = DOMAIN_CHECKS[name];
        error = error || check.msg;
        tests.push(
          t.ifStatement(t.binaryExpression(dataVar, check.op, 0), [
            this.pushErrorExpression(t.stringLiteral(error), path),
          ])
        );
      } else if (name === "integer" && value) {
        tests.push(
          t.ifStatement(
            t.unaryExpression(
              op.NOT,
              t.callExpression(t.memberExpression("Number", "isInteger"), [
                dataVar,
              ])
            ),
            [
              this.pushErrorExpression(
                t.stringLiteral(error || "integer expected"),
                path
              ),
            ]
          )
        );
      } else if (name === "const") {
        error = error || `value not equal to '${value}'`;
        tests.push(
          t.ifStatement(t.binaryExpression(dataVar, op.NOT_EQUAL, value), [
            this.pushErrorExpression(t.stringLiteral(error), path),
          ])
        );
      } else if (name === "enum") {
        const len = value.length;
        let argument = "(";
        for (let i = 0; i < len; ++i) {
          if (i > 0) argument += op.OR;
          argument += t.binaryExpression(dataVar, op.EQUAL, value[i]);
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

    const output = t.ifStatement(
      t.binaryExpression(
        t.unaryExpression(op.TYPE_OF, dataVar),
        op.NOT_EQUAL,
        t.stringLiteral("number")
      ),
      [
        this.pushErrorExpression(
          t.stringLiteral("expected type 'number'"),
          path
        ),
      ],
      tests
    );

    return this.addSemiColon(output);
  },

  boolean: function (schema, path) {
    const tests = [];
    const dataVar = this.id(this.DATA, this.level(path));
    const validations = schema.validations;
    let name, value, error;

    for (let i = 0, l = validations.length; i < l; ++i) {
      ({ name, value, message: error } = validations[i]);

      if (name === "const") {
        const test =
          value === "true" ? t.unaryExpression(op.NOT, dataVar) : dataVar;
        error = error
          ? t.stringLiteral(error)
          : t.templateLiteral(`value should be '${value}'`);
        tests.push(
          t.ifStatement(test, [this.pushErrorExpression(error, path)])
        );
      }
    }

    const output = t.ifStatement(
      t.binaryExpression(
        t.unaryExpression(op.TYPE_OF, dataVar),
        op.NOT_EQUAL,
        t.stringLiteral("boolean")
      ),
      [
        this.pushErrorExpression(
          t.stringLiteral("expected type 'boolean'"),
          path
        ),
      ],
      tests
    );

    return this.addSemiColon(output);
  },

  null: function (schema, path) {
    const dataVar = this.id(this.DATA, this.level(path));
    const output = t.ifStatement(
      t.binaryExpression(dataVar, op.NOT_EQUAL, "null"),
      [this.pushErrorExpression(t.stringLiteral("expected type 'null'"), path)]
    );

    return this.addSemiColon(output);
  },

  or: function (schema, path, ctx) {
    const level = this.level(path);
    const schemas = schema.schemas;
    const errorVar = this.id("vErr", level);
    const prevErr = this.ERRORS;
    this.ERRORS = errorVar;
    const ERROR_COUNT = this.id("e", level);

    let s,
      code,
      output = [
        t.varDeclaration(op.LET, [
          t.varDeclarator(this.ERRORS, t.arrayExpression()),
          t.varDeclarator(ERROR_COUNT, "0"),
        ]),
      ];
    for (let i = 0, l = schemas.length; i < l; ++i) {
      s = schemas[i];
      code = this[s.type](s, path, ctx);
      if (i === 0) output.push(code);
      else {
        output.push(
          t.ifStatement(
            t.binaryExpression(
              ERROR_COUNT,
              op.NOT_EQUAL,
              t.memberExpression(this.ERRORS, "length")
            ),
            [
              t.varAssignment(
                ERROR_COUNT,
                op.ASSIGN,
                t.memberExpression(this.ERRORS, "length")
              ),
              code,
            ]
          )
        );
      }
    }
    output.push(
      t.ifStatement(
        t.binaryExpression(
          ERROR_COUNT,
          op.NOT_EQUAL,
          t.memberExpression(this.ERRORS, "length")
        ),
        [
          t.varDeclaration(op.LET, [
            t.varDeclarator(
              "error_",
              t.objectExpression([
                t.objectProperty(
                  "message",
                  t.stringLiteral("at least one schema should be valid")
                ),
                t.objectProperty(
                  "path",
                  t.stringLiteral(this.addToPath(path, "or"))
                ),
                t.objectProperty("errors", this.ERRORS),
              ])
            ),
          ]),
          t.callExpression(t.memberExpression(prevErr, "push"), ["error_"]),
        ]
      )
    );
    this.ERRORS = prevErr;

    return this.join(output);
  },

  and: function (schema, path, ctx) {
    const level = this.level(path);
    const schemas = schema.schemas;
    const errorVar = this.id("vErr", level);
    const prevErr = this.ERRORS;
    this.ERRORS = errorVar;
    let s,
      code,
      output = [
        t.varDeclaration(op.LET, [
          t.varDeclarator(errorVar, t.arrayExpression()),
        ]),
      ];
    for (let i = 0, l = schemas.length; i < l; ++i) {
      s = schemas[i];
      code = this[s.type](s, path, ctx);
      output.push(code);
    }
    output.push(
      t.ifStatement(t.memberExpression(this.ERRORS, "length"), [
        t.varDeclaration(op.LET, [
          t.varDeclarator(
            "error_",
            t.objectExpression([
              t.objectProperty(
                "message",
                t.stringLiteral("all schema should be valid")
              ),
              t.objectProperty(
                "path",
                t.stringLiteral(this.addToPath(path, "and"))
              ),
              t.objectProperty("errors", this.ERRORS),
            ])
          ),
        ]),
        t.callExpression(t.memberExpression(prevErr, "push"), ["error_"]),
      ])
    );
    this.ERRORS = prevErr;

    return this.join(output);
  },

  not: function (schema, path, ctx) {
    const level = this.level(path);
    const schemas = schema.schemas;
    const errorVar = this.id("vErr", level);
    const prevErr = this.ERRORS;
    this.ERRORS = errorVar;
    const ERROR_COUNT = this.id("e", level);
    const VALID_COUNT = this.id("v", level);

    let s,
      code,
      output = [
        t.varDeclaration(op.LET, [
          t.varDeclarator(this.ERRORS, t.arrayExpression()),
          t.varDeclarator(ERROR_COUNT, "0"),
          t.varDeclarator(VALID_COUNT, "0"),
        ]),
      ];

    for (let i = 0, l = schemas.length; i < l; ++i) {
      s = schemas[i];
      code = this[s.type](s, path, ctx);
      output.push(code);
      output.push(
        t.logicalExpression(
          t.binaryExpression(
            t.memberExpression(this.ERRORS, "length"),
            op.EQUAL,
            ERROR_COUNT
          ),
          op.AND,
          t.unaryExpression(op.INCREMENT, VALID_COUNT)
        )
      );
      output.push(
        t.varAssignment(
          ERROR_COUNT,
          op.ASSIGN,
          t.memberExpression(this.ERRORS, "length")
        )
      );
    }
    output.push(
      t.ifStatement(VALID_COUNT, [
        t.varDeclaration(op.LET, [
          t.varDeclarator(
            "error_",
            t.objectExpression([
              t.objectProperty(
                "message",
                t.stringLiteral("no schema should be valid")
              ),
              t.objectProperty(
                "path",
                t.stringLiteral(this.addToPath(path, "not"))
              ),
              t.objectProperty("validSchema", VALID_COUNT),
            ])
          ),
        ]),
        t.callExpression(t.memberExpression(prevErr, "push"), ["error_"]),
      ])
    );
    this.ERRORS = prevErr;

    return this.join(output);
  },

  xor: function (schema, path, ctx) {
    const level = this.level(path);
    const schemas = schema.schemas;
    const errorVar = this.id("vErr", level);
    const prevErr = this.ERRORS;
    this.ERRORS = errorVar;
    const ERROR_COUNT = this.id("e", level);
    const VALID_COUNT = this.id("v", level);

    let s,
      code,
      output = [
        t.varDeclaration(op.LET, [
          t.varDeclarator(this.ERRORS, t.arrayExpression()),
          t.varDeclarator(ERROR_COUNT, "0"),
          t.varDeclarator(VALID_COUNT, "0"),
        ]),
      ];

    for (let i = 0, l = schemas.length; i < l; ++i) {
      s = schemas[i];
      code = this[s.type](s, path, ctx);
      output.push(code);
      output.push(
        t.logicalExpression(
          t.binaryExpression(
            t.memberExpression(this.ERRORS, "length"),
            op.EQUAL,
            ERROR_COUNT
          ),
          op.AND,
          t.unaryExpression(op.INCREMENT, VALID_COUNT)
        )
      );
      output.push(
        t.varAssignment(
          ERROR_COUNT,
          op.ASSIGN,
          t.memberExpression(this.ERRORS, "length")
        )
      );
    }
    output.push(
      t.ifStatement(t.binaryExpression(VALID_COUNT, op.NOT_EQUAL, "1"), [
        t.varDeclaration(op.LET, [
          t.varDeclarator(
            "error_",
            t.objectExpression([
              t.objectProperty(
                "message",
                t.ternaryExpression(
                  t.binaryExpression(VALID_COUNT, op.GREATER_THAN, "1"),
                  t.stringLiteral("only one schema should be valid"),
                  t.stringLiteral("one schema should be valid")
                )
              ),
              t.objectProperty(
                "path",
                t.stringLiteral(this.addToPath(path, "xor"))
              ),
              t.objectProperty("validSchema", VALID_COUNT),
            ])
          ),
        ]),
        t.callExpression(t.memberExpression(prevErr, "push"), ["error_"]),
      ])
    );
    this.ERRORS = prevErr;

    return this.join(output);
  },

  "if then else": function (schema, path, ctx) {
    const level = this.level(path);
    const errorVar = this.id("vErr", level);
    const IF_VALID = this.id("valid", level);
    const prevErr = this.ERRORS;
    let output = [
      t.varDeclaration(op.LET, [
        t.varDeclarator(errorVar, t.arrayExpression()),
      ]),
    ];

    // if schema
    this.ERRORS = errorVar;
    if (!schema.if || !(schema.then || schema.else)) {
      this.ERRORS = prevErr;
      return "";
    }
    output.push(this[schema.if.type](schema.if, path, ctx));
    this.ERRORS = prevErr;

    output.push(
      t.varDeclaration(op.LET, [
        t.varDeclarator(
          IF_VALID,
          t.binaryExpression(
            t.memberExpression(errorVar, "length"),
            op.EQUAL,
            "0"
          )
        ),
      ])
    );

    let thenCode, elseCode;
    if (schema.then)
      thenCode = "{" + this[schema.then.type](schema.then, path, ctx) + "}";
    if (schema.else)
      elseCode = "{" + this[schema.else.type](schema.else, path, ctx) + "}";

    let test, consequent, alternative;
    if (thenCode && elseCode) {
      test = IF_VALID;
      consequent = [thenCode];
      alternative = [elseCode];
    } else if (thenCode || elseCode) {
      test = thenCode ? IF_VALID : t.unaryExpression(op.NOT, IF_VALID);
      consequent = [thenCode || elseCode];
    }

    if (test) output.push(t.ifStatement(test, consequent, alternative));
    return this.join(output);
  },

  schema_ref: function () {
    throw new Error("schema_ref is currently not supported");
  },

  self_ref: function () {
    throw new Error("self_ref is currently not supported");
  },

  join(statements) {
    let output = "";
    for (let i = 0, l = statements.length; i < l; ++i) {
      const statement = statements[i];
      output += statement;
      let lastChar = statement[statement.length - 1];
      if (lastChar !== ";" && lastChar !== "}") output += ";";
    }
    return output;
  },

  pushErrorExpression(message, path) {
    return t.callExpression(t.memberExpression(this.ERRORS, "push"), [
      t.objectExpression([
        t.objectProperty("message", message),
        t.objectProperty("path", t.templateLiteral(path)),
      ]),
    ]);
  },

  id(id, count) {
    return count ? `${id}${count}` : id;
  },

  level(path) {
    const l = path.length;
    if (l === 1) return 0;
    let level = 0;
    for (let i = 0; i < l; ++i) if (path[i] === "/") level++;
    return level;
  },

  topLevelVarDec(globals) {
    return t.varDeclaration(op.LET, globals) + ";";
  },

  errorsDec() {
    return t.varDeclarator(this.ERRORS, t.arrayExpression());
  },

  returnErrors() {
    return t.returnStatement(this.ERRORS);
  },

  addToPath(path, value) {
    if (path[path.length - 1] !== "/") path += "/";
    return path + value;
  },

  addSemiColon(code) {
    let lastChar = code[code.length - 1];
    return lastChar !== ";" && lastChar !== "}" ? code + ";" : code;
  },
};

export default generator;
