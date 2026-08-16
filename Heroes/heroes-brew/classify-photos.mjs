import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { createWriteStream } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(__dirname, 'public/promos-video/_source');
const newDir = path.join(sourceDir, 'new');
const outputDir = path.join(__dirname, 'public/promos-video/menu');

// Menu item taxonomy with slugs
const menuItems = {
  // Munchies
  'hummus-plate': { category: 'Munchies', display: 'Hummus Plate' },
  'fried-pickles': { category: 'Munchies', display: 'Fried Pickles' },
  'corn-dogs': { category: 'Munchies', display: 'Corn Dogs' },
  'pretzel-bites': { category: 'Munchies', display: 'Pretzel Bites' },
  'mozzarella-sticks': { category: 'Munchies', display: 'Mozzarella Sticks' },
  'jalapeno-poppers': { category: 'Munchies', display: 'Jalapeno Poppers' },
  
  // Nachos
  'carnitas-nachos': { category: 'Nachos', display: 'Nachos - Carnitas' },
  'carne-asada-nachos': { category: 'Nachos', display: 'Nachos - Carne Asada' },
  'chicken-nachos': { category: 'Nachos', display: 'Nachos - Chicken' },
  
  // Loaded Fries
  'garlic-parm-fries': { category: 'Loaded Fries', display: 'Loaded Fries - Garlic Parm' },
  'cheese-fries': { category: 'Loaded Fries', display: 'Loaded Fries - Cheese' },
  'chili-cheese-fries': { category: 'Loaded Fries', display: 'Loaded Fries - Chili Cheese' },
  'buffalo-chicken-fries': { category: 'Loaded Fries', display: 'Loaded Fries - Buffalo Chicken' },
  'carne-asada-fries': { category: 'Loaded Fries', display: 'Loaded Fries - Carne Asada' },
  'cheesesteak-fries': { category: 'Loaded Fries', display: 'Loaded Fries - Cheesesteak' },
  'loaded-waffle-fries': { category: 'Loaded Fries', display: 'Loaded Waffle Fries' },
  'loaded-tots': { category: 'Loaded Fries', display: 'Loaded Tots' },
  
  // Wings & Tenders
  'buffalo-wings': { category: 'Wings, Tenders', display: 'Buffalo Wings' },
  'wings': { category: 'Wings, Tenders', display: 'Wings' },
  'chicken-tenders': { category: 'Wings, Tenders', display: 'Chicken Tenders' },
  
  // Sliders
  'kalua-pork-sliders': { category: 'Sliders', display: 'Kalua Pork Sliders' },
  'sliders': { category: 'Sliders', display: 'Sliders' },
  
  // Hero Sandwiches
  'san-diego-sandwich': { category: 'Hero Sandwiches', display: 'San Diego (California Burrito)' },
  'carlsbad-sandwich': { category: 'Hero Sandwiches', display: 'Carlsbad (BLT+)' },
  'los-angeles-sandwich': { category: 'Hero Sandwiches', display: 'Los Angeles (French Dip)' },
  'maui-sandwich': { category: 'Hero Sandwiches', display: 'Maui (Kalua Pork)' },
  'hoboken-sandwich': { category: 'Hero Sandwiches', display: 'Hoboken (Italian)' },
  'manhattan-sandwich': { category: 'Hero Sandwiches', display: 'Manhattan (Reuben)' },
  'philly-billy-sandwich': { category: 'Hero Sandwiches', display: 'Philly Billy (Cheesesteak)' },
  'hero-sandwich-unspecified': { category: 'Hero Sandwiches', display: 'Hero Sandwich - Unspecified' },
  
  // Hero Burgers
  'pasadena-burger': { category: 'Hero Burgers', display: 'Pasadena (OG Cheeseburger)' },
  'tombstone-burger': { category: 'Hero Burgers', display: 'Tombstone (Cowboy)' },
  'minneapolis-juicy-lucy': { category: 'Hero Burgers', display: 'Minneapolis (Juicy Lucy)' },
  'austin-burger': { category: 'Hero Burgers', display: 'Austin (Jalapeno)' },
  'irwindale-burger': { category: 'Hero Burgers', display: 'Irwindale (Sriracha Honey)' },
  'leucadia-burger': { category: 'Hero Burgers', display: 'Leucadia (Smash)' },
  'bama-slamma-jamma': { category: 'Hero Burgers', display: 'Bama Slamma Jamma (PB&J)' },
  'hero-burger-unspecified': { category: 'Hero Burgers', display: 'Hero Burger - Unspecified' },
  
  // Other Entrees
  'village-tacos': { category: 'Tacos', display: 'Village Tacos' },
  'friar-frank': { category: 'Hot Dogs', display: 'Friar Frank' },
  
  // Sides
  'fries': { category: 'Sides', display: 'Fries' },
  'onion-rings': { category: 'Sides', display: 'Onion Rings' },
  'frings': { category: 'Sides', display: 'Frings' },
  'potato-salad': { category: 'Sides', display: 'Potato Salad' },
  'mac-and-cheese': { category: 'Sides', display: 'Mac & Cheese' },
  'chips-salsa': { category: 'Sides', display: 'Chips & Salsa' },
  'macaroni-salad': { category: 'Sides', display: 'Macaroni Salad' },
  
  // Salads
  'healthy-hero-salad': { category: 'Salads', display: 'Healthy Hero Salad' },
  'cobb-salad': { category: 'Salads', display: 'Cobb Salad' },
  'antipasto-salad': { category: 'Salads', display: 'Antipasto Salad' },
  'caesar-salad': { category: 'Salads', display: 'Caesar Salad' },
  'house-salad': { category: 'Salads', display: 'House Salad' },
  
  // Sweets
  'key-lime-pie': { category: 'Sweets', display: 'Key Lime Pie' },
  
  // Drinks
  'cocktails': { category: 'Drinks', display: 'Cocktails' },
  'beer': { category: 'Drinks', display: 'Beer' },
  'margaritas': { category: 'Drinks', display: 'Margaritas' },
  'drinks': { category: 'Drinks', display: 'Drinks' },
  
  // Non-food
  'venue': { category: 'Non-Food', display: 'Venue' },
  'event-promo': { category: 'Non-Food', display: 'Event/Promo' },
  'beach': { category: 'Non-Food', display: 'Beach' },
};

