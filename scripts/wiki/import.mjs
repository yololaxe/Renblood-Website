import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { compileWiki } from './compile.mjs';
const args = Object.fromEntries(process.argv.slice(2).reduce((pairs, value, index, all) => value.startsWith('--') ? [...pairs, [value.slice(2), all[index + 1]]] : pairs, []));
for (const key of ['source', 'baseline', 'decisions', 'output', 'review']) if (!args[key]) throw new Error(`Argument requis : --${key}`);
const json = async path => JSON.parse(await readFile(resolve(path), 'utf8'));
const {
  registry,
  books,
  review
} = compileWiki(await json(args.source), await json(args.baseline), await json(args.decisions));
const fingerprint = createHash('sha256').update(JSON.stringify({
  registry,
  books
})).digest('hex').slice(0, 12);
registry.version += `-${fingerprint}`;
async function atomic(path, value) {
  await mkdir(dirname(path), {
    recursive: true
  });
  const temporary = path + '.pending';
  await writeFile(temporary, JSON.stringify(value) + '\n');
  await rename(temporary, path);
}
const output = resolve(args.output),
  report = resolve(args.review);
if (report.startsWith(output)) throw new Error('Le rapport privé doit être situé hors de la publication publique');
await atomic(report, {
  version: registry.version,
  review
});
await atomic(resolve(output, 'books.json'), books);
await atomic(resolve(output, 'registry.json'), registry);
console.log(`Wiki public préparé : ${registry.people.length} personnages, ${registry.relations.length} liens, ${registry.families.length} familles, ${books.length} livres. Version ${registry.version}`);
