import { QuotaExceededError } from '@/lib/QuotaExceededError';

/**
 * Executa uma Promise com um limite de tempo.
 *
 * Quando a quota diária do Firestore é atingida, o SDK do Firebase não rejeita
 * as operações de leitura/escrita: ele apenas registra o aviso
 * `resource-exhausted` no console e fica retentando internamente, deixando a
 * Promise pendente para sempre (botões carregando infinitamente).
 *
 * Este helper garante que, se a operação não responder dentro do tempo
 * esperado, um erro seja lançado para que a interface possa avisar o usuário.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms = 10000,
  timeoutError: Error = new QuotaExceededError()
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(timeoutError), ms);
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timeoutId);
  });
}
