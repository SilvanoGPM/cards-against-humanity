export class MatchesLimitError extends Error {
  constructor() {
    super('Limite de partidas atingido');
  }
}
