const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MENU_DIR = path.join(__dirname, '../public/promos-video/menu');

async function processItemFolder(itemDir, itemName) {
  // Skip non-food and unknown
  if (itemName.startsWith('_')) {
    return;
  }

  const files = fs.readdirSync(itemDir)
    .filter(f => !f.endsWith('-pro.jpg') && !f.startsWith('.'))
    .sort();

  if (files.length === 0) return;

  // Pick the largest/best photo
  const fileSizes = files.map(f => ({
    name: f,
    size: fs.statSync(path.join(itemDir, f)).size
  }));
  fileSizes.sort((a, b) => b.size - a.size);
  const bestPhoto = fileSizes[0].name;

  const srcPath = path.join(itemDir, bestPhoto);
  const proPath = path.join(itemDir, `${itemName}-pro.jpg`);

  try {
    // Enhance: higher saturation, brightness, and sharpening
    await sharp(srcPath)
      .modulate({ saturation: 1.22, brightness: 1.04 })
      .linear(1.1, -10)
      .sharpen({ sigma: 1.2, m1: 1, m2: 2 })
      .jpeg({ quality: 92, mozjpeg: true })
      .toFile(proPath);

    console.log(`Created: ${itemName}-pro.jpg`);
  } catch (err) {
    console.error(`Error processing ${itemName}:`, err.message);
  }
}

async function main() {
  const items = fs.readdirSync(MENU_DIR)
    .filter(f => fs.statSync(path.join(MENU_DIR, f)).isDirectory());

  for (const item of items) {
    await processItemFolder(path.join(MENU_DIR, item), item);
  }

  console.log(`\nProcessed ${items.filter(i => !i.startsWith('_')).length} menu items`);
}

main().catch(console.error);
