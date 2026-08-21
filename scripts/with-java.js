/* eslint-disable */

/**
 * Executa um comando com `JAVA_HOME` apontando para um JDK 21+.
 *
 * O emulador do Firestore exige Java 21 ou superior ("firebase-tools no longer
 * supports Java version before 21"), e é comum a máquina ter um Java antigo na
 * frente do PATH — nesta aqui, por exemplo, o `java` resolve para um JDK 8
 * mesmo havendo JDK 21 e 24 instalados. Em vez de hardcodar um caminho (que
 * quebraria em outra máquina e no CI), este wrapper procura um JDK compatível.
 *
 * Uso:  node scripts/with-java.js <comando> [args...]
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MIN_VERSION = 21;

function javaMajorVersion(javaHome) {
  const binary = path.join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');

  if (!fs.existsSync(binary)) {
    return 0;
  }

  // `java -version` escreve na saída de ERRO, não na padrão — por isso
  // spawnSync (que devolve as duas) em vez de execFileSync.
  const result = spawnSync(binary, ['-version'], { encoding: 'utf8' });

  return parseMajor(`${result.stdout || ''}${result.stderr || ''}`);
}

function parseMajor(output) {
  const match = /version "(\d+)(?:\.(\d+))?/.exec(output || '');

  if (!match) {
    return 0;
  }

  const major = Number(match[1]);

  // "1.8.0_472" = Java 8; a partir do 9 o primeiro número já é a major.
  return major === 1 ? Number(match[2] || 0) : major;
}

function candidates() {
  const roots =
    process.platform === 'win32'
      ? [
          'C:\\Program Files\\Java',
          'C:\\Program Files\\Eclipse Adoptium',
          'C:\\Program Files\\Microsoft',
          'C:\\Program Files\\Amazon Corretto',
          'C:\\Program Files\\Zulu',
        ]
      : ['/usr/lib/jvm', '/Library/Java/JavaVirtualMachines'];

  const found = [];

  roots.forEach((root) => {
    if (!fs.existsSync(root)) {
      return;
    }

    fs.readdirSync(root).forEach((entry) => {
      const dir = path.join(root, entry);
      // No macOS o JDK fica em .../Contents/Home
      const home = fs.existsSync(path.join(dir, 'Contents', 'Home'))
        ? path.join(dir, 'Contents', 'Home')
        : dir;

      found.push(home);
    });
  });

  if (process.platform === 'win32') {
    found.push('C:\\Program Files\\Android\\Android Studio\\jbr');
  }

  return found;
}

function resolveJavaHome() {
  if (process.env.JAVA_HOME && javaMajorVersion(process.env.JAVA_HOME) >= MIN_VERSION) {
    return process.env.JAVA_HOME;
  }

  const compatible = candidates()
    .map((home) => ({ home, version: javaMajorVersion(home) }))
    .filter(({ version }) => version >= MIN_VERSION)
    .sort((a, b) => b.version - a.version);

  if (compatible.length === 0) {
    console.error(
      `Nenhum JDK ${MIN_VERSION}+ encontrado. O emulador do Firestore precisa de um.\n` +
        `Defina JAVA_HOME manualmente ou instale um JDK 21 ou superior.`
    );
    process.exit(1);
  }

  return compatible[0].home;
}

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error('uso: node scripts/with-java.js <comando> [args...]');
  process.exit(1);
}

const javaHome = resolveJavaHome();

// Reconstrói a linha de comando preservando as aspas dos argumentos com
// espaço — sem isso, `emulators:exec "node script.js"` chegaria ao firebase
// como dois argumentos soltos ("Too many arguments").
const commandLine = [command, ...args]
  .map((arg) => (/\s/.test(arg) ? `"${arg}"` : arg))
  .join(' ');

const result = spawnSync(commandLine, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    JAVA_HOME: javaHome,
    PATH: `${path.join(javaHome, 'bin')}${path.delimiter}${process.env.PATH}`,
  },
});

process.exit(result.status === null ? 1 : result.status);
