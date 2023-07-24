import compile from "./compiler";

const userSchema = {
  id: "cc48261e-f9f2-4bd0-a43f-27e8cc3d9012",
  type: "object",
  name: "user_test",
  required: false,
  validations: [],
  properties: [
    {
      id: "ba7d449d-fb68-46f8-a0b5-51cdc4b14175",
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
      id: "8bebb793-1912-427e-b860-3c42aa217013",
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
      id: "ff9980d0-03e3-419c-832e-914e434d687f",
      type: "object",
      name: "address",
      required: true,
      validations: [],
      properties: [
        {
          id: "bbac2090-51a6-46a7-96c5-83738660f789",
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
          id: "1e67e8f4-240d-44d8-9d1d-06ea9d315c4a",
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
      id: "699031e6-2131-4529-afe8-7731d5be6272",
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
      id: "c09e7cd1-7eaa-4880-b51f-1eb94c77718e",
      type: "array",
      name: "numbers",
      required: false,
      validations: [],
      items: {
        id: "f27f3584-a4db-4c17-a81c-fb1f91f8440f",
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
  schema_ref: [],
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

const code = compile(arraySchema);
const validator = new Function("d", code);

const errors = validator(data1);

console.log(errors);
console.log(code);
