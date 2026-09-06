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
 * - ✅ Appetizing rewrite from Toast POS final map + existing site voice
 * - ✅ Fish / Baja Fish: cilantro-lime crema only (no tartar)
 *
 * LAST UPDATED: 2026-09-06
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
add(COPY, ['Frings', 'Frings 1/2 & 1/2'], 'Half fries, half onion rings — the best of both.');
add(COPY, ['Jalapeno Poppers', 'Jalapeño Poppers'], 'Six pickled jalapeños stuffed with cream cheese and wrapped in bacon.');
add(COPY, ['Hummus Plate'], 'Roasted red pepper hummus with crisp carrots, celery, cucumber, and warm pita.');
add(COPY, ['Corn Dogs'], 'Two golden, crunchy corn dogs.');
add(COPY, ['Pretzel Bites'], 'Warm soft pretzel bites with cheese whiz and Dijon.');
add(COPY, ['Bowl Chili', 'Chili', "Chef Mariano's Champion Chili"], "A bowl of Chef Mariano's champion chili finished with onions and cool crema.");
add(COPY, ['Friar Frank', 'Hot Dog'], 'A grilled stadium dog piled with red pepper relish and onions.');
add(COPY, ['Calamari'], CALAMARI.description);

add(COPY, ['Sliders', 'Kalua Pork Sliders'], 'Three juicy sliders on a toasted brioche bun — pick your favorite.');
add(COPY, ['BBQ', 'BBQ Pork Slider', 'BBQ Slider'], 'BBQ pork slider with pickles on a toasted brioche bun.');
add(COPY, ['Hamburger', 'Hamburger Slider'], 'Mini hamburger slider on a toasted brioche bun.');
add(COPY, ['Chicken Slider', 'Fried Chicken Slider'], 'Fried chicken slider with lettuce and pickle on a toasted brioche bun.');
add(COPY, ['Kalua Pork Slider'], 'Kalua pork slider with coleslaw and aloha sauce.');

add(COPY, ['Fries', 'Single Fries'], 'Crispy golden fries, cooked to order.');
add(COPY, ['Large Fries'], 'A bigger pile of crisp, golden fries.');
add(COPY, ['Onion Rings', 'Single Onion Rings'], 'Crispy beer-battered onion rings.');
add(COPY, ['Large Onion Rings'], 'A bigger pile of golden onion rings.');
add(COPY, ['Side Salad', 'House Salad'], 'Crisp mixed greens with carrot, tomato, cucumber, croutons, and ranch.');
add(COPY, ['Mac & Cheese', 'Mac Cheese'], 'Creamy elbows in a rich house cheese sauce.');
add(COPY, ['Bacon Mac & Cheese'], 'Creamy elbows in house cheese sauce, finished with bacon.');
add(COPY, ['Side Caesar', 'Caesar Salad', 'Caesar', 'Plain Caesar'], 'Crisp romaine, croutons, and parmesan in creamy Caesar.');
add(COPY, ['Potato Salad'], 'Creamy house potato salad.');
add(COPY, ['Chips & Salsa'], 'Crisp tortilla chips with house salsa.');
add(COPY, ['Cup Chili'], "A cup of Chef Mariano's champion chili finished with onions and cool crema.");
add(COPY, ['Macaroni Salad'], 'Creamy house macaroni salad.');
add(COPY, ['Coleslaw'], 'Cool, crisp house coleslaw.');
add(COPY, ['Side Fruit', 'Fruit'], 'A fresh side of seasonal fruit.');

add(COPY, ['Cobb', 'Cobb Salad'], 'Mixed greens loaded with bacon, egg, avocado, tomato, red onion, blue cheese, and ranch.');
add(COPY, ['Chicken Caesar'], 'Crisp romaine and grilled chicken with croutons, parmesan, and Caesar.');
add(COPY, ['Healthy Hero', 'Healthy Hero Salad'], 'Crisp mixed greens with cucumber, tomato, sprouts, red onion, croutons, and lemon vinaigrette.');
add(COPY, ['Antipasto', 'Antipasto Salad'], 'Spring mix piled with ham, capicola, mortadella, salami, provolone, cherry peppers, tomato, and parmesan in Italian vinaigrette.');

