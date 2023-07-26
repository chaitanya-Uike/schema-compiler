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

const code = compile(or);
const validator = new Function("data", code);

const errors = validator();

console.log(errors);
console.log(code);

function v(data) {
  let errors = [];
  let vErr = [],
    e = 0;
  if (typeof data !== "string")
    vErr.push({ message: "expected type 'string'", path: `/` });
  if (e !== vErr.length) {
    e = vErr.length;
    if (typeof data !== "number")
      vErr.push({ message: "expected type 'number'", path: `/` });
  }
  if (e !== vErr.length) {
    let error_ = {
      message: "at least one schema should be valid",
      path: "/or",
      errors: vErr,
    };
    errors.push(error_);
  }
  return errors;
}

// import Ajv from "ajv";

// const ajv = new Ajv();

// const v = ajv.compile({
//   anyOf: [{ type: "number" }, { type: "string" }],
// });

// console.log(v);
