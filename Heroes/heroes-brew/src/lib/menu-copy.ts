/**
 * Guest-facing dish copy from the kitchen recipe sheet.
 * Keys are photoKey-normalized names. Apply only to items that already exist.
 */

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

add(COPY, ['Wings', 'Wings or Tenders'], 'Jumbo wings tossed in your sauce, with crisp carrots, celery, and ranch.');
add(COPY, ['Nachos'], 'Crisp chips piled with beans, guacamole, melted cheese, Cheez Whiz, cilantro-lime crema, pico, and jalapeños.');
add(COPY, ['Fried Pickles', 'Fried Pickle Chips'], 'Crispy fried pickle chips with chipotle ranch.');
add(COPY, ['Mozzarella Sticks'], 'Golden fried mozzarella sticks.');
add(COPY, ['Frings'], 'A mix of fries and onion rings.');
add(COPY, ['Jalapeno Poppers'], 'Fried jalapeño poppers.');
add(COPY, ['Hummus Plate'], 'Roasted red pepper hummus with carrots, celery, cucumber, and warm pita.');
add(COPY, ['Corn Dogs'], 'Two golden corn dogs.');
add(COPY, ['Pretzel Bites'], 'Soft pretzel bites with cheese whiz and Dijon.');
add(COPY, ['Bowl Chili', 'Chili', "Chef Mariano's Champion Chili"], 'Hearty chili with onions and crema.');
add(COPY, ['Friar Frank', 'Hot Dog'], 'Grilled hot dog with red pepper relish and onions.');
add(COPY, ['Calamari'], 'Rings & tentacles, marinara + house aioli.');

add(COPY, ['Sliders', 'Kalua Pork Sliders'], 'Three sliders — burger, cheeseburger, kalua pork, pulled pork, or buffalo chicken.');

add(COPY, ['Fries', 'Single Fries'], 'Crisp fries.');
add(COPY, ['Large Fries'], 'A larger pile of crisp fries.');
add(COPY, ['Onion Rings', 'Single Onion Rings'], 'Golden onion rings.');
add(COPY, ['Large Onion Rings'], 'A larger pile of golden onion rings.');
add(COPY, ['Side Salad'], 'Mixed greens, carrot, tomato, cucumber, croutons, and ranch.');
add(COPY, ['Mac & Cheese', 'Mac Cheese'], 'Creamy elbows in house cheese sauce.');
add(COPY, ['Bacon Mac & Cheese'], 'Creamy elbows in house cheese sauce with bacon.');
add(COPY, ['Side Caesar', 'Caesar Salad', 'Caesar', 'Plain Caesar', 'House Salad'], 'Romaine, croutons, parmesan, and Caesar.');
add(COPY, ['Potato Salad'], 'House potato salad.');
add(COPY, ['Chips & Salsa'], 'Crisp chips with salsa.');
add(COPY, ['Cup Chili'], 'Chili with onions and crema.');
add(COPY, ['Macaroni Salad'], 'House macaroni salad.');
add(COPY, ['Coleslaw'], 'Crisp house slaw.');
add(COPY, ['Side Fruit'], 'Seasonal fruit.');

add(COPY, ['Cobb', 'Cobb Salad'], 'Mixed greens with bacon, egg, avocado, tomato, red onion, blue cheese, and ranch.');
add(COPY, ['Chicken Caesar'], 'Romaine, grilled chicken, croutons, parmesan, and Caesar.');
add(COPY, ['Healthy Hero', 'Healthy Hero Salad'], 'Mixed greens with cucumber, tomato, sprouts, red onion, croutons, and lemon vinaigrette.');

add(COPY, ['Loaded Carne Asada Fries', 'Loaded Fries Carne Asada'], 'Fries with carne asada, melted cheese, cheese sauce, crema, and pico.');
add(COPY, ['Loaded Buffalo Chicken Fries', 'Loaded Fries Buffalo Chicken', 'Buffalo Chicken'], 'Fries with crispy tenders, pepper jack, buffalo, and chipotle ranch.');
add(COPY, ['Loaded Garlic Parm Fries', 'Loaded Fries Garlic Parm', 'Garlic Parm'], 'Fries tossed with garlic parmesan and shredded parm.');
add(COPY, ['Loaded Cheesesteak Fries', 'Loaded Fries Cheesesteak'], 'Fries with shaved ribeye, cheese sauce, and cheddar.');
add(COPY, ['Loaded Chili Cheese Fries', 'Loaded Fries Chili Cheese', 'Chili Cheese'], 'Fries with chili, cheese sauce, onions, and sour cream.');
add(COPY, ['Loaded Cheese Fries', 'Loaded Fries Cheese'], 'Fries with cheese sauce and Colby Jack cheddar.');
add(COPY, ['Loaded Bacon & Cheese Fries', 'Loaded Fries Bacon Cheese', 'Bacon & Cheese'], 'Fries with cheese sauce, Colby Jack cheddar, and bacon.');

