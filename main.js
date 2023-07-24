import compile from "./compiler";

const code = compile({
  type: "object",
  validations: [],
  properties: [
    {
      type: "string",
      name: "email",
      required: true,
      validations: [
        {
          name: "match",
          value: "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/",
          message: "invalid email",
        },
      ],
    },
    {
      type: "string",
      name: "password",
      required: true,
      validations: [
        {
          name: "min",
          value: "8",
        },
        {
          name: "max",
          value: "13",
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
      type: "object",
      name: "address",
      required: true,
      validations: [],
      properties: [
        {
          type: "string",
          name: "city",
          required: true,
          validations: [
            {
              name: "enum",
              value: ["Pune", "Mumbai"],
            },
          ],
        },
        {
          type: "string",
          name: "country",
          required: true,
          validations: [
            {
              name: "const",
              value: "India",
            },
          ],
        },
      ],
    },
    {
      type: "number",
      name: "age",
      validations: [
        {
          name: "gte",
          value: "18",
          message: "age should be atleast 18",
        },
      ],
    },
    {
      type: "array",
      name: "numbers",
      validations: [],
      items: {
        type: "number",
        name: "num",
        validations: [
          {
            name: "gte",
            value: "10",
          },
        ],
      },
    },
  ],
  schema_ref: [],
});

const validator = new Function("d", code);

console.time("validate");
const errors = validator({
  email: "test@email.com",
  password: "Pass@1234",
  address: {
    city: "Pune",
    country: "India",
  },
  age: 18,
  numbers: [12, 90, 18],
});
console.timeEnd("validate");

console.log(errors);
console.log(code);