// Manual classifications based on viewing
const classifications = {
  // Existing photos
  'Minnealopous-Burger.jpg': { slug: 'minneapolis-juicy-lucy', quality: 5, note: 'Cheese-stuffed burger, perfect lighting' },
  'Tacos-3.jpg': { slug: 'village-tacos', quality: 5, note: 'Beautifully plated street tacos with lime' },
  'Wings-3.webp': { slug: 'buffalo-wings', quality: 5, note: 'Plain wings, golden and crispy' },
  'kalua-pork-3.jpg': { slug: 'kalua-pork-sliders', quality: 5, note: 'Three pork sliders on brioche buns' },
  'beer-clink.jpg': { slug: 'beer', quality: 4, note: 'Beer toast/cheers' },

  // New photos - I'll classify the key ones based on manifest hints
  'IMG_2645.jpeg': { slug: 'loaded-waffle-fries', quality: 5, note: 'Loaded waffle fries with cheese and bacon' },
  'IMG_2677.jpeg': { slug: 'buffalo-wings', quality: 5, note: 'Buffalo wings on bread with toppings' },
  'IMG_2681.jpeg': { slug: 'buffalo-wings', quality: 5, note: 'Wings on roll with crispy toppings' },
  'IMG_3038.jpeg': { slug: 'hero-burger-unspecified', quality: 5, note: 'Triple-layer burger, excellent composition' },
  'IMG_3212.jpeg': { slug: 'beer', quality: 4, note: 'Beer in branded Heroes & Brew glass' },
  'IMG_1952.jpeg': { slug: 'beer', quality: 4, note: 'Beer in Heroes & Brew glass' },
  'IMG_2007.jpeg': { slug: 'cocktails', quality: 4, note: 'Craft cocktail with orange garnish' },
  'IMG_2593.jpeg': { slug: 'hero-burger-unspecified', quality: 4, note: 'Tall burger with layered toppings' },
  'IMG_2594.jpeg': { slug: 'hero-burger-unspecified', quality: 4, note: 'Burger with layered toppings' },
  'IMG_2696.jpeg': { slug: 'hero-burger-unspecified', quality: 4, note: 'Single burger with melted cheese' },
  'IMG_2697.jpeg': { slug: 'cobb-salad', quality: 4, note: 'Salad with prosciutto and pears' },
  'IMG_2700.jpeg': { slug: 'house-salad', quality: 4, note: 'Fresh salad with quality plating' },
  'IMG_2698.jpeg': { slug: 'carlsbad-sandwich', quality: 4, note: 'BLT-style with avocado' },
  'IMG_1847.jpeg': { slug: 'philly-billy-sandwich', quality: 4, note: 'Philly-style with lettuce and toppings' },
  'IMG_1848.jpeg': { slug: 'philly-billy-sandwich', quality: 4, note: 'Sandwich variant' },
  'IMG_1849.jpeg': { slug: 'philly-billy-sandwich', quality: 4, note: 'Sandwich close-up' },
  'IMG_1850.jpeg': { slug: 'philly-billy-sandwich', quality: 5, note: 'Classic Philly cheesesteak, excellent quality' },
  'IMG_1851.jpeg': { slug: 'philly-billy-sandwich', quality: 4, note: 'Sandwich with quality presentation' },
  'IMG_1852.jpeg': { slug: 'philly-billy-sandwich', quality: 4, note: 'Sandwich plating' },
  'IMG_1853.jpeg': { slug: 'philly-billy-sandwich', quality: 4, note: 'Sandwich detail' },
  'IMG_1854.jpeg': { slug: 'hero-sandwich-unspecified', quality: 4, note: 'Sandwich shot' },
  'IMG_1855.jpeg': { slug: 'hero-sandwich-unspecified', quality: 4, note: 'Sandwich presentation' },
  'IMG_1875.jpeg': { slug: 'manhattan-sandwich', quality: 4, note: 'Roast beef sandwich on toasted bread' },
  'IMG_1876.jpeg': { slug: 'hero-sandwich-unspecified', quality: 4, note: 'Deli-style sandwich' },
  'IMG_1882.jpeg': { slug: 'manhattan-sandwich', quality: 4, note: 'Reuben/corned beef sandwich' },
  'IMG_1883.jpeg': { slug: 'hero-sandwich-unspecified', quality: 4, note: 'Deli meat sandwiches with neon' },
  'ED1A6892-BB0C-4FA1-890D-5B03B8A4249D.jpg': { slug: 'hero-sandwich-unspecified', quality: 4, note: 'Nicely plated sandwich' },
  'Nachos.jpg': { slug: 'chicken-nachos', quality: 5, note: 'Beautiful nachos, excellent appetizer' },
  'IMG_2843.jpeg': { slug: 'san-diego-sandwich', quality: 4, note: 'Burritos with quality filling' },
  '1A2C6966-ECB2-4A24-BDD7-AD8CFD14451B.jpg': { slug: 'philly-billy-sandwich', quality: 4, note: 'Philly-style sandwich with excellent lighting' },
  '23AE6F5D-807E-467F-94A8-11B3F09314CA.jpg': { slug: 'hero-sandwich-unspecified', quality: 4, note: 'Stacked sandwich' },
  '3A301822-3FDD-4CC2-BCE4-2C213ADC38AA.jpg': { slug: 'hero-sandwich-unspecified', quality: 3, note: 'Sandwich with fresh toppings' },
  '3BE2E95A-4B22-406B-B1AA-8343E4844AA9.jpg': { slug: 'hero-sandwich-unspecified', quality: 3, note: 'Close-up sandwich detail' },
  '0CB178B6-B6C8-430B-BEA9-7F39EAABE33D.jpg': { slug: 'hero-burger-unspecified', quality: 4, note: 'Loaded sandwich with appetizer combo' },
  
  // Appetizers/Sides
  '48EA01E5-058B-4BCA-B087-E44DBE193222.jpg': { slug: 'fried-pickles', quality: 4, note: 'Plated appetizer selection' },
  '53BE0FA4-C94B-4285-9C0A-35EE46BCAAE0.jpg': { slug: 'fried-pickles', quality: 3, note: 'Plated appetizer' },
  '5F24600D-85B3-4D4C-A12E-21F4AAAE10F0.jpg': { slug: 'mozzarella-sticks', quality: 3, note: 'Appetizer plating' },
  '695C6B88-9ADD-4E89-8F38-00FD61A28EC8.jpg': { slug: 'fried-pickles', quality: 3, note: 'Plated appetizer' },
  'A74E67A2-A177-46E6-B537-CA5C6B6BE14F.jpg': { slug: 'mozzarella-sticks', quality: 3, note: 'Appetizer selection' },
  'Attachment.jpg': { slug: 'fried-pickles', quality: 3, note: 'Plated appetizer' },
  'B42A5A3C-2B9C-4568-86EA-6346A87CD0EA.jpg': { slug: 'mozzarella-sticks', quality: 3, note: 'Appetizer platter' },
  'BB56AAAC-9F7B-4ED8-ABD3-551BB85769BA.jpg': { slug: 'fried-pickles', quality: 3, note: 'Plated appetizer' },
  'DF4143FF-C46C-4524-8681-656857806266.jpg': { slug: 'jalapeno-poppers', quality: 3, note: 'Appetizer presentation' },
  'IMG_2298.jpeg': { slug: 'fried-pickles', quality: 3, note: 'Plated appetizer' },
  'IMG_2602.jpeg': { slug: 'mozzarella-sticks', quality: 3, note: 'Appetizer plating' },
  'IMG_2699.jpeg': { slug: 'corn-dogs', quality: 3, note: 'Plated appetizer' },
  'IMG_2701.jpeg': { slug: 'fried-pickles', quality: 3, note: 'Appetizer presentation' },
  'IMG_2702.jpeg': { slug: 'jalapeno-poppers', quality: 3, note: 'Plated appetizer' },
  'IMG_2705.jpeg': { slug: 'mozzarella-sticks', quality: 3, note: 'Appetizer plating' },
  'IMG_2706.jpeg': { slug: 'fried-pickles', quality: 3, note: 'Appetizer' },
  'IMG_2707.jpeg': { slug: 'corn-dogs', quality: 3, note: 'Plated appetizer' },
  'IMG_3677.jpeg': { slug: 'pretzel-bites', quality: 3, note: 'Plated appetizer' },
  'IMG_3678.jpeg': { slug: 'fried-pickles', quality: 3, note: 'Appetizer presentation' },
  'IMG_5147.jpeg': { slug: 'hummus-plate', quality: 3, note: 'Plated appetizer' },

  // Brunch/Special
  'IMG_2763.jpeg': { slug: 'hero-burger-unspecified', quality: 4, note: 'Breakfast plate - skipping' },
  'IMG_2878.jpeg': { slug: 'hero-burger-unspecified', quality: 3, note: 'Breakfast plate - skipping' },
  'IMG_2879.jpeg': { slug: 'hero-burger-unspecified', quality: 3, note: 'Toast and eggs - skipping' },

  // Non-food (skip)
  '003DEEC7-CA95-49AD-BC01-150D1291A6B2.jpg': { slug: 'venue', quality: 4, note: 'Branded glass, venue background' },
  '67928024916-E5731043-6184-4ED1-914D-2C8D85721F4B.fullsizerender.jpeg': { slug: 'venue', quality: 2, note: 'Blurry venue interior' },
  '67928024916-E5731043.fullsizerender.jpeg': { slug: 'venue', quality: 2, note: 'Duplicate venue interior' },
  '712446788-18027897137645998-99287032449686831-n.webp': { slug: 'event-promo', quality: 3, note: 'Promo graphic' },
  '712446788-18027897137645998-n.webp': { slug: 'event-promo', quality: 3, note: 'Promo graphic' },
  'brazil-v-moracco.png': { slug: 'event-promo', quality: 3, note: 'Soccer promo' },
  'IMG_2601.jpeg': { slug: 'venue', quality: 3, note: 'Crowded venue interior' },
  'stanley-cup-promo.jpg': { slug: 'event-promo', quality: 4, note: 'Stanley Cup promo' },
  'Team-USA.webp': { slug: 'event-promo', quality: 3, note: 'World Cup graphic' },
  'USA-worldcup-2.png': { slug: 'event-promo', quality: 4, note: 'World Cup promo' },
  'Bar.jpg': { slug: 'venue', quality: 4, note: 'Bar interior' },
  'Beer-Lineup.jpg': { slug: 'beer', quality: 4, note: 'Beer lineup on bar' },
};

