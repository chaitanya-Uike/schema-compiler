import compile from "./compiler";

const stringSchema = {
  type: "string",
  validations: [
    {
      name: "min",
      value: "3",
      message: "min length is 3",
    },
    {
      name: "isNum",
      value: true,
    },
  ],
};

const code = compile(stringSchema);
const validator = new Function("d", code);
console.log(code);
console.log(validator("he"));
