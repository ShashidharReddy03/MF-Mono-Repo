export class SessionTimeoutError extends Error {
  constructor() {
    super("SESSION_TIMEOUT");
    this.name = "SessionTimeoutError";
  }
}