add(COPY, ['Loaded Fries'], 'Crispy fries loaded your way — garlic parm, chili cheese, carne asada, and more.');
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
], 'Classic Philly cheesesteak — thin-sliced ribeye on a toasted Amoroso roll, with your choice of white American, provolone, or Whiz.');
add(COPY, ['Carlsbad', 'Carlsbad BLT', 'Carlsbad (BLT+)'], 'Grilled chicken breast, bacon, avocado, lettuce, tomato, and roasted garlic aioli on a toasted brioche bun.');
add(COPY, ['Hoboken', 'Hoboken Italian', 'Hoboken (Italian)'], 'Ham, salami, capicola, mortadella, and provolone with lettuce, tomato, red onion, oil, vinegar, and oregano on an Italian roll.');
add(COPY, ['Los Angeles', 'French Dip', 'Los Angeles (French Dip)'], 'Slow-cooked roast beef and melted Swiss on an Italian roll, with au jus and horseradish aioli.');
add(COPY, ['San Diego', 'California Burrito', 'San Diego (California Burrito)'], 'Carne asada, golden fries, guacamole, melted cheese, cilantro-lime crema, and pico in a warm tortilla.');
add(COPY, ['Manhattan', 'Manhattan Reuben', 'Manhattan (Reuben)'], 'Hot pastrami with pickles and dark-ale mustard on rye — or make it a Reuben with Swiss, sauerkraut, and Russian dressing.');
add(COPY, ['Maui', 'Maui (Kalua Pork)'], 'Kalua pork, coleslaw, and aloha sauce on a toasted roll — island vibes, mainland appetite.');
add(COPY, ['Portland', 'Portland Vegetarian'], 'Spring mix, red pepper hummus, sprouts, cucumber, tomato, avocado, and red onion with citrus vinaigrette in a spinach wrap.');

add(COPY, ['Pasadena', 'Pasadena the OG Cheeseburger', 'Pasadena (The OG Cheeseburger)'], 'A quarter-pound patty with shredded lettuce, tomato, pickle, red onion, AHB Hero sauce, and your choice of cheese on a toasted brioche bun.');
add(COPY, ['Tombstone', 'Tombstone (Cowboy)'], 'A quarter-pound patty with bacon, grilled onions, cheddar, onion rings, and AHB BBQ on a toasted brioche bun.');
add(COPY, ['Leucadia', 'Leucadia (Smash)'], 'American cheese, grilled onions, and AHB sauce on a toasted brioche bun.');
add(COPY, ['Minneapolis', 'Juicy Lucy', 'Minneapolis (Juicy Lucy)', 'Minneapolis Juicy Lucy'], 'Two quarter-pound patties stuffed with cheddar, topped with grilled onions, a cheddar skirt, and Hero sauce on a toasted brioche bun.');
add(COPY, ['Austin', 'Austin (Jalapeno)'], 'Pepper jack, Cheez Whiz, jalapeños, grilled onions, and Hero sauce on a toasted brioche bun, topped with a jalapeño popper.');
add(COPY, ['Irwindale', 'Irwindale (Sriracha Honey)'], 'Swiss, sweet-heat sriracha honey, garlic aioli, and slaw on brioche.');
add(COPY, ['Bama Slama Jama', 'Bama Slama Jamma', 'Bama Slama Jamma (PB&J)'], 'Bacon jam, peanut butter, caramelized onions, and fried onions on brioche.');

add(COPY, ['Village Tacos', 'Village Taco Plate'], 'Three tacos, topped with onion, cilantro, and queso fresco. Served with refried beans and chips.');
add(COPY, ['Fish taco', 'Fish Taco', 'Baja Fish', 'Baja Fish Taco'], 'Crispy fish taco with cabbage, pico de gallo, queso fresco, cilantro, and cilantro-lime crema.');
add(COPY, ['Carne Asada taco', 'Carne Asada Taco'], 'Grilled carne asada taco topped with onion, cilantro, and queso fresco.');
add(COPY, ['Carnitas taco', 'Carnitas Taco'], 'Slow-cooked carnitas taco topped with onion, cilantro, and queso fresco.');
add(COPY, ['Chicken taco', 'Chicken Taco', 'Grilled Chicken Taco'], 'Seasoned chicken taco topped with onion, cilantro, and queso fresco.');

