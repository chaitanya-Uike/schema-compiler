import compileStringSchema from "./core/string";

const ctx = {
  DATA: "d",
  ERRORS: "e",
  LENGTH: "l",
  PATTERN: "p",
};

export default function compile(schema) {
  let body;
  if (schema.type === "string") body = compileStringSchema(schema, ctx);
  return generateOutput(body);
}

function generateOutput(body) {
  let output = "";
  for (let i = 0, l = body.length; i < l; ++i) {
    const statement = body[i];
    output += statement;
    if (statement[statement.length - 1] !== ";") output += ";";
  }
  return output;
}
