const arraySchema = {
  type: "array",
  items: {
    type: {
      type: "number",
      validations: [
        {
          name: "gte",
          value: 10,
        },
      ],
    },
  },
  validations: [{ name: "min", value: 2 }],
};

function validateArray(d) {
  let e = [];
  if (!Array.isArray(d)) e.push(`expected type "array" recieved "${typeof d}"`);
  let l = d.length;
  for (let i = 0; i < l; ++i) {
    let v = d[i];
    if (typeof v !== "number")
      e.push(`expected type "number" recieved "${typeof d}"`);
    else if (v < 10) e.push("value should be greater than equal to 10");
  }
  if (l < 2) e.push("array length should be greater than 2");
  return e;
}