add(COPY, ['Key Lime', 'Key Lime Pie', 'Homemade Key Lime Pie'], 'Cool, tangy homemade key lime pie — sales help support Shelter to Soldier.');
add(COPY, ['Creamy Cheesecake', 'Cheesecake', 'Homemade Vanilla Cheesecake', 'Vanilla Cheesecake'], "Grandma's creamy cheesecake — sales help support Shelter to Soldier.");
add(COPY, ['Churros w/ Ice Cream', 'Churros with Ice Cream', 'Churros with Vanilla Ice Cream'], 'Crispy churros with a scoop of vanilla ice cream.');
add(COPY, ['Ice Cream Sandwich', 'Ice Cream Cookie Sandwich'], 'Vanilla ice cream sandwiched between chocolate chip cookies.');
add(COPY, ['Churros'], 'Crispy churros dusted with cinnamon sugar.');
add(COPY, ['Chocolate Chip Cookie'], 'A fresh-baked chocolate chip cookie.');
add(COPY, ['Scoop Vanilla Ice Cream', 'Vanilla Ice Cream'], 'A scoop of vanilla ice cream.');
add(COPY, ['Root Beer Float'], 'Classic root beer float with vanilla ice cream.');
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
add(COPY, ['Handhelds', 'Bagel Melt', 'Bagel Melts'], 'An egg any style and melted cheddar on your bagel.');
add(COPY, ['Plain Bagel'], 'Toasted plain bagel.');
add(COPY, ['Everything Bagel'], 'Everything bagel, toasted.');
add(COPY, ['Jalapeno Bagel', 'Jalapeño Bagel'], 'Jalapeño bagel, toasted.');
add(COPY, ['Denver', 'Denver Omelette'], 'Ham, bell pepper, grilled onions, and melted cheddar-jack, folded into a fluffy omelette.');
add(COPY, ['Boulder', 'Boulder Omelette'], 'Ribeye, mushrooms, grilled onions, and American cheese, finished with sausage gravy.');
add(COPY, ['Hamtown', 'Hamtown Omelette'], 'Ham and melted cheddar-jack in a fluffy omelette.');
add(COPY, ['Veggieville', 'Veggieville Omelette'], 'Bell peppers, onions, mushrooms, tomato, avocado, and white American cheese.');
add(COPY, ['American Hero Breakfast', 'AHB Breakfast'], 'Bacon, sausage, or ham with two eggs any style, hashbrowns, and your choice of biscuit or toast.');
add(COPY, ['Fallbrook'], 'Avocado toast on thick-cut Amish bread with two poached eggs, tomato, and sprouts.');
add(COPY, ['Toasty Toast'], 'Golden French toast with syrup and powdered sugar.');
add(COPY, ['Bacon Burrito'], 'Breakfast burrito stuffed with eggs, bacon, and all the morning fixings.');
add(COPY, ['Carne Asada Burrito'], 'Breakfast burrito with carne asada, eggs, and classic fixings.');
add(COPY, ['Chicken Burrito'], 'Breakfast burrito with chicken, eggs, and classic fixings.');
add(COPY, ['Carnitas Burrito'], 'Breakfast burrito with carnitas, eggs, and classic fixings.');
add(COPY, ['Pastrami Burrito'], 'Breakfast burrito with pastrami, eggs, and classic fixings.');
add(COPY, ['Sausage Burrito'], 'Breakfast burrito with sausage, eggs, and classic fixings.');

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
add(COPY, ['Mimosa', 'Mimosa Single'], 'Fresh mimosa — bubbles and citrus.');
add(COPY, ['Mimosa Bottomless', 'Bottomless Mimosa'], 'Bottomless mimosas while you brunch.');
add(COPY, ['Michelada'], 'A spicy michelada.');
add(COPY, ['Irish Coffee'], 'Hot coffee, Irish whiskey, and a cloud of cream.');
add(COPY, ['Bloody Mary'], 'Spicy Bloody Mary loaded and ready for brunch.');
add(COPY, ['Espresso Martini'], 'An espresso martini.');
add(COPY, ['South Ponto Sour'], 'Bright whiskey sour with a coastal twist.');
add(COPY, ['Golden Hour Martini'], 'Elegant martini built for golden hour in the Village.');
add(COPY, ['Flower Field Fizz'], 'Floral, fizzy cocktail inspired by Carlsbad flower fields.');
add(COPY, ['Ashpresso'], 'Espresso cocktail with a bold coffee kick.');
add(COPY, ['Starburst'], 'Bright, candy-sweet cocktail with a punchy finish.');
add(COPY, ['Red Bull Vodka', 'Red Bull/Vodka'], 'Vodka and Red Bull served in a pint.');
add(COPY, ['Margarita Rocks', 'Margarita (Rocks)'], 'Classic margarita on the rocks.');
add(COPY, ['Padres Hot Dog'], 'Ballpark-style hot dog piled high for game day.');
add(COPY, ['Monday Pork Slider'], 'Kalua pork slider with coleslaw and aloha sauce — Mahalo Monday favorite.');

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
