import { Menu, Restaurant } from '@/types';

export function getMenus(): Menu[] {
  return [
    {
      id: 'menu-1',
      name: 'Main Menu',
      groups: [
        // ─── STARTERS ───
        {
          id: 'g-starters',
          name: 'Starters',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'g-sliders',
              name: 'Sliders',
              description: '3 juicy sliders on sweet Hawaiian rolls.',
              displayMode: 'variants',
              basePrice: 18,
              choices: [
                { label: 'Select', options: ['Kalua Pork', 'Cheeseburger', 'Spicy Chicken'] },
              ],
              items: [
                { id: 'sl1', name: 'Sliders', price: 18 },
              ],
            },
            {
              id: 'g-nachos',
              name: 'Nachos',
              description: 'Chips, cheddar, jack and nacho cheeses with beans, sour cream, jalapenos, guacamole and cilantro.',
              displayMode: 'variants',
              basePrice: 15,
              addOnLabel: 'Add',
              addOns: [
                { name: 'Carnitas', price: '+3' },
                { name: 'Carne Asada', price: '+5' },
              ],
              items: [
                { id: 'n1', name: 'Nachos', price: 15 },
              ],
            },
            {
              id: 'g-wings',
              name: 'Signature Wings',
              description: '8 wings, celery, carrots. Ranch or blue cheese.',
              displayMode: 'variants',
              basePrice: 18,
              addOnLabel: 'Mods',
              addOns: [{ name: 'Boneless', price: '+3' }],
              items: [
                { id: 'w1', name: 'Classic Buffalo', price: 18 },
                { id: 'w2', name: 'Mango Habanero', price: 18 },
                { id: 'w3', name: "Kickn' BBQ", price: 18 },
                { id: 'w4', name: 'Sriracha Honey', price: 18 },
                { id: 'w5', name: 'Old Bay (Dry Rub)', price: 18 },
                { id: 'w6', name: 'Lemon Pepper (Dry Rub)', price: 18 },
              ],
            },
            {
              id: 'g-fries',
              name: 'Loaded Fries',
              description: 'Pile of fries with your favorite toppings.',
              displayMode: 'variants',
              basePrice: 18,
              items: [
                { id: 'f1', name: 'Carne Asada', price: 18 },
                { id: 'f2', name: 'Buffalo Chicken', price: 18 },
                { id: 'f3', name: 'Garlic Parm', price: 18 },
                { id: 'f4', name: 'Chili Cheese', price: 18 },
                { id: 'f5', name: 'Cheesesteak', price: 18 },
                { id: 'f6', name: 'Bacon & Cheese', price: 18 },
              ],
            },
            {
              id: 'g-munchies',
              name: 'Munchies',
              description: 'Share with the table, or keep for yourself.',
              displayMode: 'variants',
              basePrice: 12,
              items: [
                { id: 'm1', name: 'Fried Pickles', price: 12 },
                { id: 'm2', name: 'Pretzel Bites', price: 12 },
                { id: 'm3', name: 'Hummus Plate', price: 12 },
                { id: 'm4', name: 'Mozzarella Sticks', price: 12 },
                { id: 'm5', name: 'Corn Dogs', price: 12 },
                { id: 'm6', name: 'Jalapeno Poppers', price: 12 },
              ],
            },
          ],
        },

        // ─── SALADS ───
        {
          id: 'g-salads',
          name: 'Salads',
          addOnLabel: 'Add',
          addOns: [
            { name: 'Avocado', price: '+3' },
            { name: 'Chicken', price: '+8' },
          ],
          items: [
            { id: 's1', name: 'Healthy Hero', description: 'Spring mix, sprouts, tomato, cucumber, red onion, croutons.', price: 17 },
            { id: 's2', name: 'Caesar', description: 'Romaine, croutons, parmesan, creamy caesar.', price: 17 },
            { id: 's3', name: 'Cobb', description: 'Romaine, tomato, red onion, egg, bacon, avocado, blue cheese crumble.', price: 20 },
            { id: 's4', name: 'Antipasto', description: 'Spring mix, tomato, cold cuts, provolone, parmesan, cherry peppers.', price: 20 },
          ],
        },

        // ─── BURGERS ───
        {
          id: 'g-burgers',
          name: 'Burgers',
          description: 'Best burgers in Carlsbad. Make it a double +4.',
          displayMode: 'variants',
          basePrice: 18,
          addOnLabel: 'Sides',
          addOns: [
            { name: 'Potato Salad', price: '5' },
            { name: 'Fries', price: '6' },
            { name: 'Rings', price: '7' },
            { name: 'Chili', price: '8' },
            { name: 'Mac & Cheese', price: '9' },
            { name: 'House Salad', price: '10' },
            { name: 'Frings', price: '12' },
          ],
          items: [
            { id: 'b1', name: 'Pasadena', subtitle: 'the "OG"', description: 'Lettuce, tomato, pickle, red onion, Hero sauce, cheese, on a brioche bun.', price: 18 },
            { id: 'b2', name: 'Austin', subtitle: 'Jalapeno', description: 'Pepper jack, wiz, jalapenos, grilled onions, Hero sauce, on a brioche bun with a jalapeno popper.', price: 18 },
            { id: 'b3', name: 'Minneapolis', subtitle: 'Juicy Lucy', description: 'Double stuffed cheese patties, cheese skirt, grilled onions, Hero sauce on a brioche bun.', price: 22 },
            { id: 'b4', name: 'Tombstone', subtitle: 'Cowboy', description: 'Bacon, grilled onion, cheddar, BBQ sauce, topped with onion rings on a brioche bun.', price: 18 },
            { id: 'b5', name: 'Irwindale', subtitle: 'Sriracha Honey', description: 'Fresh onions, slaw, pickles, Swiss cheese, garlic aioli, sriracha honey sauce on a brioche bun.', price: 18 },
            { id: 'b6', name: 'Leucadia', subtitle: 'Smash', description: 'Grilled onion, white American cheese, pickles, Hero sauce on a brioche bun.', price: 18 },
          ],
        },

        // ─── HEROES ───
        {
          id: 'g-heroes',
          name: 'Heroes',
          addOnLabel: 'Sides',
          addOns: [
            { name: 'Potato Salad', price: '5' },
            { name: 'Fries', price: '6' },
            { name: 'Rings', price: '7' },
            { name: 'Chili', price: '8' },
            { name: 'Mac & Cheese', price: '9' },
            { name: 'House Salad', price: '10' },
            { name: 'Frings', price: '12' },
          ],
          subGroups: [
            {
              id: 'g-philly',
              name: 'Philly',
              description: 'Award winning cheese steak, thin sliced ribeye with choice of cheese and toppings on an Amoroso roll. Get it "Billy Style" — double cheese, all the toppings.',
              displayMode: 'variants',
              basePrice: 22,
              choices: [
                { label: 'Cheese', options: ['Whiz', 'Provolone'] },
                { label: 'Toppings', options: ['Onions', 'Mushrooms', 'Red Pepper Relish'] },
              ],
              items: [
                { id: 'p1', name: 'Philly Cheesesteak', price: 22 },
              ],
            },
            {
              id: 'g-tacos',
              name: 'Village Tacos',
              description: 'Three tacos, topped with onion, cilantro, crema, queso fresco. Served with chips and salsa.',
              displayMode: 'variants',
              basePrice: 17,
              choices: [
                { label: 'Meat', options: ['Carnitas', 'Carne Asada', 'Fish'] },
                { label: 'Tortilla', options: ['Corn', 'Flour'] },
                { label: 'Salsa', options: ['Rojo', 'Verde'] },
              ],
              addOnLabel: 'Add',
              addOns: [
                { name: 'Guacamole', price: '+4' },
              ],
              items: [
                { id: 'vt1', name: 'Village Tacos', price: 17 },
              ],
            },
          ],
          items: [
            { id: 'h1', name: 'Carlsbad', subtitle: 'BLT+', description: 'Grilled chicken, bacon, avocado, lettuce, tomato, garlic aioli, on a long roll.', price: 19 },
            { id: 'h2', name: 'Manhattan', subtitle: 'Reuben', description: 'Pastrami, Russian dressing, sauerkraut, Swiss cheese on rye bread.', price: 22 },
            { id: 'h3', name: 'Maui', subtitle: 'Kalua Pork', description: 'Kalua pork, pineapple, slaw, aloha sauce on a brioche bun.', price: 18 },
            { id: 'h4', name: 'Los Angeles', subtitle: 'French Dip', description: 'Slow-cooked roast beef, Swiss cheese, horseradish aioli, with au jus, on an Italian roll.', price: 22 },
            { id: 'h5', name: 'Hoboken', subtitle: 'Italian', description: 'Capicola, salami, ham, mortadella, provolone, lettuce, tomato, onion, oregano, oil & vinegar, on an Italian roll.', price: 22 },
            { id: 'h6', name: 'San Diego', subtitle: 'California Burrito', description: 'Carne asada, guacamole, fries, pico de gallo, cheese, crema.', price: 20 },
          ],
        },

        // ─── SWEET STUFF ───
        {
          id: 'g-sweet',
          name: 'Sweet Stuff',
          subGroups: [
            {
              id: 'g-sundae',
              name: 'Caramel Brownie Sundae',
              description: 'Chocolate brownie, vanilla ice cream, topped with whipped cream, hot fudge and caramel.',
              displayMode: 'variants',
              basePrice: 12,
              items: [
                { id: 'ss7', name: 'Caramel Brownie Sundae', price: 12 },
              ],
            },
            {
              id: 'g-dessert-drinks',
              name: 'Dessert Drinks',
              displayMode: 'variants',
              items: [
                { id: 'dd1', name: 'Irish Coffee', description: 'Coffee, Whiskey, Baileys Irish Cream.', price: 12 },
                { id: 'dd2', name: 'Espresso Martini', description: 'Espresso Vodka, Kahlua, Vanilla Syrup, Espresso.', price: 14 },
              ],
            },
          ],
          items: [
            { id: 'ss1', name: 'Key Lime Pie', price: 14 },
            { id: 'ss2', name: 'Creamy Cheesecake', description: 'Proceeds donated to Shelter to Soldier. sheltertosoldier.org', price: 14 },
            { id: 'ss3', name: 'Churros', description: 'Cinnamon sugar churros, ice cream, topped with whipped cream, hot fudge and caramel.', price: 10 },
            { id: 'ss4', name: 'Ice Cream Sandwich', description: 'Two chocolate chip cookies with vanilla ice cream.', price: 6 },
            { id: 'ss5', name: 'Chocolate Chip Cookie', price: 3 },
            { id: 'ss6', name: 'Scoop of Ice Cream', price: 2 },
          ],
        },

        // ─── DRINKS ───
        {
          id: 'g-drinks',
          name: 'Drinks',
          displayMode: 'starters',
          items: [],
          addOnLabel: 'Hero Up',
          addOns: [
            { name: 'Add a well shot', price: '+3' },
          ],
          subGroups: [
            {
              id: 'g-bottles',
              name: 'Bottles & Cans',
              displayMode: 'variants',
              items: [
                { id: 'bc1', name: 'Modelo', price: 6 },
                { id: 'bc2', name: 'Michelob Ultra', price: 7 },
                { id: 'bc3', name: 'Miller Lite', price: 7 },
                { id: 'bc4', name: 'Coors Banquet', price: 7 },
                { id: 'bc5', name: 'Guinness', price: 9 },
                { id: 'bc6', name: 'High Noon', price: 7 },
                { id: 'bc7', name: 'Sun Cruiser Tea', price: 8 },
                { id: 'bc8', name: 'Nutrl Watermelon', price: 8 },
                { id: 'bc9', name: 'White Claw', description: 'Black Cherry · Mango', price: 7 },
                { id: 'bc10', name: 'Corona N/A', price: 7 },
                { id: 'bc11', name: 'Athletic Lite N/A', price: 7 },
              ],
            },
            {
              id: 'g-draft',
              name: 'Draft',
              description: 'Pint | Pitcher',
              displayMode: 'variants',
              items: [
                { id: 'd1', name: 'Coors Light', subtitle: 'Light Lager', description: '4.2% ABV · 10 IBU · Coors Brewing · Pitcher 30', price: 8 },
                { id: 'd2', name: '394', subtitle: 'Pale Ale', description: '6.0% ABV · 13 IBU · AleSmith · Pitcher 30', price: 9 },
                { id: 'd3', name: 'Fiesta Island', subtitle: 'Pilsner', description: '5.3% ABV · 16 IBU · Bay City Brewing · Pitcher 30', price: 9 },
                { id: 'd4', name: 'Pacifico', subtitle: 'Mexican Lager', description: '4.4% ABV · 18 IBU · Anheuser-Busch · Pitcher 32', price: 9 },
                { id: 'd5', name: 'IPA', subtitle: 'American Heroes', description: '7.2% ABV · 75 IBU · Coronado Brewing · Pitcher 32', price: 9 },
                { id: 'd6', name: 'Pupil', subtitle: 'West Coast IPA', description: '7.5% ABV · 50 IBU · Societe Brewing · Pitcher 36', price: 10 },
                { id: 'd7', name: 'Space Dust', subtitle: 'American IPA', description: '8.2% ABV · 62 IBU · Elysian Brewing · Pitcher 36', price: 10 },
                { id: 'd8', name: 'Blonde', subtitle: 'American Heroes', description: '4.5% ABV · 18 IBU · Bay City Brewing · Pitcher 30', price: 8 },
                { id: 'd9', name: 'Amber', subtitle: 'American Heroes', description: '5.6% ABV · 20 IBU · Golden Road Brewing · Pitcher 30', price: 8 },
                { id: 'd10', name: 'Cali Squeeze', subtitle: 'Citrus Wheat Ale', description: '5% ABV · 15 IBU · Firestone Walker · Pitcher 36', price: 10 },
              ],
            },
            {
              id: 'g-cocktails',
              name: 'Cocktails',
              displayMode: 'variants',
              items: [
                { id: 'c1', name: 'Cadillac Margarita', description: 'Casa Azul Blanco Tequila, Agave, Grand Marnier, Lime, served with a Salt Rim.', price: 16 },
                { id: 'c2', name: 'The Village Iced Tea', description: 'Vodka, Gin, Rum, Tequila, Triple Sec, Sour Mix, Cranberry Juice, Lemon.', price: 14 },
                { id: 'c3', name: 'Bressi Espressi Martini', description: 'Espresso Vodka, Kahlua, Vanilla Syrup, Espresso.', price: 14 },
                { id: 'c4', name: 'Coastal Coconut Marg', description: 'Casa Azul Blanco Tequila, Coconut, Lime Juice.', price: 15 },
                { id: 'c5', name: 'Heroes Old Fashioned', description: 'Bulleit Bourbon, Orange, Cherry, Bitters.', price: 14 },
                { id: 'c6', name: 'Tamarack Twist Mule', description: "Weber's Ranch Vodka, Ginger Beer, Lime, Bitters.", price: 12 },
                { id: 'c7', name: '101 Rum Runner', description: 'Captain Morgan Rum, Coconut Rum, Banana Liqueur, Blackberry Brandy, Pineapple & Orange Juice, Grenadine.', price: 13 },
                { id: 'c8', name: "Sam's Spicy Bloody Mary", description: "Absolut Peppar Vodka & Sam's Bloody Mix, served with a Tajin Rim.", price: 13 },
              ],
            },
            {
              id: 'g-reds',
              name: 'Red Wine',
              description: 'Glass | Bottle · Hero Up +7 for 9oz pour',
              displayMode: 'variants',
              items: [
                { id: 'rw1', name: 'Sea Sun', subtitle: 'Pinot Noir', description: 'Monterey, California · Bottle 52', price: 15 },
                { id: 'rw2', name: 'Bogle', subtitle: 'Merlot', description: 'Clarksburg, California · Bottle 36', price: 11 },
                { id: 'rw3', name: 'Fableist', subtitle: 'Red Blend', description: 'Paso Robles, California · Bottle 48', price: 14 },
                { id: 'rw4', name: 'Serial', subtitle: 'Cabernet Sauvignon', description: 'Paso Robles, California · Bottle 40', price: 12 },
                { id: 'rw5', name: 'Bonanza', subtitle: 'Cabernet Sauvignon', description: 'Napa Valley, California · Bottle 56', price: 16 },
                { id: 'rw6', name: 'Pasmosa', subtitle: 'Sangria', description: 'Temecula, California · Bottle 40', price: 12 },
              ],
            },
            {
              id: 'g-whites',
              name: 'White Wine & Rosé',
              description: 'Glass | Bottle · Hero Up +7 for 9oz pour',
              displayMode: 'variants',
              items: [
                { id: 'ww1', name: 'Studio by Miraval', subtitle: 'Rosé', description: 'Provence, France · Bottle 52', price: 15 },
                { id: 'ww2', name: 'Dryland', subtitle: 'Sauvignon Blanc', description: 'Marlborough, New Zealand · Bottle 36', price: 11 },
                { id: 'ww3', name: 'Josh Buttery', subtitle: 'Chardonnay', description: 'Central Coast, California · Bottle 40', price: 12 },
                { id: 'ww4', name: 'Wente', subtitle: 'Chardonnay', description: 'Central Coast, California · Bottle 40', price: 12 },
                { id: 'ww5', name: 'Santa Cristina', subtitle: 'Pinot Grigio', description: 'Delle Venezie, Italy · Bottle 36', price: 11 },
                { id: 'ww6', name: 'House Sparkling', subtitle: 'Brut', description: 'Bottle 32', price: 10 },
              ],
            },
            {
              id: 'g-soft',
              name: 'Soft Drinks',
              description: 'Pepsi · Diet Pepsi · Dr. Pepper · Starry · Root Beer · Ginger Ale · Orange · Pineapple · Apple · Cranberry · Grapefruit · Lemonade · Iced Tea',
              displayMode: 'variants',
              basePrice: 4,
              items: [
                { id: 'sd1', name: 'Soft Drinks', price: 4 },
              ],
            },
            {
              id: 'g-mimosas',
              name: 'Bottomless Mimosas',
              description: 'With purchase of entree · 1.5 hour limit · Please drink responsibly.',
              displayMode: 'variants',
              basePrice: 25,
              items: [
                { id: 'bm1', name: 'Bottomless Mimosas', price: 25 },
              ],
            },
          ],
        },

        // ─── BREAKFAST ───
        {
          id: 'g-breakfast',
          name: 'Breakfast',
          displayMode: 'starters',
          items: [],
          addOnLabel: 'Sides',
          addOns: [
            { name: 'Fruit', price: '2' },
            { name: 'Toast', price: '3' },
            { name: 'Ham', price: '3' },
            { name: 'Biscuit', price: '4' },
            { name: 'Sausage', price: '4' },
            { name: 'Hash Browns', price: '5' },
            { name: 'Bacon', price: '5' },
            { name: 'Pastrami', price: '6' },
            { name: 'Biscuits & Gravy', price: '7' },
          ],
          subGroups: [
            {
              id: 'br-omelets',
              name: 'Omelets',
              displayMode: 'variants',
              items: [
                { id: 'bo1', name: 'Denver', description: 'Ham, bell pepper, grilled onions with cheddar & jack cheese.', price: 17 },
                { id: 'bo2', name: 'Hamtown', description: 'Ham with cheddar & jack cheese.', price: 17 },
                { id: 'bo3', name: 'Boulder', description: 'Steak, mushrooms, onions, cheese topped with homemade sausage gravy.', price: 19 },
                { id: 'bo4', name: 'Veggieville', description: 'Bell peppers, onions, mushrooms, tomato, avocado with goat cheese.', price: 16 },
              ],
            },
            {
              id: 'br-bagels',
              name: 'Bagel Melts',
              description: 'State Street Bagels. Served with an egg and melted cheese.',
              displayMode: 'variants',
              basePrice: 14,
              choices: [
                { label: 'Bagel', options: ['Jalapeno', 'Everything', 'Plain'] },
              ],
              items: [
                { id: 'bh1', name: 'Bagel Melt', price: 14 },
              ],
            },
            {
              id: 'br-plates',
              name: 'Plates',
              displayMode: 'variants',
              items: [
                { id: 'bp1', name: 'American Hero Breakfast', description: 'Two eggs any style with hash browns, choice of meat and bread.\nMeat: Bacon · Sausage · Ham\nBread: Biscuit · White · Wheat · Rye', price: 12 },
                { id: 'bp2', name: 'Fallbrook', description: 'Avocado toast served with two poached eggs, tomato and sprouts.', price: 16 },
                { id: 'bp3', name: 'Toasty Toast', description: 'French toast topped with syrup and powdered sugar.', price: 14 },
              ],
            },
            {
              id: 'br-burrito',
              name: 'Breakfast Burrito',
              description: 'Scrambled eggs, guacamole, pico-de-gallo, fries, cheese.',
              displayMode: 'variants',
              items: [
                { id: 'bbr1', name: 'Sausage', price: 15 },
                { id: 'bbr2', name: 'Bacon', price: 15 },
                { id: 'bbr3', name: 'Chicken', price: 16 },
                { id: 'bbr4', name: 'Carnitas', price: 17 },
                { id: 'bbr5', name: 'Carne Asada', price: 18 },
                { id: 'bbr6', name: 'Pastrami', price: 18 },
              ],
            },
            {
              id: 'br-drinks',
              name: 'Breakfast Drinks',
              displayMode: 'variants',
              items: [
                { id: 'bd1', name: 'Fresh Brewed Coffee', price: 4 },
                { id: 'bd2', name: 'Mimosa', description: 'Orange · Pineapple · Apple · Cranberry · Grapefruit', price: 10 },
                { id: 'bd3', name: 'Irish Coffee', description: 'Coffee, Whiskey, Baileys Irish Cream.', price: 12 },
                { id: 'bd4', name: 'Bloody Mary', description: "Absolut Peppar Vodka, Sam's Bloody Mary mix, served with a Tajin rim.", price: 13 },
                { id: 'bd5', name: 'Michelada', description: "Sam's Bloody Mary mix served with choice of beer & Tajin rim.", price: 10 },
              ],
            },
          ],
        },

        // ─── KIDS ───
        {
          id: 'g-kids',
          name: 'Kids',
          displayMode: 'variants',
          basePrice: 10,
          choices: [
            { label: 'Drink', options: ['Milk', 'Soda', 'Apple Juice'] },
            { label: 'Side', options: ['Fries', 'Fruit'] },
          ],
          addOnLabel: 'Dessert',
          addOns: [
            { name: 'Cookie', price: '+2' },
            { name: 'Ice Cream', price: '+3' },
            { name: 'Ice Cream Sandwich', price: '+5' },
            { name: 'Churros', price: '+8' },
          ],
          items: [
            { id: 'k1', name: 'Mac & Cheese', price: 10 },
            { id: 'k2', name: 'Corn Dog', price: 10 },
            { id: 'k3', name: 'Chicken Tenders', price: 10 },
            { id: 'k4', name: 'Burger', price: 10 },
            { id: 'k5', name: 'Hot Dog', price: 10 },
            { id: 'k6', name: 'Grilled Cheese', price: 10 },
          ],
        },

        // ─── DAILY LINEUP ───
        {
          id: 'g-specials',
          name: 'Daily Lineup',
          description: 'Daily deals at American Heroes & Brew.',
          items: [
            { id: 'sp-afterschool', name: 'After School Special', subtitle: 'Mon–Fri', description: 'Kids Meals $5 · Cookies $1. Ages 10 & under, with adult entrée.', price: 0 },
            { id: 'sp-padre', name: 'Hot Dogs & Beer', subtitle: 'Padre Games', description: 'Friar Franks $6 · Heroes Drafts $2 off.', price: 0 },
            { id: 'sp-lunch', name: 'Lunch Special', subtitle: 'Mon–Thu', description: '10am–1pm · 1/2 Hoboken or Carlsbad $15.', price: 0 },
            { id: 'sp-mon', name: 'Mahalo Monday', subtitle: 'Monday', description: 'Kalua Pork Sliders $4ea · Select Cans $3ea.', price: 0 },
            { id: 'sp-tue', name: 'Taco Tuesday', subtitle: 'Tuesday', description: 'Tacos $4ea · Tequila $2 off.', price: 0 },
            { id: 'sp-wed', name: 'Wings & Wells', subtitle: 'Wednesday', description: 'Wings $6 off · Wells $6ea.', price: 0 },
            { id: 'sp-thu', name: 'Burgers & Beer', subtitle: 'Thursday', description: 'Burgers $5 off · Select Drafts $5ea.', price: 0 },
            { id: 'sp-fri', name: 'Friday Funday', subtitle: 'Friday', description: '1–4pm · Drinks & Appetizers $2 off.', price: 0 },
            { id: 'sp-sat', name: 'Late Night Delight', subtitle: 'Saturday', description: '9pm–close · Drinks $2 off.', price: 0 },
            { id: 'sp-sun', name: 'Sunday Send Off', subtitle: 'Sunday', description: '7pm–close · Drinks $2 off.', price: 0 },
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
