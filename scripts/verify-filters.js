#!/usr/bin/env node
const fs = require('fs');
const files = [
  'category-tvs.json','soundbars.json','headphones.json','home-cinema-systems.json',
  'cables-accessories.json','remote-controls.json','tv-aerials.json','radios.json',
  'blu-ray-dvd-players.json','tv-wall-brackets.json',
  'dvd-blu-ray.json','tv-accessories.json','digital-smart-tv.json','speakers-hifi.json'
];
let tg = 0, to = 0, eg = 0;
files.forEach(function(f) {
  const d = JSON.parse(fs.readFileSync('data/scrape/' + f, 'utf8'));
  const flt = (d.filters || []).filter(function(g) { return g.type !== 'toggle'; });
  const opts = flt.reduce(function(s, g) { return s + g.options.length; }, 0);
  const empty = flt.filter(function(g) { return g.options.length === 0; });
  tg += flt.length;
  to += opts;
  eg += empty.length;
  const st = empty.length > 0 ? ' EMPTY=' + empty.map(function(g) { return g.name; }).join(',') : ' OK';
  console.log(f.padEnd(30) + ' groups=' + flt.length + ' opts=' + opts + ' prods=' + (d.products || []).length + st);
});
console.log('\nTOTAL: ' + tg + ' groups, ' + to + ' options, ' + eg + ' empty');
