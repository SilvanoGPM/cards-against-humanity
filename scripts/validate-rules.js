/* eslint-disable */

/**
 * Valida a sintaxe de `firestore.rules` contra o emulador do Firestore.
 *
 * Precisa rodar DENTRO do emulador:
 *   npx firebase-tools emulators:exec --only firestore --project demo-cah "node scripts/validate-rules.js"
 *
 * Por que existe: subir o emulador NÃO valida as regras. Verificado na prática —
 * `emulators:exec` sobe e sai com código 0 mesmo com um arquivo que nem fecha as
 * chaves. Este script envia as regras pela API de administração do emulador, que
 * as compila de verdade e responde HTTP 400 com a linha e a coluna do erro.
 *
 * Alcance: pega erros de COMPILAÇÃO (sintaxe, chaves, expressões malformadas).
 * NÃO pega erros de lógica nem chamada a função não declarada — o compilador
 * aceita `if FuncaoInexistente()` e isso só falha na avaliação. Cobrir esse tipo
 * de erro é papel dos testes de regras com `@firebase/rules-unit-testing`.
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ID = process.env.FIRESTORE_PROJECT_ID || 'demo-cah';
const HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
const RULES_PATH = path.resolve(__dirname, '../firestore.rules');

async function main() {
  const content = fs.readFileSync(RULES_PATH, 'utf8');

  const response = await fetch(
    `http://${HOST}/emulator/v1/projects/${PROJECT_ID}:securityRules`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rules: { files: [{ name: 'firestore.rules', content }] },
      }),
    }
  );

  const body = await response.text();

  if (!response.ok) {
    console.error(`Regras inválidas (HTTP ${response.status}):\n${body}`);
    process.exit(1);
  }

  // O emulador responde 200 mesmo com erros de compilação, listando-os em
  // `issues` com severity ERROR.
  let issues = [];

  try {
    issues = (JSON.parse(body).issues || []).filter(
      (issue) => issue.severity === 'ERROR'
    );
  } catch {
    // resposta vazia = tudo certo
  }

  if (issues.length > 0) {
    console.error('Regras inválidas:');
    issues.forEach((issue) => {
      const where = issue.sourcePosition
        ? ` (linha ${issue.sourcePosition.line}, coluna ${issue.sourcePosition.column})`
        : '';
      console.error(`  - ${issue.description}${where}`);
    });
    process.exit(1);
  }

  const lines = content.split('\n').length;
  console.log(`firestore.rules OK — ${lines} linhas compiladas sem erros.`);
}

main().catch((error) => {
  console.error('falha ao validar as regras:', error.message);
  process.exit(1);
});
