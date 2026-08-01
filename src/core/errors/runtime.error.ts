export class RaseoError extends Error {
  readonly code: string;

  constructor(message: string, code: string = "RASEO_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
