export const avatarOptions = [
  { id: 'chef1', emoji: '👨‍🍳', label: 'Male Chef' },
  { id: 'chef2', emoji: '👩‍🍳', label: 'Female Chef' },
  { id: 'cook1', emoji: '🧑‍🍳', label: 'Cook' },
  { id: 'food1', emoji: '🍕', label: 'Pizza' },
  { id: 'food2', emoji: '🍔', label: 'Burger' },
  { id: 'food3', emoji: '🍜', label: 'Ramen' },
  { id: 'food4', emoji: '🍳', label: 'Cooking' },
  { id: 'food5', emoji: '🥘', label: 'Paella' },
  { id: 'food6', emoji: '🍱', label: 'Bento' },
  { id: 'fruit1', emoji: '🍎', label: 'Apple' },
  { id: 'fruit2', emoji: '🍊', label: 'Orange' },
  { id: 'fruit3', emoji: '🍋', label: 'Lemon' },
  { id: 'veg1', emoji: '🥕', label: 'Carrot' },
  { id: 'veg2', emoji: '🥦', label: 'Broccoli' },
  { id: 'veg3', emoji: '🌽', label: 'Corn' },
  { id: 'drink1', emoji: '☕', label: 'Coffee' },
  { id: 'drink2', emoji: '🍵', label: 'Tea' },
  { id: 'drink3', emoji: '🥤', label: 'Soda' },
  { id: 'sweet1', emoji: '🍰', label: 'Cake' },
  { id: 'sweet2', emoji: '🍪', label: 'Cookie' },
  { id: 'sweet3', emoji: '🍩', label: 'Donut' },
  { id: 'animal1', emoji: '🐔', label: 'Chicken' },
  { id: 'animal2', emoji: '🐟', label: 'Fish' },
  { id: 'animal3', emoji: '🐷', label: 'Pig' },
];

export function getAvatarDisplay(user: {
  avatar?: string | null;
  image?: string | null;
  name?: string | null;
}): {
  type: 'emoji' | 'image' | 'initial';
  value: string;
} {
  // Priority 1: Custom selected avatar
  if (user.avatar) {
    const avatarOption = avatarOptions.find(a => a.id === user.avatar);
    if (avatarOption) {
      return { type: 'emoji', value: avatarOption.emoji };
    }
  }

  // Priority 2: Google profile image
  if (user.image) {
    return { type: 'image', value: user.image };
  }

  // Priority 3: Name initial
  return {
    type: 'initial',
    value: user.name?.[0]?.toUpperCase() || 'C'
  };
}