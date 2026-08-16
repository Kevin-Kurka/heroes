import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load classification data
const classified = JSON.parse(fs.readFileSync(path.join(__dirname, 'classified-photos.json'), 'utf8'));

// Add the missing photo
classified.classified.push({
  filename: '927DD24E-52AC-44B1-8CCC-B808C02804F7.jpg',
  path: path.join(__dirname, 'public/promos-video/_source/new/927DD24E-52AC-44B1-8CCC-B808C02804F7.jpg'),
  slug: 'carlsbad-sandwich',
  quality: 4,
  note: 'BLT-style sandwich with bacon, lettuce, cheese',
  itemInfo: classified.menuItems['carlsbad-sandwich']
});

const menuDir = path.join(__dirname, 'public/promos-video/menu');

// Create menu directory structure
if (!fs.existsSync(menuDir)) {
  fs.mkdirSync(menuDir, { recursive: true });
}

// Group by slug
const bySlug = {};
classified.classified.forEach(item => {
  if (!bySlug[item.slug]) {
    bySlug[item.slug] = [];
  }
  bySlug[item.slug].push(item);
});

// Create folders and organize photos
const manifest = [];
let processed = 0;
let skipped = 0;

console.log('Creating menu item folders and organizing photos...\n');

for (const [slug, items] of Object.entries(bySlug)) {
  // Sort by quality descending
  items.sort((a, b) => b.quality - a.quality);
  
  const itemDir = path.join(menuDir, slug);
  if (!fs.existsSync(itemDir)) {
    fs.mkdirSync(itemDir, { recursive: true });
  }
  
  let index = 1;
  items.forEach((item, idx) => {
    const ext = path.extname(item.path).toLowerCase();
    const newFilename = `${slug}-${String(index).padStart(2, '0')}${ext}`;
    const newPath = path.join(itemDir, newFilename);
    
    // Copy file
    if (fs.existsSync(item.path)) {
      fs.copyFileSync(item.path, newPath);
      processed++;
      
      // Store for manifest
      manifest.push({
        original: item.filename,
        slug,
        category: item.itemInfo.category,
        display: item.itemInfo.display,
        quality: item.quality,
        filename: newFilename,
        note: item.note
      });
      
      console.log(`  [${index}] ${slug}: ${item.filename} (q${item.quality})`);
    } else {
      console.log(`  [!] MISSING: ${item.filename}`);
      skipped++;
    }
    
    index++;
  });
}

console.log(`\nProcessed: ${processed} photos\n`);

// Now enhance all photos with sharp
console.log('Enhancing photos with sharp...\n');
let enhanced = 0;
let enhanceFailed = 0;

for (const [slug, items] of Object.entries(bySlug)) {
  const itemDir = path.join(menuDir, slug);
  items.sort((a, b) => b.quality - a.quality);
  
  let index = 1;
  for (const item of items) {
    const ext = path.extname(item.path).toLowerCase();
    const filename = `${slug}-${String(index).padStart(2, '0')}${ext}`;
    const filePath = path.join(itemDir, filename);
    const proPath = path.join(itemDir, `${slug}-${String(index).padStart(2, '0')}-pro.jpg`);
    
    if (fs.existsSync(filePath)) {
      try {
        // Apply enhancements: rotate to honor EXIF, saturate, brighten, linear contrast, CLAHE, sharpen, JPEG output
        await sharp(filePath)
          .rotate() // Auto-rotate based on EXIF
          .modulate({
            saturation: 1.22,  // +22% saturation
            brightness: 1.04   // +4% brightness
          })
          .linear(1.1, -10)   // Contrast boost
          .clahe({
            width: 160,
            height: 160,
            maxSlope: 2
          })
          .sharpen({
            sigma: 1.2,
            m1: 1,
            m2: 2
          })
          .jpeg({
            quality: 92,
            mozjpeg: true
          })
          .toFile(proPath);
        
        enhanced++;
        console.log(`  ✓ ${slug}-${String(index).padStart(2, '0')}-pro.jpg`);
      } catch (err) {
        console.log(`  ✗ Failed to enhance ${filename}: ${err.message}`);
        enhanceFailed++;
      }
    }
    
    index++;
  }
}

console.log(`\nEnhanced: ${enhanced} photos`);
if (enhanceFailed > 0) console.log(`Failed: ${enhanceFailed}`);

// Build summary report
const summary = {};
const categorySummary = {};

for (const [slug, items] of Object.entries(bySlug)) {
  const itemInfo = classified.menuItems[slug];
  summary[slug] = {
    category: itemInfo.category,
    display: itemInfo.display,
    count: items.length,
    bestQuality: Math.max(...items.map(i => i.quality)),
    photos: items.map(i => i.filename)
  };
  
  if (!categorySummary[itemInfo.category]) {
    categorySummary[itemInfo.category] = [];
  }
  categorySummary[itemInfo.category].push({ slug, ...summary[slug] });
}

// Write comprehensive manifest
const manifestOutput = {
  totalPhotos: processed,
  enhanced: enhanced,
  timestamp: new Date().toISOString(),
  bySlug: summary,
  byCategory: categorySummary,
  detailed: manifest
};

fs.writeFileSync(
  path.join(menuDir, 'manifest.json'),
  JSON.stringify(manifestOutput, null, 2)
);

console.log('\n✓ Manifest saved to public/promos-video/menu/manifest.json');
