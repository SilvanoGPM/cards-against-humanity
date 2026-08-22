/* eslint-disable */

/**
 * Testes das regras do Firestore.
 *
 * Roda dentro do emulador:
 *   npm run test:rules
 *
 * Ainda não usa um test runner — o projeto não tem um (ver
 * docs/internal/04-estrategia-de-testes.md). São asserções diretas, com saída
 * legível; quando o Vitest entrar, isto vira um `.test.ts` quase sem mudanças.
 */

const fs = require('fs');
const path = require('path');

const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');

const {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
  increment,
} = require('firebase/firestore');

const ALICE = 'alice';
const BOB = 'bob';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ok   ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`  FAIL ${name}`);
    console.log(`       ${error.message.split('\n')[0]}`);
    failed += 1;
  }
}

async function main() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-cah',
    firestore: {
      rules: fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  });

  const alice = testEnv.authenticatedContext(ALICE).firestore();
  const bob = testEnv.authenticatedContext(BOB).firestore();
  const anon = testEnv.unauthenticatedContext().firestore();

  async function seed() {
    await testEnv.clearFirestore();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      await setDoc(doc(db, 'users', ALICE), {
        uid: ALICE,
        displayName: 'Alice',
        photoURL: null,
        wins: 3,
        // resquício de documentos legados, que o login deve limpar
        email: 'alice@example.com',
      });

      await setDoc(doc(db, 'users', BOB), {
        uid: BOB,
        displayName: 'Bob',
        photoURL: null,
      });

      await setDoc(doc(db, 'cards', 'c1'), { type: 'WHITE', message: 'carta' });
      await setDoc(doc(db, 'general', 'g1'), { canPlay: true, totalCards: 1 });

      await setDoc(doc(db, 'matches', 'm1'), {
        owner: doc(db, 'users', ALICE),
        status: 'PLAYING',
        points: [{ userId: ALICE, value: 0 }],
      });
    });
  }

  // --- users -----------------------------------------------------------------
  console.log('\nusers');
  await seed();

  await test('dono atualiza o próprio perfil', () =>
    assertSucceeds(
      setDoc(
        doc(alice, 'users', ALICE),
        { uid: ALICE, displayName: 'Alice II', photoURL: 'x', email: deleteField() },
        { merge: true }
      )
    ));

  await seed();
  await test('login preserva wins (merge) e apaga o email legado', async () => {
    await setDoc(
      doc(alice, 'users', ALICE),
      { uid: ALICE, displayName: 'Alice', photoURL: null, email: deleteField() },
      { merge: true }
    );

    let saved;
    await testEnv.withSecurityRulesDisabled(async (context) => {
      saved = (await getDoc(doc(context.firestore(), 'users', ALICE))).data();
    });

    if (saved.wins !== 3) throw new Error(`wins virou ${saved.wins}, esperado 3`);
    if ('email' in saved) throw new Error('email legado não foi removido');
  });

  await seed();
  await test('primeiro login cria o próprio documento', () => {
    const carol = testEnv.authenticatedContext('carol').firestore();

    return assertSucceeds(
      setDoc(
        doc(carol, 'users', 'carol'),
        { uid: 'carol', displayName: 'Carol', photoURL: null, email: deleteField() },
        { merge: true }
      )
    );
  });

  await seed();
  await test('NÃO cria documento em nome de outro', () => {
    const carol = testEnv.authenticatedContext('carol').firestore();

    return assertFails(
      setDoc(doc(carol, 'users', 'mallory'), { uid: 'mallory', displayName: 'x', photoURL: null })
    );
  });

  await seed();
  await test('NÃO cria a própria conta já com wins', () => {
    const carol = testEnv.authenticatedContext('carol').firestore();

    return assertFails(
      setDoc(doc(carol, 'users', 'carol'), {
        uid: 'carol',
        displayName: 'Carol',
        photoURL: null,
        wins: 500,
      })
    );
  });

  await seed();
  await test('dono NÃO grava wins arbitrário em si mesmo', () =>
    assertFails(updateDoc(doc(alice, 'users', ALICE), { wins: 9999 })));

  await seed();
  await test('dono NÃO grava email', () =>
    assertFails(updateDoc(doc(alice, 'users', ALICE), { email: 'a@b.c' })));

  await seed();
  await test('terceiro incrementa wins de +1 (FieldValue.increment)', () =>
    assertSucceeds(updateDoc(doc(bob, 'users', ALICE), { wins: increment(1) })));

  await seed();
  await test('terceiro incrementa wins de +1 (valor literal)', () =>
    assertSucceeds(updateDoc(doc(bob, 'users', ALICE), { wins: 4 })));

  await seed();
  await test('terceiro NÃO grava wins arbitrário', () =>
    assertFails(updateDoc(doc(bob, 'users', ALICE), { wins: 9999 })));

  await seed();
  await test('terceiro NÃO incrementa mais de 1 por vez', () =>
    assertFails(updateDoc(doc(bob, 'users', ALICE), { wins: increment(5) })));

  await seed();
  await test('terceiro NÃO altera o perfil alheio', () =>
    assertFails(updateDoc(doc(bob, 'users', ALICE), { displayName: 'hackeado' })));

  await seed();
  await test('primeiro wins de quem não tem o campo', () =>
    assertSucceeds(updateDoc(doc(alice, 'users', BOB), { wins: increment(1) })));

  await seed();
  await test('anônimo não lê usuários', () =>
    assertFails(getDoc(doc(anon, 'users', ALICE))));

  // --- cards / general -------------------------------------------------------
  console.log('\ncards e general');
  await seed();

  await test('qualquer um lê cartas (a tela /cards é pública)', () =>
    assertSucceeds(getDoc(doc(anon, 'cards', 'c1'))));

  await test('não-admin NÃO cria carta', () =>
    assertFails(setDoc(doc(bob, 'cards', 'nova'), { type: 'WHITE', message: 'x' })));

  await test('não-admin NÃO desliga o jogo (general.canPlay)', () =>
    assertFails(updateDoc(doc(bob, 'general', 'g1'), { canPlay: false })));

  // --- recovery ---------------------------------------------------------------
  // Coleção encerrada: o formulário de recuperação saiu do ar. Nenhuma escrita
  // deve passar, autenticada ou não.
  console.log('\nrecovery');
  await seed();

  await test('recovery NÃO aceita mais envio anônimo', () =>
    assertFails(
      setDoc(doc(anon, 'recovery', 'r1'), {
        cards: [{ id: '1', type: 'WHITE', message: 'x' }],
        sentAt: 'agora',
        userAgent: 'teste',
        userId: null,
      })
    ));

  await test('recovery NÃO aceita envio autenticado', () =>
    assertFails(
      setDoc(doc(bob, 'recovery', 'r2'), {
        cards: [{ id: '1', type: 'WHITE', message: 'x' }],
        sentAt: 'agora',
        userAgent: 'teste',
        userId: BOB,
      })
    ));

  await test('ninguém lê recovery', () =>
    assertFails(getDoc(doc(bob, 'recovery', 'r1'))));

  // --- matches ---------------------------------------------------------------
  console.log('\nmatches');
  await seed();

  await test('anônimo não lê partidas', () =>
    assertFails(getDoc(doc(anon, 'matches', 'm1'))));

  await test('autenticado cria partida como dono', () =>
    assertSucceeds(
      setDoc(doc(bob, 'matches', 'm2'), {
        owner: doc(bob, 'users', BOB),
        status: 'PLAYING',
        points: [],
      })
    ));

  await test('NÃO cria partida em nome de outro', () =>
    assertFails(
      setDoc(doc(bob, 'matches', 'm3'), {
        owner: doc(bob, 'users', ALICE),
        status: 'PLAYING',
        points: [],
      })
    ));

  await testEnv.cleanup();

  console.log(`\n${passed} passaram, ${failed} falharam\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('erro ao rodar os testes:', error);
  process.exit(1);
});
