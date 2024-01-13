export class ServerMaintanceError extends Error {
  constructor() {
    super('Estamos com nosso servidor em manutenção, volte mais tarde.');
  }
}
