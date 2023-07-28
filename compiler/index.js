import generator from "./generator";

export default function compile(schema) {
  const ctx = {
    globals: [generator.errorsDec()],
    patterns: 0,
  };

  const code = generator[schema.type](schema, "/", ctx);
  let output = `function validate(${generator.DATA}){`;
  output += generator.topLevelVarDec(ctx.globals);
  output += code;
  output += generator.returnErrors();
  return output + "}";
}
