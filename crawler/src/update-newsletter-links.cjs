const fs = require('fs');
const path = require('path');

const MAPPING = path.join(__dirname, '../../site/src/assets/newsletters/mapping.json');
const MD_FILE = path.join(__dirname, '../../site/src/pages/newsletter-archive.md');

const mapping = JSON.parse(fs.readFileSync(MAPPING, 'utf8'));
let md = fs.readFileSync(MD_FILE, 'utf8');

let updated = 0;
for (const { oldHref, oldImg, newHref, newImg } of mapping) {
  if (md.includes(oldHref)) {
    md = md.split(oldHref).join(newHref);
    updated++;
  }
  if (md.includes(oldImg)) {
    md = md.split(oldImg).join(newImg);
  }
}

fs.writeFileSync(MD_FILE, md);
console.log(`Updated ${updated} newsletter links in newsletter-archive.md`);
