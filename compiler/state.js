export default class State {
  constructor() {
    this.output = "";
    this.globals = [];
  }

  write(code) {
    this.output += code;
    if (this.output[this.output.length - 1] !== ";") this.output += ";";
  }

  addGlobal(declaration) {
    this.globals.push(declaration);
  }
}
