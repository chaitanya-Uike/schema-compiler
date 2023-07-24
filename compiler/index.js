import generator from "./generator";

export default function compile(schema) {
  const ctx = {
    globals: [generator.errorsDec()],
    patterns: 0,
  };
  const type = schema.type.replace(" ", "_");

  const code = generator[type](schema, "/", ctx);
  let output = generator.topLevelVarDec(ctx.globals);
  output += code;
  output += generator.returnErrors();
  return output;
}
