// Minimal build script: read the wasm file -> emit a Uint8Array literal -> export `binary` and `version`.
// No esbuild loader / regex post-processing required.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const moonModPath = path.resolve(__dirname, './moon.mod.json');
  const moonMod = JSON.parse(fs.readFileSync(moonModPath, 'utf8'));
  moonMod.deps = undefined;
  fs.writeFileSync(moonModPath, JSON.stringify(moonMod, null, 2));
  execSync('moon update', { stdio: 'inherit' });
  execSync('moon add moonbitlang/parser', { stdio: 'inherit' });
  execSync('moon install', { stdio: 'inherit' });
  execSync('moon build --target wasm-gc', { stdio: 'inherit' });
} catch (e) {
  console.error('[build.js] moon build failed:', e.message);
  process.exit(1);
}

const wasmFile = path.resolve(__dirname, './target/wasm-gc/release/build/tool.wasm');
const versionFile = path.resolve(__dirname, '.mooncakes/moonbitlang/parser/moon.mod.json');
const wasmJsFile = path.resolve(__dirname, '../website/src/parsers/moonbit/astserde.wasm.js')

if (!fs.existsSync(wasmFile)) {
  console.error('[build.js] wasm file not found:', wasmFile);
  process.exit(1);
}
let version = 'unknown';
try {
  version = JSON.parse(fs.readFileSync(versionFile, 'utf8')).version || 'unknown';
} catch (e) {
  console.warn('[build.js] failed to read version, using "unknown":', e.message);
}

const bytes = fs.readFileSync(wasmFile);
// Produce a literal like: [12,34,56] (avoid runtime base64 decode cost)
const arrayLiteral = bytes.length ? Array.from(bytes).join(',') : '';

const banner = `// astserde.js version: ${version}\n`;
const output = `${banner}const binary = new Uint8Array([${arrayLiteral}]);\n const version = '${version}';\nexport default { binary: binary, version: version };\n`;

fs.writeFileSync(wasmJsFile, output);
console.log(`[build.js] wrote ${wasmJsFile} (bytes=${bytes.length}, version=${version})`);

