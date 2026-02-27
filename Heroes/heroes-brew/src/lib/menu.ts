import { Menu, MenuGroup, MenuItem, Restaurant, DaySchedule } from '@/types';

export function getMenus(): Menu[] {
  return [
    {
      id: 'menu-1',
      name: 'Main Menu',
      groups: [
        {
          id: 'g-wings',
          name: 'Signature Wings',
          description: '8 wings, celery, carrots. Choice of sauce/rub & dressing.\nSub chicken tenders +3.',
          items: [
            { id: 'w1', name: 'Buffalo', description: 'Classic buffalo sauce.', price: 18 },
            { id: 'w2', name: 'Mango Habanero', description: 'Sweet heat with tropical mango.', price: 18 },
            { id: 'w3', name: 'Sriracha Honey', description: 'Spicy sriracha with honey glaze.', price: 18 },
            { id: 'w4', name: 'Kickin BBQ', description: 'Smoky BBQ with a kick.', price: 18 },
            { id: 'w5', name: 'Lemon Pepper (Dry Rub)', description: 'Zesty lemon pepper dry rub.', price: 18 },
            { id: 'w6', name: 'Old Bay (Dry Rub)', description: 'Classic Old Bay seasoning dry rub.', price: 18 },
          ],
        },
        {
          id: 'g-fries',
          name: 'Loaded Fries',
          description: 'Pile of fries with your choice of toppings.',
          items: [
            { id: 'f1', name: 'Carne Asada', description: 'Loaded fries topped with seasoned carne asada.', price: 18 },
            { id: 'f2', name: 'Buffalo Chicken', description: 'Loaded fries topped with buffalo chicken.', price: 18 },
            { id: 'f3', name: 'Cheesesteak', description: 'Loaded fries topped with cheesesteak.', price: 18 },
            { id: 'f4', name: 'Chili Cheese', description: 'Loaded fries with chili and melted cheese.', price: 18 },
            { id: 'f5', name: 'Garlic Parm', description: 'Loaded fries with garlic parmesan.', price: 18 },
            { id: 'f6', name: 'Bacon & Cheese', description: 'Loaded fries with bacon and melted cheese.', price: 18 },
          ],
        },
        {
          id: 'g-munchies',
          name: 'Munchies',
          description: 'Everyone\'s favorites.',
          items: [
            { id: 'm1', name: 'Frings', description: 'Fries and onion rings combo.', price: 12 },
            { id: 'm2', name: 'Mozzarella Sticks', description: 'Golden fried mozzarella sticks.', price: 12 },
            { id: 'm3', name: 'Pretzel Bites', description: 'Warm soft pretzel bites.', price: 12 },
            { id: 'm4', name: 'Fried Pickle Chips', description: 'Crispy fried pickle chips.', price: 12 },
            { id: 'm5', name: 'Hummus', description: 'Served with pita and veggies.', price: 12 },
            { id: 'm6', name: 'Jalapeno Poppers', description: 'Stuffed and fried jalapeno poppers.', price: 12 },
          ],
        },
        {
          id: 'g-salads',
          name: 'Salads',
          description: 'Add chicken +5, avocado +3.',
          items: [
            { id: 's1', name: 'Healthy Hero', description: 'Spring mix, sprouts, tomato, cucumber, red onion, croutons.', price: 17 },
            { id: 's2', name: 'Caesar', description: 'Romaine, croutons, parmesan, creamy caesar.', price: 17 },
            { id: 's3', name: 'Cobb', description: 'Romaine, tomato, red onion, egg, bacon, avocado, blue cheese crumble.', price: 17 },
            { id: 's4', name: 'Antipasto', description: 'Spring mix, tomato, cold cuts, provolone, parmesan, cherry peppers.', price: 20 },
          ],
        },
        {
          id: 'g-burgers',
          name: 'Burgers',
          description: 'Best burgers in Carlsbad, comes with choice of fries or rings.\nMake it a double +4.',
          items: [
            { id: 'b1', name: 'Pasadena', description: 'The "OG" — lettuce, tomato, pickle, red onion, Hero sauce, cheese, on a brioche bun.', price: 18 },
            { id: 'b2', name: 'Tombstone', description: 'Cowboy — bacon, grilled onion, cheddar, BBQ sauce, topped with onion rings on a brioche bun.', price: 18 },
            { id: 'b3', name: 'Bethlehem', description: 'Steeltown — bacon, mushrooms, grilled onions, cheddar cheese on a brioche bun.', price: 18 },
            { id: 'b4', name: 'Minneapolis', description: 'Juicy Lucy — stuffed cheese patty, grilled onions, cheese skirt, Hero sauce on a brioche bun.', price: 18 },
            { id: 'b5', name: 'Hollywood', description: 'Patty Melt — white American cheese, grilled onions, Hero sauce on toasted rye bread.', price: 18 },
            { id: 'b6', name: 'Leucadia', description: 'Smash burger — grilled onion, white American cheese, pickles, Hero sauce on a potato bun.', price: 18 },
          ],
        },
        {
          id: 'g-philly',
          name: 'Philly Cheesesteak',
          description: 'Thin sliced ribeye, cheese, toppings, on an Amoroso roll. Billy Style +4: loaded, double cheese, fries.',
          items: [
            { id: 'p1', name: 'Classic Philly', description: 'Wiz or provolone. Toppings: onions, peppers, mushrooms.', price: 22 },
          ],
        },
        {
          id: 'g-heroes',
          name: 'Hero Sandwiches',
          items: [
            { id: 'h1', name: 'Hoboken', description: 'Italian — capicola, salami, ham, mortadella, provolone, lettuce, tomato, onion, oregano, oil & vinegar, on an Italian roll.', price: 22 },
            { id: 'h2', name: 'Manhattan', description: 'Reuben — pastrami, pickles, dark ale ground mustard, Russian dressing, sauerkraut, Swiss cheese on rye bread.', price: 22 },
            { id: 'h3', name: 'Los Angeles', description: 'French Dip — slow-cooked roast beef, Swiss cheese, horseradish aioli, with au jus, on an Italian roll.', price: 22 },
            { id: 'h4', name: 'Carlsbad', description: 'BLT+ — grilled chicken, bacon, avocado, lettuce, tomato, garlic aioli, on a long roll.', price: 20 },
          ],
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
          description: 'Choose your side: fries or fruit. Choose your drink: soda, apple, or milk.',
          items: [
            { id: 'k1', name: 'Mac & Cheese', description: 'Kids mac & cheese with choice of side and drink.', price: 12 },
            { id: 'k2', name: 'Corn Dog', description: 'Kids corn dog with choice of side and drink.', price: 12 },
            { id: 'k3', name: 'Chicken Tenders', description: 'Kids chicken tenders with choice of side and drink.', price: 12 },
            { id: 'k4', name: 'Burger', description: 'Kids burger with choice of side and drink.', price: 12 },
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
      { dayOfWeek: 'Monday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Tuesday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Wednesday', open: '11:00 AM', close: '10:00 PM' },
      { dayOfWeek: 'Thursday', open: '11:00 AM', close: '11:00 PM' },
      { dayOfWeek: 'Friday', open: '11:00 AM', close: '12:00 AM' },
      { dayOfWeek: 'Saturday', open: '9:00 AM', close: '12:00 AM' },
      { dayOfWeek: 'Sunday', open: '9:00 AM', close: '10:00 PM' },
    ],
  };
}
