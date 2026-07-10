import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectBestPerSlug } from './curate.mjs';

const rows = [
  { filename: 'a.jpg', slug: 'beer', quality: 3, path: '/x/a.jpg' },
  { filename: 'b.jpg', slug: 'beer', quality: 5, path: '/x/b.jpg' },   // best beer
  { filename: 'c.jpg', slug: 'beer', quality: 5, path: '/x/c.jpg' },   // tie -> stable by path
  { filename: 'd.jpg', slug: 'tacos', quality: 4, path: '/x/d.jpg' },
  { filename: 'e.jpg', slug: 'tacos', quality: null, path: '/x/e.jpg' }, // missing quality -> lowest
];

test('keeps exactly one entry per slug (dedup/merge)', () => {
  assert.deepEqual(selectBestPerSlug(rows).map(r => r.slug).sort(), ['beer', 'tacos']);
});
test('picks the highest quality per slug, ties broken by path asc', () => {
  const beer = selectBestPerSlug(rows).find(r => r.slug === 'beer');
  assert.equal(beer.quality, 5);
  assert.equal(beer.filename, 'b.jpg');
});
test('treats missing quality as lowest', () => {
  const tacos = selectBestPerSlug(rows).find(r => r.slug === 'tacos');
  assert.equal(tacos.filename, 'd.jpg');
});
