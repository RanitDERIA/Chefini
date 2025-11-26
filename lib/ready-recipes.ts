// Re-defining interface locally to avoid dependency issues
export interface StaticRecipe {
  _id: string;
  title: string;
  time: string;
  ingredients: Array<{ item: string; missing?: boolean }>;
  instructions: string[];
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  tip: string;
  category: 'Indian Staple' | 'Bengali Special';
  createdBy?: {
    name: string;
    image?: string;
    avatar?: string;
  };
}

export const readyRecipes: StaticRecipe[] = [
  // --- 12 Simple Indian Staples ---
  {
    _id: 'jeera-aloo',
    title: 'Jeera Aloo (Cumin Potatoes)',
    category: 'Indian Staple',
    time: '20 min',
    ingredients: [
      { item: 'Boiled Potatoes (cubed)' },
      { item: 'Cumin Seeds (Jeera)' },
      { item: 'Turmeric Powder' },
      { item: 'Green Chilies (slit)' },
      { item: 'Oil or Ghee' }
    ],
    instructions: [
      'Heat oil or ghee in a pan on medium heat.',
      'Add cumin seeds and let them splutter and turn brown.',
      'Add green chilies and turmeric powder.',
      'Toss in the boiled potato cubes and salt.',
      'Roast on high flame for 5 minutes until potatoes form a crust.'
    ],
    macros: { calories: 220, protein: 4, carbs: 35, fats: 8 },
    tip: 'The nutty flavor of fried cumin transforms plain potatoes instantly. Do not skimp on the roasting step.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'dal-tadka',
    title: 'Dal Tadka (Yellow Lentils)',
    category: 'Indian Staple',
    time: '30 min',
    ingredients: [
      { item: 'Toor or Moong Dal (boiled)' },
      { item: 'Ghee' },
      { item: 'Garlic (chopped)' },
      { item: 'Dry Red Chili' },
      { item: 'Cumin Seeds' }
    ],
    instructions: [
      'Boil the dal with salt and turmeric until soft.',
      'In a separate small pan, heat the ghee aggressively.',
      'Add cumin, dry red chili, and chopped garlic.',
      'Let the garlic turn golden brown.',
      'Pour this sizzling tempering (tadka) over the boiled dal immediately and cover.'
    ],
    macros: { calories: 180, protein: 10, carbs: 25, fats: 6 },
    tip: 'The magic is entirely in the tadka added at the very end. Keep the pot covered to trap the aroma.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'khichdi',
    title: 'Comfort Khichdi',
    category: 'Indian Staple',
    time: '25 min',
    ingredients: [
      { item: 'Rice' },
      { item: 'Moong Dal' },
      { item: 'Turmeric' },
      { item: 'Salt' },
      { item: 'Ghee' }
    ],
    instructions: [
      'Wash rice and dal together.',
      'Pressure cook with 4 cups of water, salt, and turmeric for 3 whistles.',
      'Once done, mash it slightly with a ladle.',
      'Top generously with ghee before serving.'
    ],
    macros: { calories: 320, protein: 12, carbs: 50, fats: 10 },
    tip: 'The ultimate one-pot comfort meal. It digests easily and tastes divine with a dollop of ghee.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'besan-chilla',
    title: 'Besan Chilla (Savory Pancakes)',
    category: 'Indian Staple',
    time: '15 min',
    ingredients: [
      { item: 'Besan (Gram flour)' },
      { item: 'Water' },
      { item: 'Chopped Onions' },
      { item: 'Green Chilies' },
      { item: 'Carom seeds (Ajwain)' }
    ],
    instructions: [
      'Mix besan, water, onions, chilies, ajwain, and salt to form a pouring consistency batter.',
      'Heat a tawa (griddle) and grease with little oil.',
      'Pour a ladle of batter and spread into a circle.',
      'Cook on both sides until golden brown spots appear.'
    ],
    macros: { calories: 150, protein: 8, carbs: 18, fats: 5 },
    tip: 'It’s an instant protein-packed breakfast that requires no fermentation.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'poha',
    title: 'Poha (Flattened Rice)',
    category: 'Indian Staple',
    time: '15 min',
    ingredients: [
      { item: 'Thick Poha (soaked)' },
      { item: 'Mustard Seeds' },
      { item: 'Turmeric' },
      { item: 'Peanuts' },
      { item: 'Lemon Juice' }
    ],
    instructions: [
      'Rinse poha in a colander and let it drain (do not soak in water).',
      'Heat oil, crackle mustard seeds and roast peanuts.',
      'Add turmeric and the moist poha.',
      'Mix gently, cover and steam for 2 minutes.',
      'Finish with a squeeze of lemon juice.'
    ],
    macros: { calories: 280, protein: 5, carbs: 45, fats: 9 },
    tip: 'Light, fluffy, and the lemon-turmeric combo gives it a zesty kick.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'curd-rice',
    title: 'Curd Rice (Thayir Sadam)',
    category: 'Indian Staple',
    time: '10 min',
    ingredients: [
      { item: 'Cooked Rice (soft)' },
      { item: 'Yogurt' },
      { item: 'Milk' },
      { item: 'Mustard Seeds' },
      { item: 'Curry Leaves' }
    ],
    instructions: [
      'Mash the cooked rice while it is warm.',
      'Mix in yogurt and a splash of milk (to prevent it from souring).',
      'Heat oil, add mustard seeds and curry leaves until crisp.',
      'Pour tempering over the curd rice mixture.'
    ],
    macros: { calories: 200, protein: 6, carbs: 30, fats: 6 },
    tip: 'Cooling and refreshing. The tempering provides essential crunch and aroma.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'egg-bhurji',
    title: 'Anda (Egg) Bhurji',
    category: 'Indian Staple',
    time: '10 min',
    ingredients: [
      { item: 'Eggs (2-3)' },
      { item: 'Onions (chopped)' },
      { item: 'Green Chilies' },
      { item: 'Salt' },
      { item: 'Turmeric' }
    ],
    instructions: [
      'Sauté chopped onions and chilies in oil until translucent.',
      'Crack the eggs directly into the pan.',
      'Add salt and turmeric.',
      'Scramble vigorously until the eggs are cooked and dry.'
    ],
    macros: { calories: 240, protein: 18, carbs: 4, fats: 16 },
    tip: 'Takes 5 minutes to cook. Spicy, savory, and goes well with bread or roti.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'lemon-rice',
    title: 'Zesty Lemon Rice',
    category: 'Indian Staple',
    time: '15 min',
    ingredients: [
      { item: 'Cooked Rice' },
      { item: 'Lemon Juice' },
      { item: 'Turmeric' },
      { item: 'Peanuts or Cashews' },
      { item: 'Green Chilies' }
    ],
    instructions: [
      'Heat oil and roast peanuts until crunchy.',
      'Add green chilies and turmeric (turn off heat to avoid burning turmeric).',
      'Add the cooked rice and salt.',
      'Mix well and squeeze fresh lemon juice on top.'
    ],
    macros: { calories: 260, protein: 5, carbs: 42, fats: 8 },
    tip: 'A great way to use leftover rice. It has a vibrant yellow color and tangy taste.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'bhindi-fry',
    title: 'Bhindi (Okra) Fry',
    category: 'Indian Staple',
    time: '20 min',
    ingredients: [
      { item: 'Okra (sliced)' },
      { item: 'Turmeric' },
      { item: 'Red Chili Powder' },
      { item: 'Amchur (Dry Mango Powder)' }
    ],
    instructions: [
      'Wash and completely dry the okra before chopping to avoid slime.',
      'Heat oil and add the okra.',
      'Cook uncovered on medium heat.',
      'Add spices only when okra is almost done.',
      'Finish with Amchur to cut any remaining slime.'
    ],
    macros: { calories: 120, protein: 3, carbs: 12, fats: 6 },
    tip: 'Slit the okra and stir-fry. The Amchur cuts the slime and adds tanginess.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'paneer-bhurji',
    title: 'Paneer Bhurji',
    category: 'Indian Staple',
    time: '15 min',
    ingredients: [
      { item: 'Paneer (crumbled)' },
      { item: 'Onions (chopped)' },
      { item: 'Tomatoes (chopped)' },
      { item: 'Jeera (Cumin)' }
    ],
    instructions: [
      'Sauté cumin seeds and onions until golden.',
      'Add tomatoes and cook until soft.',
      'Add crumbled paneer, salt, and spices.',
      'Mix well for 2 minutes (do not overcook or paneer gets chewy).'
    ],
    macros: { calories: 280, protein: 14, carbs: 8, fats: 20 },
    tip: 'A vegetarian alternative to egg bhurji that feels rich without heavy gravies.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'simple-kadhi',
    title: 'Simple Kadhi',
    category: 'Indian Staple',
    time: '25 min',
    ingredients: [
      { item: 'Sour Yogurt' },
      { item: 'Besan (Gram Flour)' },
      { item: 'Turmeric' },
      { item: 'Mustard Seeds' },
      { item: 'Curry Leaves' }
    ],
    instructions: [
      'Whisk yogurt, besan, water, and turmeric into a lump-free liquid.',
      'Boil this mixture on low heat for 15-20 minutes, stirring often.',
      'Prepare a tempering of mustard seeds and curry leaves.',
      'Add tempering to the boiling kadhi.'
    ],
    macros: { calories: 140, protein: 6, carbs: 15, fats: 5 },
    tip: 'It’s a soup-like curry that pairs perfectly with steamed rice.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'upma',
    title: 'Rava Upma',
    category: 'Indian Staple',
    time: '15 min',
    ingredients: [
      { item: 'Semolina (Rava/Sooji)' },
      { item: 'Mustard Seeds' },
      { item: 'Curry Leaves' },
      { item: 'Water' },
      { item: 'Oil/Ghee' }
    ],
    instructions: [
      'Dry roast the semolina until fragrant and set aside.',
      'Heat oil, add mustard seeds and curry leaves.',
      'Add water and bring to a boil.',
      'Slowly pour in roasted semolina while stirring continuously to avoid lumps.'
    ],
    macros: { calories: 220, protein: 6, carbs: 38, fats: 6 },
    tip: 'Roasting the semolina beforehand gives it a nutty aroma that carries the dish.',
    createdBy: { name: 'Chefini Classics' }
  },
  // --- 3 Bengali Specialties ---
  {
    _id: 'aloo-seddho-bhaat',
    title: 'Aloo Seddho Bhaat',
    category: 'Bengali Special',
    time: '20 min',
    ingredients: [
      { item: 'Steamed Rice' },
      { item: 'Boiled Potatoes' },
      { item: 'Mustard Oil (Raw)' },
      { item: 'Green Chilies' },
      { item: 'Salt' }
    ],
    instructions: [
      'Steam rice and boil potatoes (often done together).',
      'Mash the potato with salt and a crushed green chili.',
      'Drizzle raw mustard oil generously.',
      'Mix well and eat with the hot rice.'
    ],
    macros: { calories: 350, protein: 6, carbs: 65, fats: 5 },
    tip: 'The soul food of Bengal. The raw mustard oil provides a signature wasabi-like kick.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'begun-bhaja',
    title: 'Begun Bhaja (Fried Eggplant)',
    category: 'Bengali Special',
    time: '15 min',
    ingredients: [
      { item: 'Eggplant (large discs)' },
      { item: 'Turmeric' },
      { item: 'Salt' },
      { item: 'Sugar (pinch)' },
      { item: 'Mustard Oil' }
    ],
    instructions: [
      'Wash eggplant discs and rub with turmeric, salt, and a pinch of sugar.',
      'Heat mustard oil in a flat pan until smoking.',
      'Fry discs on medium heat until dark brown on outside and soft inside.'
    ],
    macros: { calories: 160, protein: 2, carbs: 14, fats: 10 },
    tip: 'The inside becomes creamy like butter while the outside is crispy. Best with Khichdi.',
    createdBy: { name: 'Chefini Classics' }
  },
  {
    _id: 'musur-dal',
    title: 'Bengali Musur Dal',
    category: 'Bengali Special',
    time: '25 min',
    ingredients: [
      { item: 'Masoor Dal (Red Lentils)' },
      { item: 'Turmeric' },
      { item: 'Salt' },
      { item: 'Kalonji (Nigella Seeds)' },
      { item: 'Dried Red Chili' }
    ],
    instructions: [
      'Boil red lentils with water, salt, and turmeric until fully dissolved and watery.',
      'Heat oil in a ladle.',
      'Add Nigella seeds (Kalonji) and a broken dry red chili.',
      'Pour tempering into the watery dal.'
    ],
    macros: { calories: 140, protein: 9, carbs: 22, fats: 3 },
    tip: 'Unlike heavy North Indian dal, this is watery. Kalonji creates a unique aromatic profile.',
    createdBy: { name: 'Chefini Classics' }
  }
];