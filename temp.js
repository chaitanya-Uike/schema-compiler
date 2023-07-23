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
    },
  ],
};

function v(d) {
  //----handled by root
  let e = [],
    p1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    p2 = /^[a-zA-Z]*$/;
  // ----handled by string schema compiler
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
  //---- handled by root
  return e;
}

function validate(d) {
  //---- handled by root
  let e = [],
    p1 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/,
    p2 = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  //---- handled by object schema compiler
  if (d && typeof d == "object" && !Array.isArray(d))
    e.push({
      message: `expected type "object" recieved "${typeof d}"`,
      path: "/",
    });
  else {
    let d0;
    if (d.email === undefined) {
      e.push({
        message: "required field 'email' is missing",
        path: "/email",
      });
    } else {
      d0 = d.email;
      // ----handled by string schema compiler
      if (typeof d0 !== "string")
        e.push({
          message: `expected type "string" recieved "${typeof d}"`,
          path: "/email",
        });
      else if (!p1.test(d0))
        e.push({ message: "invalid email", path: "/email" });
    }
    if (d.password !== undefined) {
      d0 = d.password;
      // ----handled by string schema compiler
      if (typeof d0 !== "string")
        e.push({
          message: `expected type "string" recieved "${typeof d}"`,
          path: "/password",
        });
      else {
        let l = d0.length;
        if (l < 3) e.push({ message: "min length is 3", path: "/password" });
        if (l > 16) e.push({ message: "max length is 16", path: "/password" });
        if (!p2.test(d0))
          e.push({
            message:
              "Password should have at least one uppercase letter, one lowercase letter, one number and one special character",
            path: "/password",
          });
      }
    }
  }
  //----handled by root
  return e;
}
