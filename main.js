import compile from "./compiler";

const stringSchema = {
  type: "string",
  validations: [
    {
      name: "min",
      value: "3",
    },
    {
      name: "enum",
      value: ["hello", "world", "this"],
    },
  ],
};

const code = compile(stringSchema);
const validator = new Function("d", code);
console.log(code);
console.log(validator("he"));
