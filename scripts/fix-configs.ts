import * as fs from 'node:fs';
import * as path from 'node:path';

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') {
        results = results.concat(walk(fullPath));
      }
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const allFiles = walk(path.resolve(process.cwd(), 'packages'));

for (const f of allFiles) {
  const rel = path.relative(process.cwd(), f);
  const parts = rel.split(path.sep);
  // If it's packages/<category>/<name>/tsconfig.json (depth 4: packages, category, name, file)
  if (parts.length === 4 && parts[3] === 'tsconfig.json') {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes('"extends": "../../tools/tsconfig/base.json"')) {
      const updated = content.replace('"extends": "../../tools/tsconfig/base.json"', '"extends": "../../../tools/tsconfig/base.json"');
      fs.writeFileSync(f, updated, 'utf8');
      console.log(`Updated ${f}`);
    }
  }
  if (parts.length === 4 && parts[3] === 'vitest.config.ts') {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes("from '../../tools/vitest/vitest.base'")) {
      const updated = content.replace("from '../../tools/vitest/vitest.base'", "from '../../../tools/vitest/vitest.base'");
      fs.writeFileSync(f, updated, 'utf8');
      console.log(`Updated ${f}`);
    }
  }
}
