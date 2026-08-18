import { Menu, Restaurant } from '@/types';

// Static fallback menu — June 2026 food book. Mirrors exactly what
// parseMenuRows() in menu-sheet.ts produces from the live Google Sheet CSV
// (same tabs, sections, items, prices, descriptions and option groups), so the
// site renders identically whether or not the sheet is reachable.
export function getMenus(): Menu[] {
  return [
    {
      id: 'menu-1',
      name: 'Main Menu',
      groups: [
        // ─── STARTING ───
        {
          id: 'starting',
          name: 'Starting',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'starting-munchies',
              name: 'Munchies',
              displayMode: 'variants',
              items: [
                { id: 'starting-munchies-calamari', name: 'Calamari', description: 'Rings & tentacles, marinara + house aioli.' },
                { id: 'starting-munchies-i0', name: 'Hummus Plate', description: 'Red Pepper Hummus, celery, carrots, cucumber and pita bread.', price: 12 },
                { id: 'starting-munchies-i1', name: 'Fried Pickles', description: 'With house-made chipotle ranch.', price: 12 },
                { id: 'starting-munchies-i2', name: "Chef Mariano's Champion Chili", description: 'Topped with sour cream, shredded cheese and red onion.', price: 12 },
                { id: 'starting-munchies-i3', name: 'Corn Dogs', description: '(2) With yellow mustard.', price: 12 },
                { id: 'starting-munchies-i4', name: 'Pretzel Bites', description: 'With spicy brown mustard and AHB Wiz.', price: 12 },
                { id: 'starting-munchies-i5', name: 'Mozzarella Sticks', description: 'With house-made marinara sauce.', price: 12 },
                { id: 'starting-munchies-i6', name: 'Jalapeno Poppers', description: 'With house-made ranch.', price: 12 },
              ],
            },
            {
              id: 'starting-nachos',
              name: 'Nachos',
              displayMode: 'variants',
              basePrice: 15,
              description: 'House-made chips with cheddar jack cheese, AHB Wiz, refried beans, jalapenos, sour cream and guacamole.',
              addOnLabel: 'Add a Meat',
              addOns: [
                { name: 'Carnitas', price: '+6' },
                { name: 'Carne Asada', price: '+6' },
                { name: 'Chicken', price: '+6' },
              ],
              items: [
                { id: 'starting-nachos-i0', name: 'Nachos', description: 'House-made chips with cheddar jack cheese, AHB Wiz, refried beans, jalapenos, sour cream and guacamole.', price: 15 },
              ],
            },
            {
              id: 'starting-loaded-fries',
              name: 'Loaded Fries',
              displayMode: 'variants',
              items: [
                { id: 'starting-loaded-fries-i0', name: 'Garlic Parm', description: 'House mix of garlic & parmesan cheese.', price: 18 },
                { id: 'starting-loaded-fries-i1', name: 'Cheese', description: 'Cheddar/jack cheese, AHB Whiz. +2 Add Bacon.', price: 18 },
                { id: 'starting-loaded-fries-i2', name: 'Chili Cheese', description: "Cheddar/jack cheese, Chef Mariano's Champion Chili, sour cream & red onion.", price: 18 },
                { id: 'starting-loaded-fries-i3', name: 'Buffalo Chicken', description: 'Pepper jack cheese, chicken tenders, chipotle ranch, buffalo hot sauce.', price: 18 },
                { id: 'starting-loaded-fries-i4', name: 'Carne Asada', description: 'Carne asada, melted cheddar/jack cheese, AHB Whiz, guacamole, sour cream, pico de gallo.', price: 18 },
                { id: 'starting-loaded-fries-i5', name: 'Cheesesteak', description: 'Ribeye, cheddar/jack cheese, AHB Whiz.', price: 18 },
              ],
            },
            {
              id: 'starting-wings-or-tenders',
              name: 'Wings or Tenders',
              displayMode: 'variants',
              choices: [
                {
                  label: 'Toss Them in a Sauce',
                  options: ['Buffalo Hot', "Kickn' BBQ", 'Mango Habanero', 'Sriracha Honey', 'Garlic Parmesan', 'Lemon Pepper', 'Old Bay Dry Rub', 'Plain'],
                },
              ],
              items: [
                { id: 'starting-wings-or-tenders-i0', name: 'Wings', description: '(8) Pieces served with celery, carrots & ranch. Bleu cheese available.', price: 18 },
                { id: 'starting-wings-or-tenders-i1', name: 'Tenders', description: '(8) Pieces served with celery, carrots & ranch. Bleu cheese available.', price: 21 },
              ],
            },
            {
              id: 'starting-sliders',
              name: 'Sliders',
              displayMode: 'variants',
              basePrice: 18,
              description: '(3) Juicy sliders served on a brioche bun.',
              choices: [
                {
                  label: 'Select',
                  options: [
                    'Kahlua Pork — Coleslaw & Aloha Sauce',
                    'BBQ Pork — Pickles',
                    'Fried Chicken — Lettuce & Pickle',
                    'Cheeseburger — American Cheese',
                  ],
                },
              ],
              items: [
                { id: 'starting-sliders-i0', name: 'Sliders', description: '(3) Juicy sliders served on a brioche bun.', price: 18 },
              ],
            },
          ],
        },

        // ─── MAINS ───
        {
          id: 'mains',
          name: 'Mains',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'mains-kitchen-specials',
              name: 'Kitchen Specials',
              displayMode: 'variants',
              items: [
                { id: 'mains-kitchen-specials-spicy-chicken', name: 'Spicy Chicken', description: 'Crispy chicken, bacon, melted jack.' },
                { id: 'mains-kitchen-specials-burger-wrap', name: 'Burger Wrap', description: 'Pressed tortilla, beef, cheese.' },
              ],
            },
            {
              id: 'mains-hero-sandwiches',
              name: 'Hero Sandwiches',
              displayMode: 'variants',
              items: [
                { id: 'mains-hero-sandwiches-i0', name: 'San Diego (California Burrito)', description: 'Ribeye carne asada, fries, guacamole, sour cream, pico de gallo, melted cheddar/jack, wrapped in a flour tortilla.', price: 20 },
                { id: 'mains-hero-sandwiches-i1', name: 'Carlsbad (BLT+)', description: 'Grilled all-natural chicken breast, bacon, avocado, lettuce, tomato, roasted garlic aioli on an Italian roll.', price: 19 },
                { id: 'mains-hero-sandwiches-i2', name: 'Los Angeles (French Dip)', description: 'Slow cooked roast beef, provolone cheese on an Italian roll with au jus & horseradish aioli. +1 Grilled Onions · +1 Grilled Mushrooms.', price: 22 },
                { id: 'mains-hero-sandwiches-i3', name: 'Maui (Kalua Pork)', description: 'Kalua pork, coleslaw, aloha sauce and a pickle on a brioche bun.', price: 18 },
                { id: 'mains-hero-sandwiches-i4', name: 'Hoboken (Italian)', description: 'Ham, salami, capicola, mortadella, provolone cheese, lettuce, tomato, red onion, oil & vinegar, oregano. Your choice: Grinder style (lightly toasted) or cold.', price: 22 },
                { id: 'mains-hero-sandwiches-i5', name: 'Manhattan (Reuben)', description: 'Pastrami, sauerkraut, Swiss cheese, Russian dressing, on rye bread.', price: 22 },
              ],
            },
            {
              id: 'mains-philly-cheesesteak-philly-billy',
              name: 'Philly Cheesesteak (Philly Billy)',
              displayMode: 'variants',
              basePrice: 22,
              description: 'Thin-sliced, grilled ribeye. Your choice of wit or wit-out grilled onions.',
              choices: [
                { label: 'Your Choice of Cheese', options: ['American', 'Provolone', 'AHB Whiz'] },
              ],
              addOnLabel: 'Upgrade Your Way',
              addOns: [
                { name: 'Sauteed Mushrooms', price: '+1' },
                { name: 'Sauteed Cherry Peppers', price: '+1' },
                { name: 'Red Pepper Relish', price: '+1' },
                { name: 'Marinara Sauce', price: '+1' },
              ],
              items: [
                { id: 'mains-philly-cheesesteak-philly-billy-i0', name: 'Philly Cheesesteak (Philly Billy)', description: 'Thin-sliced, grilled ribeye. Your choice of wit or wit-out grilled onions.', price: 22 },
              ],
            },
            {
              id: 'mains-hero-burgers',
              name: 'Hero Burgers',
              displayMode: 'variants',
              items: [
                { id: 'mains-hero-burgers-i0', name: 'Pasadena (The OG Cheeseburger)', description: 'White American cheese, lettuce, tomato, pickle, red onion, AHB Hero sauce, on a brioche bun.', price: 18 },
                { id: 'mains-hero-burgers-i1', name: 'Tombstone (Cowboy)', description: "Onion rings, bacon, grilled onions, and cheddar on a brioche bun with a side of AHB Kickn' BBQ sauce.", price: 18 },
                { id: 'mains-hero-burgers-i2', name: 'Minneapolis (Juicy Lucy)', description: '1/2lb burger patty stuffed with white American cheese, topped with grilled onions, and cheddar/jack cheese skirt, AHB Hero sauce, on a brioche bun.', price: 23 },
                { id: 'mains-hero-burgers-i3', name: 'Austin (Jalapeno)', description: 'Pepper jack cheese, grilled jalapenos, grilled onions, AHB Hero sauce, on a brioche bun, topped with a jalapeno popper.', price: 18 },
                { id: 'mains-hero-burgers-i4', name: 'Irwindale (Sriracha Honey)', description: 'Crispy onions, coleslaw, pickles, Swiss cheese, garlic aioli, sriracha honey sauce on a brioche bun.', price: 18 },
                { id: 'mains-hero-burgers-i5', name: 'Leucadia (Smash)', description: 'Grilled onions, white American cheese, pickles, AHB Hero sauce, on a brioche bun.', price: 18 },
                { id: 'mains-hero-burgers-i6', name: 'Bama Slama Jamma (PB&J)', description: 'Peanut butter, jelly, fried onion, bacon jelly, on a brioche bun.', price: 23 },
              ],
            },
            {
              id: 'mains-village-tacos',
              name: 'Village Tacos',
              displayMode: 'variants',
              basePrice: 17,
              description: '(3) Street tacos served on your choice of flour or corn tortillas with refried beans, chips & salsa.',
              choices: [
                {
                  label: 'Pick Your Tacos',
                  options: [
                    'Carnitas — Onion, Cilantro, Salsa Verde',
                    'Carne Asada — Onion, Cilantro, Guacamole, Salsa',
                    'Baja Fish — Cabbage, Pico de Gallo, Chipotle Tartar Sauce',
                    'Grilled Chicken — Onion, Cilantro, Guacamole',
                  ],
                },
              ],
              addOnLabel: 'Add',
              addOns: [
                { name: 'Guacamole', price: '+4' },
              ],
              items: [
                { id: 'mains-village-tacos-i0', name: 'Village Tacos', description: '(3) Street tacos served on your choice of flour or corn tortillas with refried beans, chips & salsa.', price: 17 },
              ],
            },
            {
              id: 'mains-friar-frank',
              name: 'Friar Frank',
              displayMode: 'variants',
              basePrice: 8,
              description: 'Stadium hot dog served with grilled onions, red pepper relish, ketchup & mustard.',
              items: [
                { id: 'mains-friar-frank-i0', name: 'Friar Frank', description: 'Stadium hot dog served with grilled onions, red pepper relish, ketchup & mustard.', price: 8 },
              ],
            },
            {
              id: 'mains-a-la-carte-sides',
              name: 'A la Carte Sides',
              displayMode: 'variants',
              items: [
                { id: 'mains-a-la-carte-sides-i0', name: 'Fries', price: 6 },
                { id: 'mains-a-la-carte-sides-i1', name: 'Onion Rings', price: 7 },
                { id: 'mains-a-la-carte-sides-i2', name: 'Frings', price: 11 },
                { id: 'mains-a-la-carte-sides-i3', name: 'Potato Salad', price: 5 },
                { id: 'mains-a-la-carte-sides-i4', name: 'Macaroni Salad', price: 5 },
                { id: 'mains-a-la-carte-sides-i5', name: 'Chips & Salsa', price: 6 },
                { id: 'mains-a-la-carte-sides-i6', name: 'Mac & Cheese', price: 9 },
                { id: 'mains-a-la-carte-sides-i7', name: 'Caesar Salad', price: 10 },
                { id: 'mains-a-la-carte-sides-i8', name: 'House Salad', price: 10 },
              ],
            },
          ],
        },

        // ─── SALADS ───
        {
          id: 'salads',
          name: 'Salads',
          displayMode: 'variants',
          addOnLabel: 'Add',
          addOns: [
            { name: 'Avocado', price: '+2' },
            { name: 'Grilled Chicken', price: '+6' },
            { name: 'Blackened Chicken', price: '+6' },
          ],
          items: [
            { id: 'salads-i0', name: 'Healthy Hero', description: 'Spring mix, sprouts, tomato, cucumber, red onion, croutons with lemon vinaigrette.', price: 16 },
            { id: 'salads-i1', name: 'Cobb', description: 'Spring mix, chopped bacon, tomatoes, hard boiled egg, bleu cheese crumbles, avocado with housemade ranch dressing.', price: 18 },
            { id: 'salads-i2', name: 'Antipasto', description: 'Spring mix, ham, capicola, mortadella, salami, provolone, cherry peppers, tomato, parmesan with Italian vinaigrette.', price: 19 },
            { id: 'salads-i3', name: 'Caesar', description: 'Romaine lettuce, croutons, parmesan with creamy caesar dressing.', price: 16 },
          ],
        },

        // ─── KIDS ───
        {
          id: 'kids',
          name: 'Kids',
          displayMode: 'variants',
          choices: [
            { label: 'Choice of Side', options: ['Fries', 'Fruit'] },
          ],
          items: [
            { id: 'kids-i0', name: 'Chicken Tenders', price: 13 },
            { id: 'kids-i1', name: 'Cheeseburger', price: 11 },
            { id: 'kids-i2', name: 'Grilled Cheese', price: 11 },
            { id: 'kids-i3', name: 'Corn Dog', price: 11 },
            { id: 'kids-i4', name: 'Mac & Cheese', price: 11 },
            { id: 'kids-i5', name: 'Hot Dog', price: 11 },
          ],
        },

        // ─── SWEETS ───
        {
          id: 'sweets',
          name: 'Sweets',
          items: [
            { id: 'sweets-i0', name: 'Homemade Key Lime Pie', description: 'Sales help support the non-profit organization Shelter to Soldier.', price: 14 },
            { id: 'sweets-i1', name: 'Homemade Vanilla Cheesecake', description: 'Sales help support the non-profit organization Shelter to Soldier.', price: 14 },
            { id: 'sweets-i2', name: 'Churros with Vanilla Ice Cream', price: 12 },
            { id: 'sweets-i3', name: 'Ice Cream Cookie Sandwich', price: 6 },
          ],
        },

        // ─── BREAKFAST ───
        {
          id: 'breakfast',
          name: 'Breakfast',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'breakfast-handhelds',
              name: 'Handhelds',
              displayMode: 'variants',
              basePrice: 14,
              description: 'Served with an egg any style, melted cheddar cheese.',
              choices: [
                { label: 'Your Choice of Bagel', options: ['Jalapeno', 'Everything', 'Plain'] },
                { label: 'Topped with Your Choice', options: ['Tomato Avocado', 'Oven Baked Ham', 'Bacon', 'Sausage', 'Pastrami'] },
              ],
              items: [
                { id: 'breakfast-handhelds-i0', name: 'Bagel Melt', description: 'Served with an egg any style, melted cheddar cheese.', price: 14 },
              ],
            },
            {
              id: 'breakfast-sd-burrito',
              name: 'SD Burrito',
              displayMode: 'variants',
              choices: [
                { label: 'Note', options: ['Wrapped with scrambled eggs, guacamole, pico de gallo, fries, and shredded jack/cheddar cheese'] },
              ],
              items: [
                { id: 'breakfast-sd-burrito-i0', name: 'Sausage', price: 15 },
                { id: 'breakfast-sd-burrito-i1', name: 'Bacon', price: 15 },
                { id: 'breakfast-sd-burrito-i2', name: 'Chicken', price: 16 },
                { id: 'breakfast-sd-burrito-i3', name: 'Carnitas', price: 17 },
                { id: 'breakfast-sd-burrito-i4', name: 'Carne Asada', price: 18 },
                { id: 'breakfast-sd-burrito-i5', name: 'Pastrami', price: 18 },
              ],
            },
            {
              id: 'breakfast-omelettes',
              name: 'Omelettes',
              displayMode: 'variants',
              items: [
                { id: 'breakfast-omelettes-i0', name: 'Denver', description: 'Ham, bell pepper, grilled onions, cheddar/jack cheese.', price: 17 },
                { id: 'breakfast-omelettes-i1', name: 'Boulder', description: 'Ribeye steak, mushrooms, grilled onions, American cheese, topped with sausage gravy.', price: 19 },
                { id: 'breakfast-omelettes-i2', name: 'Hamtown', description: 'Ham and cheddar/jack cheese.', price: 17 },
                { id: 'breakfast-omelettes-i3', name: 'Veggieville', description: 'Bell peppers, onions, mushrooms, tomato, avocado, white American cheese.', price: 17 },
              ],
            },
            {
              id: 'breakfast-plates',
              name: 'Plates',
              displayMode: 'variants',
              choices: [
                { label: 'Note', options: ['Available Friday–Sunday 9am–1pm · All breakfast entrees served with a side of hashbrowns & fruit'] },
              ],
              items: [
                { id: 'breakfast-plates-i0', name: 'American Hero Breakfast', description: 'Bacon, sausage patty, or ham, 2 eggs any style, hashbrowns, choice of: biscuit, white, wheat, or rye toast.', price: 12 },
                { id: 'breakfast-plates-i1', name: 'Fallbrook', description: 'Avocado toast served with 2 poached eggs, tomato, and sprouts on white, wheat, or rye toast.', price: 16 },
                { id: 'breakfast-plates-i2', name: 'Toasty Toast', description: 'French toast topped with syrup & powdered sugar.', price: 14 },
              ],
            },
            {
              id: 'breakfast-sides',
              name: 'Sides',
              displayMode: 'variants',
              items: [
                { id: 'breakfast-sides-i0', name: 'Fruit', price: 2 },
                { id: 'breakfast-sides-i1', name: 'Toast', price: 3 },
                { id: 'breakfast-sides-i2', name: 'Biscuit', price: 4 },
                { id: 'breakfast-sides-i3', name: 'Hash Browns', price: 5 },
                { id: 'breakfast-sides-i4', name: 'Biscuits & Gravy', price: 7 },
                { id: 'breakfast-sides-i5', name: 'Ham', price: 3 },
                { id: 'breakfast-sides-i6', name: 'Sausage', price: 5 },
                { id: 'breakfast-sides-i7', name: 'Bacon', price: 5 },
                { id: 'breakfast-sides-i8', name: 'Pastrami', price: 6 },
              ],
            },
            {
              id: 'breakfast-drinks',
              name: 'Drinks',
              displayMode: 'variants',
              items: [
                { id: 'breakfast-drinks-i0', name: 'Coffee', price: 4 },
                { id: 'breakfast-drinks-i1', name: 'Hot/Iced Tea', price: 3.5 },
                { id: 'breakfast-drinks-i2', name: 'Milk', price: 2.5 },
                { id: 'breakfast-drinks-i3', name: 'Lemonade', price: 3.5 },
                { id: 'breakfast-drinks-i4', name: 'Soda', description: 'Pepsi, Diet Pepsi, Dr. Pepper, Starry, Root Beer, Gingerale.', price: 3.5 },
                { id: 'breakfast-drinks-i5', name: 'Juice', description: 'Short 4 / Tall 7. Orange, Pineapple, Apple, Cranberry, Grapefruit.', price: 4 },
                { id: 'breakfast-drinks-i6', name: 'Mimosa', price: 10 },
                { id: 'breakfast-drinks-i7', name: 'Michelada', price: 10 },
                { id: 'breakfast-drinks-i8', name: 'Irish Coffee', price: 12 },
                { id: 'breakfast-drinks-i9', name: 'Bloody Mary', price: 13 },
                { id: 'breakfast-drinks-i10', name: 'Espresso Martini', price: 14 },
              ],
            },
          ],
        },

        // ─── DRINKS ───
        {
          id: 'drinks',
          name: 'Drinks',
          displayMode: 'starters',
          items: [],
          addOnLabel: 'Hero Up',
          addOns: [
            { name: 'Add a well shot', price: '+3' },
          ],
          subGroups: [
            {
              id: 'drinks-bottles-cans',
              name: 'Bottles & Cans',
              displayMode: 'variants',
              items: [
                { id: 'drinks-bottles-cans-i0', name: 'Modelo', price: 6 },
                { id: 'drinks-bottles-cans-i1', name: 'Michelob Ultra', price: 7 },
                { id: 'drinks-bottles-cans-i2', name: 'Miller Lite', price: 7 },
                { id: 'drinks-bottles-cans-i3', name: 'Coors Banquet', price: 7 },
                { id: 'drinks-bottles-cans-i4', name: 'Guinness', price: 9 },
                { id: 'drinks-bottles-cans-i5', name: 'High Noon', price: 7 },
                { id: 'drinks-bottles-cans-i6', name: 'Sun Cruiser Tea', price: 8 },
                { id: 'drinks-bottles-cans-i7', name: 'Nutrl Watermelon', price: 8 },
                { id: 'drinks-bottles-cans-i8', name: 'White Claw', description: 'Black Cherry · Mango', price: 7 },
                { id: 'drinks-bottles-cans-i9', name: 'Corona N/A', price: 7 },
                { id: 'drinks-bottles-cans-i10', name: 'Athletic Lite N/A', price: 7 },
              ],
            },
            {
              id: 'drinks-draft',
              name: 'Draft',
              displayMode: 'variants',
              items: [
                { id: 'drinks-draft-i0', name: 'Coors Light Light Lager', description: '4.2% ABV · Coors Brewing · Pitcher 30', price: 8 },
                { id: 'drinks-draft-i1', name: '394 Pale Ale', description: '6.0% ABV · AleSmith · Pitcher 30', price: 9 },
                { id: 'drinks-draft-i2', name: 'Fiesta Island Pilsner', description: '5.3% ABV · Bay City Brewing · Pitcher 30', price: 9 },
                { id: 'drinks-draft-i3', name: 'Pacifico Mexican Lager', description: '4.4% ABV · Anheuser-Busch · Pitcher 32', price: 9 },
                { id: 'drinks-draft-i4', name: 'IPA American Heroes', description: '7.2% ABV · Coronado Brewing · Pitcher 32', price: 9 },
                { id: 'drinks-draft-i5', name: 'Pupil West Coast IPA', description: '7.5% ABV · Societe Brewing · Pitcher 36', price: 10 },
                { id: 'drinks-draft-i6', name: 'Space Dust American IPA', description: '8.2% ABV · Elysian Brewing · Pitcher 36', price: 10 },
                { id: 'drinks-draft-i7', name: 'Blonde American Heroes', description: '4.5% ABV · Bay City Brewing · Pitcher 30', price: 8 },
                { id: 'drinks-draft-i8', name: 'Amber American Heroes', description: '5.6% ABV · Golden Road Brewing · Pitcher 30', price: 8 },
                { id: 'drinks-draft-i9', name: 'Cali Squeeze Citrus Wheat Ale', description: '5% ABV · Firestone Walker · Pitcher 36', price: 10 },
              ],
            },
            {
              id: 'drinks-cocktails',
              name: 'Cocktails',
              displayMode: 'variants',
              items: [
                { id: 'drinks-cocktails-i0', name: 'Cadillac Margarita', description: 'Casa Azul Blanco Tequila, Agave, Grand Marnier, Lime, served with a Salt Rim.', price: 16 },
                { id: 'drinks-cocktails-i1', name: 'The Village Iced Tea', description: 'Vodka, Gin, Rum, Tequila, Triple Sec, Sour Mix, Cranberry Juice, Lemon.', price: 14 },
                { id: 'drinks-cocktails-i2', name: 'Bressi Espressi Martini', description: 'Espresso Vodka, Kahlua, Vanilla Syrup, Espresso.', price: 14 },
                { id: 'drinks-cocktails-i3', name: 'Coastal Coconut Marg', description: 'Casa Azul Blanco Tequila, Coconut, Lime Juice.', price: 15 },
                { id: 'drinks-cocktails-i4', name: 'Heroes Old Fashioned', description: 'Bulleit Bourbon, Orange, Cherry, Bitters.', price: 14 },
                { id: 'drinks-cocktails-i5', name: 'Tamarack Twist Mule', description: "Weber's Ranch Vodka, Ginger Beer, Lime, Bitters.", price: 12 },
                { id: 'drinks-cocktails-i6', name: '101 Rum Runner', description: 'Captain Morgan Rum, Coconut Rum, Banana Liqueur, Blackberry Brandy, Pineapple & Orange Juice, Grenadine.', price: 13 },
                { id: 'drinks-cocktails-i7', name: "Sam's Spicy Bloody Mary", description: "Absolut Peppar Vodka & Sam's Bloody Mix, served with a Tajin Rim.", price: 13 },
              ],
            },
            {
              id: 'drinks-red-wine',
              name: 'Red Wine',
              displayMode: 'variants',
              items: [
                { id: 'drinks-red-wine-i0', name: 'Sea Sun Pinot Noir', description: 'Monterey, California · Bottle 52', price: 15 },
                { id: 'drinks-red-wine-i1', name: 'Bogle Merlot', description: 'Clarksburg, California · Bottle 36', price: 11 },
                { id: 'drinks-red-wine-i2', name: 'Fableist Red Blend', description: 'Paso Robles, California · Bottle 48', price: 14 },
                { id: 'drinks-red-wine-i3', name: 'Serial Cabernet Sauvignon', description: 'Paso Robles, California · Bottle 40', price: 12 },
                { id: 'drinks-red-wine-i4', name: 'Bonanza Cabernet Sauvignon', description: 'Napa Valley, California · Bottle 56', price: 16 },
                { id: 'drinks-red-wine-i5', name: 'Pasmosa Sangria', description: 'Temecula, California · Bottle 40', price: 12 },
              ],
            },
            {
              id: 'drinks-white-wine-ros',
              name: 'White Wine & Rosé',
              displayMode: 'variants',
              items: [
                { id: 'drinks-white-wine-ros-i0', name: 'Studio by Miraval Rosé', description: 'Provence, France · Bottle 52', price: 15 },
                { id: 'drinks-white-wine-ros-i1', name: 'Dryland Sauvignon Blanc', description: 'Marlborough, New Zealand · Bottle 36', price: 11 },
                { id: 'drinks-white-wine-ros-i2', name: 'Josh Buttery Chardonnay', description: 'Central Coast, California · Bottle 40', price: 12 },
                { id: 'drinks-white-wine-ros-i3', name: 'Wente Chardonnay', description: 'Central Coast, California · Bottle 40', price: 12 },
                { id: 'drinks-white-wine-ros-i4', name: 'Santa Cristina Pinot Grigio', description: 'Delle Venezie, Italy · Bottle 36', price: 11 },
                { id: 'drinks-white-wine-ros-i5', name: 'House Sparkling Brut', description: 'Bottle 32', price: 10 },
              ],
            },
          ],
        },

        // ─── SPECIALS ───
        {
          id: 'specials',
          name: 'Specials',
          items: [
            { id: 'specials-i0', name: 'Mahalo Monday', description: 'Kalua Pork Sliders $4ea · Modelo, Ultra, Coors & Miller Lite $3ea.', price: 4 },
            { id: 'specials-i1', name: 'Taco Tuesday', description: 'Village Tacos $4ea · All Tequila Cocktails $2 off · Industry Drafts or Wells $5ea (all day).', price: 4 },
            { id: 'specials-i2', name: 'Wings & Wells Wednesday', description: 'Wings $6 off · Well Cocktails $6ea.', price: 6 },
            { id: 'specials-i3', name: 'Burgers & Beer Thursday', description: 'All Burgers $5 off · House Drafts (Blonde, IPA, Amber, Lager) $5ea.', price: 5 },
            { id: 'specials-i4', name: 'Friday Funday 1–4pm', description: 'Drinks & Munchies $2 off.', price: 2 },
            { id: 'specials-i5', name: 'Padre Games Hot Dogs & Beer', description: 'Friar Franks $6 · Heroes Drafts $2 off.', price: 6 },
          ],
        },
      ],
    },
  ];
}

export function getRestaurantInfo(): Restaurant {
  return {
    name: 'American Heroes & Brew',
    address1: '300 Carlsbad Village Drive',
    address2: 'Suite 120',
    city: 'Carlsbad',
    stateCode: 'CA',
    zipCode: '92008',
    phone: '(760) 994-0187',
    latitude: 33.1592675,
    longitude: -117.3502525,
    hours: [
      { dayOfWeek: 'Monday', open: '10:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Tuesday', open: '10:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Wednesday', open: '10:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Thursday', open: '10:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Friday', open: '10:00 AM', close: '12:00 AM' },
      { dayOfWeek: 'Saturday', open: '8:00 AM', close: '12:00 AM' },
      { dayOfWeek: 'Sunday', open: '8:00 AM', close: '10:00 PM' },
    ],
  };
}
