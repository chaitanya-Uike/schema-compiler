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
          value: "3",
        },
        {
          name: "max",
          value: "16",
        },
        {
          name: "match",
          value:
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
          message:
            "Password should have at least one uppercase letter, one lowercase letter, one number and one special character",
        },
      ],
      required: true,
    },
  ],
};

function v(d) {
  let e = [];
  let p1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let p2 = /^[a-zA-Z]*$/;
  if (typeof d !== "string")
    e.push({
      message: `expected type "string" recieved "${typeof d}"`,
      path: "/",
    });
  else {
    let l = d.length;
    if (l < 3) e.push({ message: "min length is 3", path: "/" });
    if (!p1.test(d)) e.push({ message: "invalid email", path: "/" });
    if (!p2.test(d))
      e.push({ message: "value should only contain alphabets", path: "/" });
    if (d !== "test@email.com")
      e.push({ message: "value not equal to 'test@email.com'", path: "/" });
    if (!(d === "hello" || d === "world"))
      e.push({ message: "value should be one of [hello, world]", path: "/" });
  }
  return e;
}

function validate(d) {
  let e = [];
  let p1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
  let p;
}
