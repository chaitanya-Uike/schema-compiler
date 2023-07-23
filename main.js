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
    {
      name: "const",
      value: "test@email.com",
    },
    {
      name: "enum",
      value: ["hello", "world"],
    },
  ],
};

const code = compile(stringSchema);
const validator = new Function("d", code);
console.log(validator("he"));
console.log(code);
