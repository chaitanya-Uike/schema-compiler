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

console.time("compile");
const code = compile(stringSchema);
console.timeEnd("compile");

const validator = new Function("d", code);
console.log(code);

console.time("validate");
validator("he");
console.timeEnd("validate");

import Ajv from "ajv";

const ajv = new Ajv();

const validate = ajv.compile({
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 3,
    },
    password: {
      type: "string",
      maxLength: 12,
    },
  },
  required: ["name"],
});

console.log(validate);
