import generator from "./generator";
import State from "./state";

export default function compile(schema) {
  const state = new State();

  state.addGlobal(generator.errorsDec());

  const type = schema.type.replace(" ", "_");
  generator[type](schema, state, "/");

  let output = generator.globals(state);
  output += state.output;
  output += generator.returnStatement();
  return output;
}
