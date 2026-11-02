import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('every techSkills iconPath resolves to a file in public/', () => {
  const src = fs.readFileSync('src/data/resumeData.ts', 'utf-8');
  const paths = [...src.matchAll(/iconPath:\s*'([^']+)'/g)].map((m) => m[1]);
  assert.ok(paths.length > 0, 'found iconPath entries');

  const missing = paths.filter((p) => !fs.existsSync(path.join('public', p)));
  assert.deepEqual(missing, [], `missing icon files: ${missing.join(', ')}`);
});
