import { adminsCollection, usersCollection } from '@/firebase/config';
import { User } from 'firebase/auth';
import { deleteField, doc, setDoc } from 'firebase/firestore';

import Repository from '@/lib/Repository';
import { getAny } from './core';

const USERS_KEY = '@CARDS_AGAINST_HUMANITY/USERS';

/** Perfis mudam muito pouco; um dia de cache é conservador. */
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface CachedUser {
  user: UserType;
  cachedAt: number;
}

type UsersCache = Record<string, CachedUser>;

/**
 * `convertMatch` resolve uma DocumentReference de usuário para cada jogador,
 * cada resposta, cada voto e cada deck — e roda a cada snapshot da partida.
 * Sem cache, isso são dezenas de `getDoc` faturados por evento, por cliente
 * conectado: é a maior fonte isolada de leituras do projeto.
 *
 * Duas camadas resolvem o problema:
 *   1. `PENDING` deduplica chamadas simultâneas do mesmo uid (a conversão pede
 *      o mesmo jogador várias vezes em paralelo → vira uma leitura só);
 *   2. `CACHE` evita reler entre snapshots e entre sessões (localStorage).
 *
 * Mesmo padrão já usado em `services/cards.ts`.
 */
let CACHE: UsersCache = Repository.get<UsersCache>(USERS_KEY) || {};

const PENDING = new Map<string, Promise<UserType>>();

function isFresh(cached: CachedUser | undefined): cached is CachedUser {
  return Boolean(cached) && Date.now() - cached!.cachedAt < CACHE_TTL;
}

function persist(): void {
  Repository.save(USERS_KEY, CACHE);
}

function putOnCache(id: string, user: UserType): void {
  // `getAny` devolve {} quando o documento não existe: não vale cachear, senão
  // um usuário recém-criado ficaria "inexistente" por 24h.
  if (!user || !user.uid) {
    return;
  }

  CACHE[id] = { user, cachedAt: Date.now() };
  persist();
}

export async function newUser(user: User): Promise<string> {
  // Não gravamos o email no Firestore: ele não é necessário para o jogo
  // (usamos displayName/photoURL) e é justamente o dado sensível que não deve
  // ficar exposto na coleção `users`. O `deleteField` remove o campo dos
  // documentos legados que ainda o tenham.
  //
  // `merge: true` é essencial: sem ele o setDoc substitui o documento inteiro e
  // apaga `wins` a cada login — o contador de vitórias nunca sobrevivia a uma
  // sessão. É também o que permite à regra do Firestore restringir o dono aos
  // campos de perfil.
  const { uid, displayName, photoURL } = user;

  await setDoc(
    doc(usersCollection, uid),
    {
      uid,
      displayName,
      photoURL,
      email: deleteField(),
    },
    { merge: true }
  );

  // Preserva o que já estava em cache (como `wins`) em vez de sobrescrever o
  // usuário com um objeto só de perfil.
  putOnCache(uid, {
    ...(CACHE[uid]?.user || {}),
    uid,
    displayName,
    photoURL,
  });

  return uid;
}

/**
 * Leitura de perfil com cache. Use em qualquer lugar que só precise
 * exibir o usuário (nome, foto).
 */
export async function getUser(id: string): Promise<UserType> {
  const cached = CACHE[id];

  if (isFresh(cached)) {
    return cached.user;
  }

  const pending = PENDING.get(id);

  if (pending) {
    return pending;
  }

  const promise = getAny<UserType>(usersCollection, id)
    .then((user) => {
      putOnCache(id, user);
      return user;
    })
    .finally(() => {
      PENDING.delete(id);
    });

  PENDING.set(id, promise);

  return promise;
}

export function clearUsersCache(): void {
  CACHE = {};
  PENDING.clear();
  persist();
}

export async function isAdmin(id: string): Promise<boolean> {
  try {
    const admin = await getAny(adminsCollection, id);
    return Object.keys(admin).length > 0;
  } catch {
    return false;
  }
}
