import compile from "./compiler";

const userSchema = {
  type: "object",
  name: "user_test",
  required: false,
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
      required: false,
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
      required: false,
      validations: [],
      items: {
        type: "number",
        name: "num",
        required: false,
        validations: [
          {
            name: "gte",
            value: "10",
          },
        ],
      },
    },
  ],
};

const arraySchema = {
  type: "array",
  items: {
    type: "number",
    validations: [{ name: "gte", value: 10 }],
  },
  validations: [
    { name: "min", value: "3" },
    { name: "max", value: 5 },
  ],
};

const data1 = {
  email: "test@email.com",
  password: "Pass@1234",
  address: {
    city: "Pune",
    country: "India",
  },
  age: 18,
  numbers: [12, 90, 18, 1],
};

const obj = {
  type: "object",
  properties: [
    {
      type: "number",
      name: "age",
      validations: [{ name: "gte", value: 18 }],
    },
  ],
};

const or = {
  type: "or",
  schemas: [
    { type: "string", validations: [] },
    { type: "number", validations: [] },
  ],
};

const and = {
  type: "and",
  schemas: [
    { type: "string", validations: [{ name: "min", value: 3 }] },
    { type: "string", validations: [{ name: "isNum", value: true }] },
  ],
};

const not = {
  type: "not",
  schemas: [
    { type: "string", validations: [] },
    { type: "number", validations: [] },
  ],
};

const xor = {
  type: "xor",
  schemas: [
    { type: "string", validations: [] },
    { type: "number", validations: [{ name: "gte", value: 10 }] },
  ],
};

const ifThenElse = {
  type: "if then else",
  if: { type: "string", validations: [] },
  // then: { type: "string", validations: [{ name: "const", value: "hello" }] },
  // else: { type: "number", validations: [{ name: "const", value: 100 }] },
};

const code = compile(ifThenElse);
// const validator = new Function("data", code);

// const errors = validator(100);

// console.log(errors);
console.log(code);

function x(data) {
  let errors = [];
  let vErr = [];
  if (typeof data !== "string")
    vErr.push({ message: "expected type 'string'", path: `/` });
  let valid = vErr.length === 0;
  return errors;
}
