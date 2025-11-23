// Using DiceBear "Notionists" style for a clean, illustrative look
export const avatarOptions = [
  { id: 'chef1', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=Felix', label: 'Felix' },
  { id: 'chef2', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aneka', label: 'Aneka' },
  { id: 'chef3', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=Chef', label: 'Chef' },
  { id: 'chef4', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=Maria', label: 'Maria' },
  { id: 'chef5', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=Leo', label: 'Leo' },
  { id: 'chef6', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=Mila', label: 'Mila' },
  { id: 'chef7', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=Robert', label: 'Robert' },
  { id: 'chef8', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jasmine', label: 'Jasmine' },
  { id: 'chef9', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=Oliver', label: 'Oliver' },
  { id: 'chef10', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=Sara', label: 'Sara' },
  { id: 'chef11', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=George', label: 'George' },
  { id: 'chef12', src: 'https://api.dicebear.com/9.x/notionists/svg?seed=Lilly', label: 'Lilly' },
];

export function getAvatarDisplay(user: {
  avatar?: string | null;
  image?: string | null;
  name?: string | null;
}): {
  type: 'image' | 'initial'; // Removed 'emoji' type
  value: string;
} {
  // Priority 1: Custom selected avatar
  if (user.avatar) {
    const avatarOption = avatarOptions.find(a => a.id === user.avatar);
    if (avatarOption) {
      return { type: 'image', value: avatarOption.src };
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