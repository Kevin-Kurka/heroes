import { Menu, Restaurant } from '@/types';

// Static menu. Food tabs match the current printed Carlsbad Village menu
// (starters through sides). Drinks and Kids are unchanged from the prior site.
// Prices stay in data; SHOW_PRICES hides them on the public site.
// This file is the only menu source. /menu does not read a Google Sheet.

/** Printed-menu footer: sales tax, card surcharge, and large-party gratuity. */
export const MENU_FOOTNOTE =
  'All items are subject to 7.75% sales tax and 3.95% surcharge. 20% gratuity added to parties of 8 or more.';

export function getMenus(): Menu[] {
  return [
    {
      id: 'menu-1',
      name: 'Main Menu',
      groups: [
        // ─── DRINKS (one tab; sections inside) ───
        {
          id: 'drinks',
          name: 'Drinks',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'drinks-signature-drinks',
              name: 'Signature Drinks',
              displayMode: 'variants',
              items: [
                { id: 'drinks-signature-drinks-i0', name: '101 Rum Runner', description: 'Captain Morgan Rum, coconut rum, banana liqueur, blackberry brandy, pineapple and orange juice, grenadine.', price: 13 },
                { id: 'drinks-signature-drinks-i1', name: 'Bressi Espressi Martini', description: 'Espresso vodka, Kahlua, vanilla syrup, espresso.', price: 14 },
                { id: 'drinks-signature-drinks-i2', name: 'Cadillac Margarita', description: 'Casa Azul Blanco Tequila, agave, Grand Marnier, lime, salt rim.', price: 16 },
                { id: 'drinks-signature-drinks-i3', name: 'Coastal Coconut Marg', description: 'Casa Azul Blanco Tequila, coconut, lime juice.', price: 15 },
                { id: 'drinks-signature-drinks-i4', name: 'Heroes Old Fashioned', description: 'Bulleit Bourbon, orange, cherry, bitters.', price: 14 },
                { id: 'drinks-signature-drinks-i5', name: 'Sam\'s Spicy Bloody Mary', description: 'Absolut Pepper Vodka and Sam\'s Bloody Mix with a Tajin rim.', price: 13 },
                { id: 'drinks-signature-drinks-i6', name: 'Tamarack Twist Mule', description: 'Weber\'s Ranch Vodka, ginger beer, lime, bitters.', price: 12 },
                { id: 'drinks-signature-drinks-i7', name: 'Village Iced Tea', description: 'Vodka, gin, rum, tequila, triple sec, sour mix, cranberry juice, lemon.', price: 14 },
              ],
            },
            {
              id: 'drinks-taps-pint-pitcher',
              name: 'Taps (pint / pitcher)',
              displayMode: 'variants',
              items: [
                { id: 'drinks-taps-pint-pitcher-i0', name: '394 Pale Ale', description: '6.0% ABV, AleSmith', price: 10, priceLabel: '10 / 32' },
                { id: 'drinks-taps-pint-pitcher-i1', name: 'AHB Amber', description: '5.6% ABV, Golden Road Brewing', price: 8, priceLabel: '8 / 30' },
                { id: 'drinks-taps-pint-pitcher-i2', name: 'AHB Blonde', description: '4.5% ABV, Bay City Brewing', price: 8, priceLabel: '8 / 30' },
                { id: 'drinks-taps-pint-pitcher-i3', name: 'AHB IPA', description: '7.2% ABV, Coronado Brewing', price: 9, priceLabel: '9 / 31' },
                { id: 'drinks-taps-pint-pitcher-i4', name: 'Cali Squeeze', description: '5% ABV, Firestone Walker', price: 10, priceLabel: '10 / 32' },
                { id: 'drinks-taps-pint-pitcher-i5', name: 'Coors Light', description: '4.2% ABV, Coors Brewing', price: 8, priceLabel: '8 / 30' },
                { id: 'drinks-taps-pint-pitcher-i6', name: 'Pacifico', description: '4.4% ABV, Anheuser-Busch', price: 9, priceLabel: '9 / 31' },
                { id: 'drinks-taps-pint-pitcher-i7', name: 'Pupil West Coast IPA', description: '7.5% ABV, Societe Brewing', price: 10, priceLabel: '10 / 32' },
              ],
            },
            {
              id: 'drinks-bottles-and-cans',
              name: 'Bottles & Cans',
              displayMode: 'variants',
              items: [
                { id: 'drinks-bottles-and-cans-i0', name: 'Athletic Lite', description: 'Non-alcoholic light beer, crisp, clean and easy-drinking.', price: 7 },
                { id: 'drinks-bottles-and-cans-i1', name: 'Coors Banquet', description: 'A well-balanced golden lager brewed in Golden, Colorado.', price: 7 },
                { id: 'drinks-bottles-and-cans-i2', name: 'Guinness', description: 'The iconic Irish stout, rich, creamy and smooth.', price: 9 },
                { id: 'drinks-bottles-and-cans-i3', name: 'High Noon', description: 'Hard seltzer made with real vodka, real juice and sparkling water.', price: 7 },
                { id: 'drinks-bottles-and-cans-i4', name: 'Michelob Ultra', description: 'A superior light beer with a crisp, clean taste.', price: 7 },
                { id: 'drinks-bottles-and-cans-i5', name: 'Miller Lite', description: 'The original light beer, a true American pilsner.', price: 7 },
                { id: 'drinks-bottles-and-cans-i6', name: 'Modelo', description: 'A rich, full-flavored pilsner-style Mexican lager with a crisp, well-balanced finish.', price: 6 },
                { id: 'drinks-bottles-and-cans-i7', name: 'Nütrl Watermelon', description: 'Vodka seltzer with real watermelon juice.', price: 8 },
                { id: 'drinks-bottles-and-cans-i8', name: 'Sun Cruiser Tea', description: 'Hard iced tea made with real brewed tea and vodka.', price: 8 },
                { id: 'drinks-bottles-and-cans-i9', name: 'White Claw', description: 'Crisp hard seltzer, Black Cherry or Mango.', price: 7 },
              ],
            },
            {
              id: 'drinks-wine-glass-bottle',
              name: 'Wine (glass / bottle)',
              displayMode: 'variants',
              items: [
                { id: 'drinks-wine-glass-bottle-i0', name: 'Bonanza Cabernet Sauvignon', description: 'Napa Valley, California', price: 16, priceLabel: '16 / 56' },
                { id: 'drinks-wine-glass-bottle-i1', name: 'Dryland Sauvignon Blanc', description: 'Marlborough, New Zealand', price: 11, priceLabel: '11 / 36' },
                { id: 'drinks-wine-glass-bottle-i2', name: 'House Sparkling Brut', description: 'House sparkling', price: 10, priceLabel: '10 / 32' },
                { id: 'drinks-wine-glass-bottle-i3', name: 'Josh Buttery Chardonnay', description: 'Central Coast, California', price: 13, priceLabel: '13 / 40' },
                { id: 'drinks-wine-glass-bottle-i4', name: 'Santa Cristina Pinot Grigio', description: 'Delle Venezie, Italy', price: 11, priceLabel: '11 / 36' },
                { id: 'drinks-wine-glass-bottle-i5', name: 'Sea Sun Pinot Noir', description: 'Monterey, California', price: 15, priceLabel: '15 / 52' },
                { id: 'drinks-wine-glass-bottle-i6', name: 'Serial Cabernet Sauvignon', description: 'Paso Robles, California', price: 12, priceLabel: '12 / 40' },
                { id: 'drinks-wine-glass-bottle-i7', name: 'Wente Chardonnay', description: 'Central Coast, California', price: 12, priceLabel: '12 / 40' },
              ],
            },
            {
              id: 'drinks-soft-drinks',
              name: 'Soft Drinks',
              displayMode: 'variants',
              items: [
                { id: 'drinks-soft-drinks-i0', name: 'Sodas', description: 'Pepsi, Diet Pepsi, Root Beer, Dr. Pepper, Lemonade, Starry.', price: 4 },
              ],
            },
          ],
        },
        {
          id: 'food-starters',
          name: 'Starters',
          displayMode: 'variants',
          items: [
            { id: 'food-starters-i0', name: 'Crispy Cauliflower', description: 'Crispy battered cauliflower florets served with sriracha honey dipping sauce.', price: 12 },
            { id: 'food-starters-i1', name: 'Mozzarella Sticks', description: 'Golden, gooey mozzarella sticks, fried until crisp.', price: 12 },
            { id: 'food-starters-i2', name: 'Fried Pickles', description: 'Crispy fried pickle chips with cool chipotle ranch.', price: 12 },
            { id: 'food-starters-i3', name: 'Germantown Pretzel', description: 'Warm soft Bavarian pretzel with cheese whiz and Dijon.', price: 14 },
            { id: 'food-starters-i4', name: 'Spinach Artichoke Dip', description: 'Creamy spinach artichoke dip, served in a fresh sourdough bread boule.', price: 16 },
            { id: 'food-starters-i5', name: 'Sheboygan Scorchers', description: 'Pickled jalapeños stuffed with ranch cream cheese and wrapped in bacon, drizzled with balsamic glaze.', price: 16 },
            { id: 'food-starters-i6', name: 'Sliders', description: 'Three juicy sliders on King\'s Hawaiian rolls. Choice of kalua pork, chicken or cheeseburger.', price: 18 },
          ],
        },
        {
          id: 'food-burgers',
          name: 'Burgers',
          displayMode: 'variants',
          items: [
            { id: 'food-burgers-i0', name: 'Pasadena', description: 'The "OG" cheeseburger with lettuce, tomato, pickle, red onion, Hero sauce, white American cheese on a soft gourmet bun.', price: 18 },
            { id: 'food-burgers-i1', name: 'Leucadia', description: 'Smash burger with grilled onion, white American cheese, pickles, Hero sauce on a soft gourmet bun.', price: 18 },
            { id: 'food-burgers-i2', name: 'Austin', description: 'Pepper jack, whiz, jalapeños, grilled onions, Hero sauce, on a brioche bun with a jalapeño popper topper.', price: 19 },
            { id: 'food-burgers-i3', name: 'Tombstone', description: 'For the cowboy, two all beef patties with bacon, grilled onion, cheddar, BBQ sauce, topped with onion rings on a brioche bun.', price: 22 },
            { id: 'food-burgers-i4', name: 'Minneapolis', description: 'The Juicy Lucy, double stuffed cheese patties, cheese skirt, grilled onions, Hero sauce on a soft gourmet bun.', price: 22 },
          ],
        },
        {
          id: 'food-wings',
          name: 'Wings',
          displayMode: 'variants',
          description: 'Jumbo wings tossed in your sauce, with crisp carrots, celery, and house made ranch.',
          basePrice: 18,
          choices: [
            {
              label: 'Sauce',
              options: [
                'Classic Buffalo',
                'Sriracha Honey',
                'Balsamic Glazed',
                'Kickn\' BBQ',
                'Garlic Parmesan',
                'Old Bay Dry Rub',
                'Mango Habanero',
                'Lemon Pepper',
                'Plain',
              ],
            },
          ],
          addOns: [
            { name: 'Swap for tenders', price: '+3' },
          ],
          items: [
            { id: 'food-wings-i0', name: 'Wings', description: 'Jumbo wings tossed in your sauce, with crisp carrots, celery, and house made ranch.', price: 18 },
          ],
        },
        {
          id: 'food-heroes',
          name: 'Heroes',
          displayMode: 'variants',
          items: [
            { id: 'food-heroes-i0', name: 'Philly Cheesesteak', description: 'Thin-sliced ribeye on a toasted Amoroso roll, with white American, provolone, or whiz. Add sautéed mushrooms +1, sautéed peppers +1, or red pepper relish +1.', price: 22 },
            { id: 'food-heroes-i1', name: 'Pacific Beach', description: 'Three fish tacos. Cabbage, pico, cilantro-lime crema. Served with house made salsa and chips and guacamole.', price: 20 },
            { id: 'food-heroes-i2', name: 'Hoboken', description: 'Italian Sub. Capicola, salami, ham, mortadella, provolone, lettuce, tomato, onion, oregano, oil & vinegar on a hoagie roll.', price: 22 },
            { id: 'food-heroes-i3', name: 'Carlsbad', description: 'BLT+ Grilled chicken, bacon, avocado, lettuce, tomato, garlic aioli, on an hoagie roll.', price: 20 },
            { id: 'food-heroes-i4', name: 'San Diego', description: 'California Burrito. Carne asada, guacamole, fries, pico, shredded cheese, sour cream, in a flour tortilla.', price: 20 },
            { id: 'food-heroes-i5', name: 'Los Angeles', description: 'French dip. Roast beef, provolone, horseradish aioli, au jus, on an hoagie roll.', price: 22 },
            { id: 'food-heroes-i6', name: 'Manhattan', description: 'Reuben. Pastrami, Russian dressing, sauerkraut, Swiss on NY corn rye.', price: 24 },
            { id: 'food-heroes-i7', name: 'Nashville', description: 'Southern fried chicken with bacon, jalapeños, pepper jack and Swiss cheeses, lettuce, tomato, onion, pickles and sriracha honey mustard on a brioche bun.', price: 24 },
          ],
        },
        {
          id: 'food-load-em-up',
          name: 'Load \'Em Up',
          displayMode: 'variants',
          description: 'Fries, chips or tots.',
          choices: [
            { label: 'Choice of', options: ['Fries', 'Chips', 'Tots'] },
          ],
          items: [
            { id: 'food-load-em-up-i0', name: 'Garlic Parm', description: 'Tossed in garlic and shredded parm.', price: 16 },
            { id: 'food-load-em-up-i1', name: 'Chili Cheese', description: 'Smothered in chili, whiz, onions, and sour cream.', price: 18 },
            { id: 'food-load-em-up-i2', name: 'Cowboy', description: 'Pulled pork, shredded cheese, whiz, jalapeños, grilled onions, BBQ sauce.', price: 18 },
            { id: 'food-load-em-up-i3', name: 'Buffalo Chicken', description: 'Chicken tenders, pepper jack, buffalo sauce, and cool chipotle ranch.', price: 20 },
            { id: 'food-load-em-up-i4', name: 'Steakhouse', description: 'Tender seasoned ribeye, pepper jack, bacon, Hero sauce, sour cream, chives.', price: 24 },
          ],
        },
        {
          id: 'food-soup-salad',
          name: 'Soup & Salad',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'food-salads',
              name: 'Salads',
              displayMode: 'variants',
              addOns: [
                { name: 'Make it a wrap', price: '$2' },
                { name: 'Add chicken', price: '$6' },
              ],
              items: [
                { id: 'food-salads-i0', name: 'Healthy Hero', description: 'Crisp mixed greens with cucumber, tomato, sprouts, red onion, croutons, and lemon vinaigrette.', price: 18 },
                { id: 'food-salads-i1', name: 'Caesar', description: 'Crisp romaine, croutons, and parmesan in creamy caesar.', price: 18 },
                { id: 'food-salads-i2', name: 'Cobb', description: 'Mixed greens loaded with bacon, egg, avocado, tomato, red onion, blue cheese, and ranch.', price: 22 },
              ],
            },
            {
              id: 'food-soup',
              name: 'Soup of the Day',
              displayMode: 'variants',
              description: 'Seasonal soups, chilis and stews. Ask your server for today\'s selection. Cup, bowl, or bread boule.',
              basePriceLabel: 'Cup 8 / Bowl 14 / Bread Boule 16',
              items: [
                { id: 'food-soup-i0', name: 'Soup of the Day', description: 'Seasonal soups, chilis and stews. Ask your server for today\'s selection. Cup, bowl, or bread boule.', price: 8, priceLabel: 'Cup 8 / Bowl 14 / Bread Boule 16' },
              ],
            },
          ],
        },
        {
          id: 'food-hot-dogs',
          name: 'Hot Dogs',
          displayMode: 'variants',
          items: [
            { id: 'food-hot-dogs-i0', name: 'Friar Frank', description: 'Grilled onions, red pepper relish, ketchup and mustard.', price: 8 },
            { id: 'food-hot-dogs-i1', name: 'Emerald City', description: 'Cream cheese, red pepper relish, grilled onions, jalapeños, sriracha.', price: 8 },
            { id: 'food-hot-dogs-i2', name: 'Chili Cheese', description: 'Chili, cheese whiz, onions and mustard.', price: 9 },
          ],
        },
        {
          id: 'food-sides',
          name: 'Sides',
          displayMode: 'variants',
          items: [
            { id: 'food-sides-i0', name: 'Potato Salad', price: 5 },
            { id: 'food-sides-i1', name: 'Chips & Salsa', price: 6 },
            { id: 'food-sides-i2', name: 'Side Salad', price: 10 },
            { id: 'food-sides-i3', name: 'Fries', price: 6, priceLabel: '6 / 11' },
            { id: 'food-sides-i4', name: 'Tater Tots', price: 6, priceLabel: '6 / 11' },
            { id: 'food-sides-i5', name: 'Onion Rings', price: 7, priceLabel: '7 / 12' },
          ],
        },
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
      { dayOfWeek: 'Monday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Tuesday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Wednesday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Thursday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Friday', open: '11:00 AM', close: '12:00 AM' },
      { dayOfWeek: 'Saturday', open: '9:00 AM', close: '12:00 AM' },
      { dayOfWeek: 'Sunday', open: '9:00 AM', close: '10:00 PM' },
    ],
  };
}