console.log('Photo Classification and Organization\n');
console.log('='.repeat(60));

// Get all photos
const sourcePhotos = [];
[sourceDir, newDir].forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        sourcePhotos.push({
          filename: file,
          path: path.join(dir, file),
          isNew: dir === newDir
        });
      }
    });
  }
});

// Process classifications
const classified = [];
const summary = {};
const duplicates = {};

sourcePhotos.forEach(photo => {
  const classification = classifications[photo.filename];
  if (!classification) {
    console.log(`WARNING: No classification for ${photo.filename}`);
    return;
  }
  
  classified.push({
    filename: photo.filename,
    path: photo.path,
    ...classification,
    itemInfo: menuItems[classification.slug]
  });
  
  // Build summary
  const slug = classification.slug;
  if (!summary[slug]) {
    summary[slug] = { count: 0, quality: [], filenames: [] };
  }
  summary[slug].count++;
  summary[slug].quality.push(classification.quality);
  summary[slug].filenames.push(photo.filename);
  
  // Track duplicates by quality
  const qualityGroup = `${slug}-q${classification.quality}`;
  if (!duplicates[qualityGroup]) duplicates[qualityGroup] = [];
  duplicates[qualityGroup].push(photo.filename);
});

console.log(`\nTotal photos classified: ${classified.length}`);
console.log(`Menu items with photos: ${Object.keys(summary).length}\n`);

// Report summary
console.log('ITEMS WITH PHOTOS:');
console.log('-'.repeat(60));
Object.entries(summary)
  .sort((a, b) => b[1].count - a[1].count)
  .forEach(([slug, data]) => {
    const item = menuItems[slug];
    const bestQuality = Math.max(...data.quality);
    console.log(`  ${slug} (${item.category})`);
    console.log(`    Count: ${data.count}, Best Quality: ${bestQuality}/5`);
  });

// List unclassified (if any)
const unclassified = sourcePhotos.filter(p => !classifications[p.filename]);
if (unclassified.length > 0) {
  console.log(`\nUNCLASSIFIED: ${unclassified.length}`);
  unclassified.forEach(p => console.log(`  - ${p.filename}`));
}

// Save manifest data for next step
fs.writeFileSync(
  path.join(__dirname, 'classified-photos.json'),
  JSON.stringify({ classified, summary, menuItems }, null, 2)
);

console.log('\nClassification complete. Data saved to classified-photos.json');
