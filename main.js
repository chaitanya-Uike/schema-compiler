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
      name: "match",
      value: "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/",
      message: "invalid email",
    },
    {
      name: "isAlpha",
      value: true,
    },
  ],
};

const code = compile(stringSchema);
const validator = new Function("d", code);
console.log(code);
console.log(validator("he"));
