/**
 * FILE: menu-copy.ts
 * PURPOSE: Guest-facing dish and drink copy for the public /menu.
 *
 * OVERVIEW:
 * Keys are photoKey-normalized names. Presentation applies these lines so
 * guests see appetizing copy instead of a dry checklist. Ingredients stay
 * honest to the kitchen recipe sheet and existing menu — adjectives only.
 *
 * DEPENDENCIES:
 * - menu-specials.ts (Hogzilla, Crunchwraps, Chilaquiles, Calamari, Spicy Chicken, Oreo Churros)
 *
 * EXPORTS:
 * - MENU_DESCRIPTIONS
 * - copyForName
 * - shouldReplaceDescription
 *
 * IMPLEMENTATION STATUS:
 * - ✅ Appetizing rewrite from kitchen sheet + manufacturer bottle blurbs
 *
 * LAST UPDATED: 2026-09-03
 * MAINTAINER: American Heroes & Brew
 */

import {
  CALAMARI,
  CHILAQUILES,
  CRUNCHWRAPS,
  HOGZILLA,
  OREO_CHURROS,
  SPICY_CHICKEN,
} from './menu-specials';

function key(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function add(map: Record<string, string>, names: string[], copy: string) {
  for (const name of names) map[key(name)] = copy;
}

const COPY: Record<string, string> = {};

add(COPY, ['Wings', 'Wings or Tenders'], 'Jumbo wings tossed in your sauce, with crisp carrots, celery, and cool ranch.');
add(COPY, ['Tenders'], 'Crispy tenders with crisp carrots, celery, and cool ranch.');
add(COPY, ['Nachos'], 'Crisp chips piled high with beans, guacamole, melted cheese, Cheez Whiz, cilantro-lime crema, pico, and jalapeños.');
add(COPY, ['Fried Pickles', 'Fried Pickle Chips'], 'Crispy fried pickle chips with cool chipotle ranch.');
add(COPY, ['Mozzarella Sticks'], 'Golden, gooey mozzarella sticks, fried until crisp.');
add(COPY, ['Frings'], 'A heaping mix of crisp fries and golden onion rings.');
add(COPY, ['Jalapeno Poppers'], 'Crispy fried jalapeño poppers, hot and gooey.');
add(COPY, ['Hummus Plate'], 'Roasted red pepper hummus with crisp carrots, celery, cucumber, and warm pita.');
add(COPY, ['Corn Dogs'], 'Two golden, crunchy corn dogs.');
add(COPY, ['Pretzel Bites'], 'Warm soft pretzel bites with cheese whiz and Dijon.');
add(COPY, ['Bowl Chili', 'Chili', "Chef Mariano's Champion Chili"], 'Hearty chili finished with onions and cool crema.');
add(COPY, ['Friar Frank', 'Hot Dog'], 'A grilled stadium dog piled with red pepper relish and onions.');
add(COPY, ['Calamari'], CALAMARI.description);

add(COPY, ['Sliders', 'Kalua Pork Sliders'], 'Three juicy sliders on a toasted brioche bun — pick your favorite.');

add(COPY, ['Fries', 'Single Fries'], 'A pile of crisp, golden fries.');
add(COPY, ['Large Fries'], 'A bigger pile of crisp, golden fries.');
add(COPY, ['Onion Rings', 'Single Onion Rings'], 'Golden, crunchy onion rings.');
add(COPY, ['Large Onion Rings'], 'A bigger pile of golden onion rings.');
add(COPY, ['Side Salad', 'House Salad'], 'Crisp mixed greens with carrot, tomato, cucumber, croutons, and ranch.');
add(COPY, ['Mac & Cheese', 'Mac Cheese'], 'Creamy elbows in a rich house cheese sauce.');
add(COPY, ['Bacon Mac & Cheese'], 'Creamy elbows in house cheese sauce, finished with bacon.');
add(COPY, ['Side Caesar', 'Caesar Salad', 'Caesar', 'Plain Caesar'], 'Crisp romaine, croutons, and parmesan in creamy Caesar.');
add(COPY, ['Potato Salad'], 'Creamy house potato salad.');
add(COPY, ['Chips & Salsa'], 'Crisp chips with house salsa.');
add(COPY, ['Cup Chili'], 'A cup of hearty chili with onions and crema.');
add(COPY, ['Macaroni Salad'], 'Creamy house macaroni salad.');
add(COPY, ['Coleslaw'], 'Crisp, cool house slaw.');
add(COPY, ['Side Fruit', 'Fruit'], 'A bowl of seasonal fruit.');

add(COPY, ['Cobb', 'Cobb Salad'], 'Mixed greens loaded with bacon, egg, avocado, tomato, red onion, blue cheese, and ranch.');
add(COPY, ['Chicken Caesar'], 'Crisp romaine and grilled chicken with croutons, parmesan, and Caesar.');
add(COPY, ['Healthy Hero', 'Healthy Hero Salad'], 'Crisp mixed greens with cucumber, tomato, sprouts, red onion, croutons, and lemon vinaigrette.');
add(COPY, ['Antipasto', 'Antipasto Salad'], 'Spring mix piled with ham, capicola, mortadella, salami, provolone, cherry peppers, tomato, and parmesan in Italian vinaigrette.');

add(COPY, ['Loaded Carne Asada Fries', 'Loaded Fries Carne Asada'], 'Crisp fries loaded with carne asada, melted cheese, cheese sauce, crema, and pico.');
add(COPY, ['Loaded Buffalo Chicken Fries', 'Loaded Fries Buffalo Chicken', 'Buffalo Chicken'], 'Crisp fries loaded with crispy tenders, pepper jack, buffalo, and chipotle ranch.');
add(COPY, ['Loaded Garlic Parm Fries', 'Loaded Fries Garlic Parm', 'Garlic Parm'], 'Crisp fries tossed in garlic parmesan and shredded parm.');
add(COPY, ['Loaded Cheesesteak Fries', 'Loaded Fries Cheesesteak'], 'Crisp fries loaded with shaved ribeye, cheese sauce, and cheddar.');
add(COPY, ['Loaded Chili Cheese Fries', 'Loaded Fries Chili Cheese', 'Chili Cheese'], 'Crisp fries smothered in chili, cheese sauce, onions, and sour cream.');
add(COPY, ['Loaded Cheese Fries', 'Loaded Fries Cheese', 'Cheese'], 'Crisp fries smothered in cheese sauce and Colby Jack cheddar.');
add(COPY, ['Loaded Bacon & Cheese Fries', 'Loaded Fries Bacon Cheese', 'Bacon & Cheese'], 'Crisp fries with cheese sauce, Colby Jack cheddar, and bacon.');

add(COPY, [
  'Philadelphia',
  'Philly Cheesesteak',
  'Philly Billy',
  'Philly Cheesesteak (Philly Billy)',
  'Philly',
], 'Thin-sliced ribeye with grilled onions, mushrooms, red pepper relish, cherry peppers, and melted provolone on a toasted Amoroso roll.');
add(COPY, ['Carlsbad', 'Carlsbad BLT', 'Carlsbad (BLT+)'], 'Grilled chicken, crispy bacon, and avocado with roasted garlic aioli, lettuce, and tomato on an Italian roll.');
add(COPY, ['Hoboken', 'Hoboken Italian', 'Hoboken (Italian)'], 'Ham, salami, capicola, mortadella, and provolone with lettuce, tomato, red onion, oil, vinegar, and oregano on an Italian roll.');
add(COPY, ['Los Angeles', 'French Dip', 'Los Angeles (French Dip)'], 'Slow-cooked roast beef and melted provolone on an Italian roll, with au jus and horseradish aioli.');
add(COPY, ['San Diego', 'California Burrito', 'San Diego (California Burrito)'], 'Carne asada, golden fries, guacamole, pico, melted cheese, and crema in a warm tortilla.');
add(COPY, ['Manhattan', 'Manhattan Reuben', 'Manhattan (Reuben)'], 'Hot pastrami, Swiss, sauerkraut, and Russian dressing on rye.');
add(COPY, ['Maui', 'Maui (Kalua Pork)'], 'Tender roast pork with crisp slaw, aloha sauce, and pickle on a brioche bun.');

add(COPY, ['Pasadena', 'Pasadena the OG Cheeseburger', 'Pasadena (The OG Cheeseburger)'], 'American cheese, crisp lettuce, onion, pickles, tomato, and hero sauce on a toasted brioche bun.');
add(COPY, ['Tombstone', 'Tombstone (Cowboy)'], 'Cheddar, a golden onion ring, caramelized onions, bacon, and BBQ on a brioche bun.');
add(COPY, ['Leucadia', 'Leucadia (Smash)'], 'American cheese, grilled onions, and AHB sauce on a toasted brioche bun.');
add(COPY, ['Minneapolis', 'Juicy Lucy', 'Minneapolis (Juicy Lucy)', 'Minneapolis Juicy Lucy'], 'A double patty stuffed with American, Colby Jack & cheddar, grilled onions, and AHB sauce on brioche.');
add(COPY, ['Austin', 'Austin (Jalapeno)'], 'Pepper jack, jalapeño poppers, jalapeños, and AHB sauce on brioche.');
add(COPY, ['Irwindale', 'Irwindale (Sriracha Honey)'], 'Swiss, sweet-heat sriracha honey, garlic aioli, and slaw on brioche.');
add(COPY, ['Bama Slama Jama', 'Bama Slama Jamma', 'Bama Slama Jamma (PB&J)'], 'Bacon jam, peanut butter, caramelized onions, and fried onions on brioche.');

add(COPY, ['Village Tacos', 'Village Taco Plate'], 'Three street tacos with beans and chips — pick your tortillas and fillings.');
add(COPY, ['Fish taco', 'Fish Taco'], 'Crisp fish, cabbage, pico, and cilantro-lime crema on a corn tortilla.');
add(COPY, ['Carne Asada taco', 'Carne Asada Taco'], 'Seared ribeye with cilantro and onion on a corn tortilla.');
add(COPY, ['Carnitas taco', 'Carnitas Taco'], 'Tender carnitas with onion and cilantro on a corn tortilla.');

add(COPY, ['Key Lime', 'Key Lime Pie', 'Homemade Key Lime Pie'], 'Cool, tangy house key lime pie — sales help support Shelter to Soldier.');
add(COPY, ['Creamy Cheesecake', 'Cheesecake', 'Homemade Vanilla Cheesecake', 'Vanilla Cheesecake'], 'Creamy house vanilla cheesecake — sales help support Shelter to Soldier.');
add(COPY, ['Churros w/ Ice Cream', 'Churros with Ice Cream', 'Churros with Vanilla Ice Cream'], 'Warm churros with a scoop of vanilla ice cream.');
add(COPY, ['Ice Cream Sandwich', 'Ice Cream Cookie Sandwich'], 'Chocolate chip cookies sandwiching a scoop of ice cream.');
add(COPY, ['Churros'], 'Warm, cinnamon-sugar churros.');
add(COPY, ['Chocolate Chip Cookie'], 'A warm chocolate chip cookie.');
add(COPY, ['Oreo Churros', 'Oreo Churro'], OREO_CHURROS.description);

add(COPY, ['Small Chicken Tenders', 'Kids Chicken Tenders', 'Chicken Tenders'], 'Crispy chicken tenders with fries.');
add(COPY, ['Large Chicken Tenders'], 'A bigger order of crispy chicken tenders and fries.');
add(COPY, ['Burger Kids', 'Kids Burger'], 'A juicy kids burger with fries.');
add(COPY, ['Cheeseburger Kids', 'Kids Cheeseburger', 'Cheeseburger'], 'A juicy kids cheeseburger with fries.');
add(COPY, ['Kids Mac & Cheese', 'Kids Mac Cheese'], 'Creamy mac and fries.');
add(COPY, ['Kids Hot Dog'], 'A kids hot dog with fries.');
add(COPY, ['Kids Corn Dog', 'Corn Dog'], 'A golden corn dog with fries.');
add(COPY, ['Kids Grilled Cheese', 'Grilled Cheese'], 'American and cheddar melted on Amish bread.');

add(COPY, ['Spicy Chicken'], SPICY_CHICKEN.description);
add(COPY, ['Hogzilla'], HOGZILLA.description);
add(COPY, ['Crunchwraps'], CRUNCHWRAPS.description);
add(COPY, ['Chilaquiles'], CHILAQUILES.description);

add(COPY, ['SD Burrito'], 'Choose your meat — wrapped with fluffy scrambled eggs, creamy guacamole, pico de gallo, golden fries, and melted jack and cheddar.');
add(COPY, ['Plates'], 'Friday–Sunday 9am–1pm. Every plate comes with hashbrowns and fruit.');
add(COPY, ['Handhelds', 'Bagel Melt'], 'An egg any style and melted cheddar on your bagel.');
add(COPY, ['Denver', 'Denver Omelette'], 'Ham, bell pepper, grilled onions, and melted cheddar-jack, folded into a fluffy omelette.');
add(COPY, ['Boulder', 'Boulder Omelette'], 'Ribeye, mushrooms, grilled onions, and American cheese, finished with sausage gravy.');
add(COPY, ['Hamtown', 'Hamtown Omelette'], 'Ham and melted cheddar-jack in a fluffy omelette.');
add(COPY, ['Veggieville', 'Veggieville Omelette'], 'Bell peppers, onions, mushrooms, tomato, avocado, and white American cheese.');
add(COPY, ['American Hero Breakfast', 'AHB Breakfast'], 'Bacon, sausage, or ham with two eggs any style, hashbrowns, and your choice of biscuit or toast.');
add(COPY, ['Fallbrook'], 'Avocado toast with two poached eggs, tomato, and sprouts.');
add(COPY, ['Toasty Toast'], 'Golden French toast with syrup and powdered sugar.');

add(COPY, ['Toast'], 'Your choice of toast.');
add(COPY, ['Biscuit'], 'A warm biscuit.');
add(COPY, ['Hash Browns'], 'Crisp golden hash browns.');
add(COPY, ['Biscuits & Gravy', 'Biscuit w Sausage Gravy'], 'Warm biscuits smothered in sausage gravy.');
add(COPY, ['Ham'], 'Grilled ham.');
add(COPY, ['Sausage'], 'Grilled sausage.');
add(COPY, ['Bacon'], 'Crispy bacon.');
add(COPY, ['Pastrami'], 'Warm pastrami.');

add(COPY, ['Coffee'], 'Freshly brewed coffee.');
add(COPY, ['Hot/Iced Tea', 'Hot Iced Tea'], 'Hot or iced tea.');
add(COPY, ['Milk'], 'Cold milk.');
add(COPY, ['Lemonade'], 'Fresh lemonade.');
add(COPY, ['Mimosa'], 'A classic brunch mimosa.');
add(COPY, ['Michelada'], 'A spicy michelada.');
add(COPY, ['Irish Coffee'], 'Irish coffee.');
add(COPY, ['Bloody Mary'], 'A house bloody mary.');
add(COPY, ['Espresso Martini'], 'An espresso martini.');

add(COPY, ['Modelo'], 'A rich, full-flavored pilsner-style Mexican lager with a crisp, well-balanced finish.');
add(COPY, ['Michelob Ultra'], 'A superior light lager with a crisp, clean taste.');
add(COPY, ['Miller Lite'], 'The original light beer — a true American pilsner. Great taste, less filling.');
add(COPY, ['Coors Banquet'], 'A well-balanced golden lager, brewed in Golden, Colorado with Rocky Mountain water.');
add(COPY, ['Guinness'], 'The iconic Irish stout — rich, creamy, and smooth.');
add(COPY, ['High Noon'], 'Hard seltzer made with real vodka, real juice, and sparkling water.');
add(COPY, ['Sun Cruiser Tea', 'Sun Cruiser'], 'Hard iced tea made with real brewed tea and vodka — smooth, no bubbles.');
add(COPY, ['Nutrl Watermelon', 'Nutrl'], 'Vodka seltzer with real watermelon juice — light and refreshing.');
add(COPY, ['White Claw'], 'Crisp hard seltzer — Black Cherry or Mango.');
add(COPY, ['Corona N/A', 'Corona NA', 'Corona Cero'], 'Non-alcoholic Corona with the same crisp, refreshing taste.');
add(COPY, ['Athletic Lite N/A', 'Athletic Lite NA', 'Athletic Lite'], 'Non-alcoholic light beer — crisp, clean, and easy-drinking.');

export const MENU_DESCRIPTIONS: Readonly<Record<string, string>> = COPY;

const SKIP_REPLACE_IF_PRESENT = new Set(['calamari']);

export function copyForName(name: string, groupName?: string): string | undefined {
  const itemKey = key(name);
  if (!itemKey) return undefined;
  if (groupName) {
    const prefixed = key(`${groupName} ${name}`);
    if (COPY[prefixed]) return COPY[prefixed];
    const suffixed = key(`${name} ${groupName}`);
    if (COPY[suffixed]) return COPY[suffixed];
  }
  return COPY[itemKey];
}

export function shouldReplaceDescription(name: string, current?: string): boolean {
  if (SKIP_REPLACE_IF_PRESENT.has(key(name)) && current?.trim()) return false;
  return true;
}
