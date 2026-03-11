import { Menu, Restaurant } from '@/types';

export function getMenus(): Menu[] {
  return [
    {
      id: 'menu-1',
      name: 'Main Menu',
      groups: [
        {
          id: 'g-starters',
          name: 'Starters',
          displayMode: 'starters',
          items: [],
          subGroups: [
            {
              id: 'g-wings',
              name: 'Signature Wings',
              description: '8 wings, celery, carrots. Choice of sauce/rub & dressing.',
              displayMode: 'variants',
              basePrice: 18,
              addOnLabel: 'Mods',
              addOns: [{ name: 'Boneless', price: '+3' }],
              items: [
                { id: 'w1', name: 'Buffalo', price: 18 },
                { id: 'w2', name: 'Mango Habanero', price: 18 },
                { id: 'w3', name: 'Sriracha Honey', price: 18 },
                { id: 'w4', name: 'Kickin BBQ', price: 18 },
                { id: 'w5', name: 'Lemon Pepper (Dry Rub)', price: 18 },
                { id: 'w6', name: 'Old Bay (Dry Rub)', price: 18 },
              ],
            },
            {
              id: 'g-nachos',
              name: 'Nachos',
              description: 'Mountain of chips. Cheddar, jack and nacho cheeses with beans, sour cream, onions, jalapeños, guacamole, cilantro with a side of Mariano\'s spicy salsa.',
              displayMode: 'variants',
              basePrice: 18,
              addOnLabel: 'Mods',
              addOns: [
                { name: 'Carnitas', price: '+6' },
                { name: 'Carne Asada', price: '+8' },
              ],
              items: [
                { id: 'n1', name: 'Nachos', price: 18 },
              ],
            },
            {
              id: 'g-sliders',
              name: 'Sliders',
              description: '3 juicy sliders served your way on a mini brioche bun.',
              displayMode: 'variants',
              basePrice: 16,
              choices: [
                { label: 'Select', options: ['Pulled Pork', 'Cheeseburger', 'Hamburger'] },
              ],
              items: [
                { id: 'sl1', name: 'Sliders', price: 16 },
              ],
            },
            {
              id: 'g-fries',
              name: 'Loaded Fries',
              description: 'Pile of fries with your choice of toppings.',
              displayMode: 'variants',
              basePrice: 18,
              items: [
                { id: 'f1', name: 'Carne Asada', price: 18 },
                { id: 'f2', name: 'Buffalo Chicken', price: 18 },
                { id: 'f3', name: 'Cheesesteak', price: 18 },
                { id: 'f4', name: 'Chili Cheese', price: 18 },
                { id: 'f5', name: 'Garlic Parm', price: 18 },
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
                { id: 'm1', name: 'Frings', price: 12 },
                { id: 'm2', name: 'Mozzarella Sticks', price: 12 },
                { id: 'm3', name: 'Pretzel Bites', price: 12 },
                { id: 'm4', name: 'Fried Pickle Chips', price: 12 },
                { id: 'm5', name: 'Hummus', price: 12 },
                { id: 'm6', name: 'Jalapeno Poppers', price: 12 },
              ],
            },
            {
              id: 'g-sampler',
              name: 'Sample Platter',
              description: 'The game time essentials.',
              displayMode: 'variants',
              basePrice: 36,
              choices: [
                { label: 'Select', options: ['Wings', 'Loaded Fries', 'Nachos'] },
                { label: '2 Munchies', options: ['Frings', 'Mozzarella Sticks', 'Pretzel Bites', 'Fried Pickle Chips', 'Hummus', 'Jalapeno Poppers'] },
              ],
              addOnLabel: 'Mods',
              addOns: [
                { name: 'Sliders', price: '+4 ea' },
                { name: 'Three Munchies', price: '+10' },
              ],
              items: [
                { id: 'sp1', name: 'Sample Platter', price: 36 },
              ],
            },
          ],
        },
        {
          id: 'g-salads',
          name: 'Salads',
          addOnLabel: 'Mods',
          addOns: [{ name: 'Avocado', price: '+3' }, { name: 'Add chicken', price: '+5' }],
          items: [
            { id: 's1', name: 'Healthy Hero', description: 'Spring mix, sprouts, tomato, cucumber, red onion, croutons.', price: 17 },
            { id: 's2', name: 'Caesar', description: 'Romaine, croutons, parmesan, creamy caesar.', price: 17 },
            { id: 's3', name: 'Cobb', description: 'Romaine, tomato, red onion, egg, bacon, avocado, blue cheese crumble.', price: 20 },
            { id: 's4', name: 'Antipasto', description: 'Spring mix, tomato, cold cuts, provolone, parmesan, cherry peppers.', price: 20 },
          ],
        },
        {
          id: 'g-burgers',
          name: 'Burgers',
          description: 'Best burgers in Carlsbad. Make it a double +4.',
          displayMode: 'variants',
          basePrice: 18,
          mods: [
            { name: 'Avocado', price: '+3' },
            { name: 'Bacon', price: '+4' },
          ],
          addOnLabel: 'Sides',
          addOns: [
            { name: 'Potato Salad', price: '+2' },
            { name: 'Macaroni Salad', price: '+3' },
            { name: 'Fries', price: '+4' },
            { name: 'Onion Rings', price: '+6' },
            { name: 'Frings', price: '+8' },
            { name: 'Salad', price: '+10' },
            { name: 'Wings', price: '+12' },
          ],
          items: [
            { id: 'b1', name: 'Pasadena', subtitle: 'The OG', description: 'Lettuce, tomato, pickle, red onion, Hero sauce, cheese, on a brioche bun.', price: 18 },
            { id: 'b2', name: 'Tombstone', subtitle: 'Cowboy', description: 'Bacon, grilled onion, cheddar, BBQ sauce, topped with onion rings on a brioche bun.', price: 18 },
            { id: 'b3', name: 'Bethlehem', subtitle: 'Steeltown', description: 'Bacon, mushrooms, grilled onions, cheddar cheese on a brioche bun.', price: 18 },
            { id: 'b4', name: 'Minneapolis', subtitle: 'Juicy Lucy', description: 'Stuffed cheese patty, grilled onions, cheese skirt, Hero sauce on a brioche bun.', price: 18 },
            { id: 'b5', name: 'Hollywood', subtitle: 'Patty Melt', description: 'White American cheese, grilled onions, Hero sauce on toasted rye bread.', price: 18 },
            { id: 'b6', name: 'Leucadia', subtitle: 'Smash Burger', description: 'Grilled onion, white American cheese, pickles, Hero sauce on a potato bun.', price: 18 },
            { id: 'b7', name: 'Austin', subtitle: 'Jalapeño Burger', description: 'Pepper jack, wiz, jalapeños, onion ring on a brioche bun.', price: 18 },
            { id: 'b8', name: 'Irwindale', subtitle: 'Sriracha Honey', description: 'Caramelized onions, pickles, slaw, garlic aioli, Sriracha Honey sauce on a brioche bun.', price: 18 },
          ],
        },
        {
          id: 'g-heroes',
          name: 'Heroes',
          addOns: [
            { name: 'Potato Salad', price: '+2' },
            { name: 'Macaroni Salad', price: '+3' },
            { name: 'Fries', price: '+4' },
            { name: 'Onion Rings', price: '+6' },
            { name: 'Frings', price: '+8' },
            { name: 'Salad', price: '+10' },
            { name: 'Wings', price: '+12' },
          ],
          subGroups: [
            {
              id: 'g-philly',
              name: 'Philly Cheesesteak',
              description: 'Thin sliced ribeye on an Amoroso roll.',
              displayMode: 'variants',
              basePrice: 22,
              choices: [
                { label: 'Cheese', options: ['Wiz', 'Provolone'] },
                { label: 'Toppings', options: ['Onions', 'Peppers', 'Mushrooms'] },
              ],
              items: [
                { id: 'p1', name: 'Classic Philly', price: 22 },
              ],
            },
          ],
          items: [
            { id: 'h1', name: 'Hoboken', subtitle: 'Italian', description: 'Capicola, salami, ham, mortadella, provolone, lettuce, tomato, onion, oregano, oil & vinegar, on an Italian roll.', price: 22 },
            { id: 'h2', name: 'Manhattan', subtitle: 'Reuben', description: 'Pastrami, pickles, dark ale ground mustard, Russian dressing, sauerkraut, Swiss cheese on rye bread.', price: 22 },
            { id: 'h3', name: 'Los Angeles', subtitle: 'French Dip', description: 'Slow-cooked roast beef, Swiss cheese, horseradish aioli, with au jus, on an Italian roll.', price: 22 },
            { id: 'h4', name: 'Carlsbad', subtitle: 'BLT+', description: 'Grilled chicken, bacon, avocado, lettuce, tomato, garlic aioli, on a long roll.', price: 20 },
            { id: 'h5', name: 'Carolina', subtitle: 'Pulled Pork', description: 'Pulled pork, pickles, slaw, kickin BBQ sauce on a brioche bun.', price: 20 },
          ],
        },
        {
          id: 'g-handhelds',
          name: 'Handhelds',
          addOns: [
            { name: 'Potato Salad', price: '+2' },
            { name: 'Macaroni Salad', price: '+3' },
            { name: 'Fries', price: '+4' },
            { name: 'Onion Rings', price: '+6' },
            { name: 'Frings', price: '+8' },
            { name: 'Salad', price: '+10' },
            { name: 'Wings', price: '+12' },
          ],
          subGroups: [
            {
              id: 'g-tacos',
              name: 'Village Tacos',
              description: '3 tacos, topped with pickled onion, cilantro, crema, queso fresco. Served with chips and salsa.',
              displayMode: 'variants',
              basePrice: 16,
              choices: [
                { label: 'Tortilla', options: ['Corn', 'Flour'] },
                { label: 'Meat', options: ['Carne Asada', 'Carnitas', 'Chicken'] },
              ],
              addOnLabel: 'Mods',
              addOns: [
                { name: 'Nacho Cheese', price: '+1' },
                { name: 'Avocado', price: '+3' },
                { name: 'Guacamole', price: '+3' },
                { name: 'Nachos', price: '+12' },
              ],
              items: [
                { id: 'hh2', name: 'Village Tacos', price: 16 },
              ],
            },
            {
              id: 'g-dogs',
              name: 'Frier Franks',
              description: '2 franks with your choice of topping.',
              displayMode: 'variants',
              basePrice: 16,
              choices: [
                { label: 'Toppings', options: ['Ketchup', 'Mustard', 'Onions', 'Relish'] },
              ],
              addOnLabel: 'Mods',
              addOns: [
                { name: 'Cheese', price: '+1' },
                { name: 'Chili', price: '+3' },
              ],
              items: [
                { id: 'hh1', name: 'Frier Franks', price: 16 },
              ],
            },
          ],
          items: [],
        },
        {
          id: 'g-sweet',
          name: 'Sweet Stuff',
          items: [
            { id: 'ss1', name: 'Key Lime Pie', description: 'Classic key lime pie.', price: 14 },
            { id: 'ss2', name: 'Cheesecake', description: 'Rich and creamy cheesecake.', price: 14 },
            { id: 'ss3', name: 'Churros', description: 'Warm cinnamon sugar churros.', price: 10 },
            { id: 'ss4', name: 'Ice Cream Sandwich', description: 'Ice cream sandwich.', price: 6 },
            { id: 'ss5', name: 'Ice Cream', description: 'Scoop of ice cream.', price: 4 },
            { id: 'ss6', name: 'Chocolate Chip Cookie', description: 'Fresh baked chocolate chip cookie.', price: 3 },
          ],
        },
        {
          id: 'g-kids',
          name: 'Kids',
          displayMode: 'variants',
          basePrice: 12,
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
            { id: 'k1', name: 'Mac & Cheese', price: 12 },
            { id: 'k2', name: 'Corn Dog', price: 12 },
            { id: 'k3', name: 'Chicken Tenders', price: 12 },
            { id: 'k4', name: 'Burger', price: 12 },
            { id: 'k5', name: 'Hot Dog', price: 12 },
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
    address2: 'Suite 101',
    city: 'Carlsbad',
    stateCode: 'CA',
    zipCode: '92008',
    phone: '(760) 994-0187',
    latitude: 33.1581,
    longitude: -117.3506,
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