add(COPY, [
  'Philadelphia',
  'Philly Cheesesteak',
  'Philly Billy',
  'Philly Cheesesteak (Philly Billy)',
  'Philly',
], 'Shaved ribeye, grilled onions, mushrooms, red pepper relish, cherry peppers, and melted provolone on an Amoroso roll.');
add(COPY, ['Carlsbad', 'Carlsbad BLT', 'Carlsbad (BLT+)'], 'Grilled chicken, crispy bacon, avocado, roasted garlic aioli, lettuce, and tomato on an Italian roll.');
add(COPY, ['Hoboken', 'Hoboken Italian', 'Hoboken (Italian)'], 'Ham, salami, capicola, mortadella, and provolone with lettuce, tomato, red onion, oil, vinegar, and oregano on an Italian roll.');
add(COPY, ['Los Angeles', 'French Dip', 'Los Angeles (French Dip)'], 'Roast beef and provolone with au jus and horseradish aioli on an Italian roll.');
add(COPY, ['San Diego', 'California Burrito', 'San Diego (California Burrito)'], 'Carne asada, fries, guacamole, pico, cheese, and crema in a warm tortilla.');
add(COPY, ['Manhattan', 'Manhattan Reuben', 'Manhattan (Reuben)'], 'Pastrami, Swiss, sauerkraut, and Russian dressing on rye.');
add(COPY, ['Maui', 'Maui (Kalua Pork)'], 'Roast pork, crisp slaw, aloha sauce, and pickle on a brioche bun.');

add(COPY, ['Pasadena', 'Pasadena the OG Cheeseburger', 'Pasadena (The OG Cheeseburger)'], 'American cheese, lettuce, onion, pickles, tomato, and hero sauce on a brioche bun.');
add(COPY, ['Tombstone', 'Tombstone (Cowboy)'], 'Cheddar, onion ring, caramelized onions, bacon, and BBQ on a brioche bun.');
add(COPY, ['Leucadia', 'Leucadia (Smash)'], 'American cheese, grilled onions, and AHB sauce on a brioche bun.');
add(COPY, ['Minneapolis', 'Juicy Lucy', 'Minneapolis (Juicy Lucy)', 'Minneapolis Juicy Lucy'], 'Double patty with American, Colby Jack & cheddar, grilled onions, and AHB sauce on brioche.');
add(COPY, ['Austin', 'Austin (Jalapeno)'], 'Pepper jack, jalapeño poppers, jalapeños, and AHB sauce on brioche.');
add(COPY, ['Irwindale', 'Irwindale (Sriracha Honey)'], 'Swiss, sriracha honey, garlic aioli, and slaw on brioche.');
add(COPY, ['Bama Slama Jama', 'Bama Slama Jamma', 'Bama Slama Jamma (PB&J)'], 'Bacon jam, peanut butter, caramelized and fried onions on brioche.');

add(COPY, ['Village Tacos', 'Village Taco Plate'], 'Three tacos with beans and chips.');
add(COPY, ['Fish taco', 'Fish Taco'], 'Fish, cabbage, pico, and cilantro-lime crema on a corn tortilla.');
add(COPY, ['Carne Asada taco', 'Carne Asada Taco'], 'Ribeye, cilantro, and onion on a corn tortilla.');
add(COPY, ['Carnitas taco', 'Carnitas Taco'], 'Carnitas, onion, and cilantro on a corn tortilla.');

add(COPY, ['Key Lime', 'Key Lime Pie', 'Homemade Key Lime Pie'], 'House key lime pie.');
add(COPY, ['Creamy Cheesecake', 'Cheesecake', 'Homemade Vanilla Cheesecake', 'Vanilla Cheesecake'], 'Creamy cheesecake.');
add(COPY, ['Churros w/ Ice Cream', 'Churros with Ice Cream', 'Churros with Vanilla Ice Cream'], 'Warm churros with a scoop of ice cream.');
add(COPY, ['Ice Cream Sandwich', 'Ice Cream Cookie Sandwich'], 'Chocolate chip cookies with ice cream.');
add(COPY, ['Churros'], 'Warm churros.');
add(COPY, ['Chocolate Chip Cookie'], 'A chocolate chip cookie.');
add(COPY, ['Oreo Churros', 'Oreo Churro'], 'Oreo-dusted churros with chocolate and caramel dip.');

add(COPY, ['Small Chicken Tenders', 'Kids Chicken Tenders'], 'Chicken tenders and fries.');
add(COPY, ['Large Chicken Tenders'], 'A larger order of chicken tenders and fries.');
add(COPY, ['Burger Kids', 'Kids Burger'], 'A burger and fries.');
add(COPY, ['Cheeseburger Kids', 'Kids Cheeseburger'], 'A cheeseburger and fries.');
add(COPY, ['Kids Mac & Cheese', 'Kids Mac Cheese'], 'Creamy mac and fries.');
add(COPY, ['Kids Hot Dog'], 'A hot dog and fries.');
add(COPY, ['Kids Corn Dog'], 'A corn dog and fries.');
add(COPY, ['Kids Grilled Cheese'], 'American and cheddar on Amish bread.');

add(COPY, ['Spicy Chicken'], 'Crispy chicken, bacon, melted jack.');

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
