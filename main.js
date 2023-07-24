import compile from "./compiler";
import * as t from "./compiler/templates";
import op from "./compiler/operators";

const objectSchema = {
  type: "object",
  properties: [
    {
      type: "string",
      name: "email",
      validations: [
        {
          name: "match",
          value: "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/",
          message: "invalid email",
        },
      ],
      required: true,
    },
    {
      type: "string",
      name: "password",
      validations: [
        {
          name: "min",
          value: "8",
        },
        {
          name: "max",
          value: "16",
        },
        {
          name: "match",
          value:
            "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/",
          message:
            "Password should have at least one uppercase letter, one lowercase letter, one number and one special character",
        },
      ],
    },
    {
      type: "number",
      name: "age",
      validations: [
        { name: "gte", value: 18, message: "age should be greater than 18" },
      ],
      required: true,
    },
    {
      type: "boolean",
      name: "subscribed",
      validations: [{ name: "const", value: "true" }],
      required: true,
    },
    {
      type: "object",
      name: "address",
      properties: [
        {
          type: "string",
          name: "city",
          validations: [
            {
              name: "enum",
              value: ["Mumbai", "Pune"],
            },
          ],
          required: true,
        },
        {
          type: "string",
          name: "country",
          validations: [
            {
              name: "const",
              value: "India",
            },
          ],
          required: true,
        },
      ],
    },
  ],
};

const code = compile(objectSchema);
const validator = new Function("d", code);

console.time("validate");
const errors = validator({
  email: "test@email.com",
  password: "Pass@1234",
  address: { city: "Pune", country: "India" },
  age: 18,
  subscribed: false,
});
console.timeEnd("validate");

console.log(errors);
console.log(code);
