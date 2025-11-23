export interface ShoppingService {
  id: string;
  name: string;
  icon: string; // Can be an emoji ('⚡') or a path/URL ('/icons/blinkit.png')
  color: string;
  bgColor: string;
  available: boolean;
  type: 'deeplink' | 'search' | 'url';
  description: string;
}

export const shoppingServices: ShoppingService[] = [
  {
    id: 'blinkit',
    name: 'Blinkit',
    // Using CDN link for demo. You can replace with local path like: '/images/blinkit.png'
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Blinkit-yellow-rounded.svg/250px-Blinkit-yellow-rounded.svg.png',
    color: '#F8CB46',
    bgColor: '#FFF9E5',
    available: true,
    type: 'search',
    description: '10-min delivery'
  },
  {
    id: 'zepto',
    name: 'Zepto',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Zepto_logo.png/640px-Zepto_logo.png', 
    color: '#8B5CF6',
    bgColor: '#F3E8FF',
    available: true,
    type: 'search',
    description: 'Quick delivery'
  },
  {
    id: 'swiggy-instamart',
    name: 'Swiggy Instamart',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.svg',
    color: '#FC8019',
    bgColor: '#FFF4ED',
    available: true,
    type: 'search',
    description: 'Fast grocery'
  },
  {
    id: 'amazon-fresh',
    name: 'Amazon Fresh',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', 
    color: '#FF9900',
    bgColor: '#FFF3E0',
    available: true,
    type: 'url',
    description: 'Same-day delivery'
  },
  {
    id: 'bigbasket',
    name: 'BigBasket',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Bigbasket_Logo.svg/2560px-Bigbasket_Logo.svg.png',
    color: '#84C225',
    bgColor: '#F0FFE0',
    available: true,
    type: 'url',
    description: 'Scheduled delivery'
  },
  {
    id: 'jiomart',
    name: 'JioMart',
    icon: '/jiomart.png', // Add this image to your public folder
    color: '#008ECC',
    bgColor: '#E1F5FE',
    available: true,
    type: 'url',
    description: 'Hyperlocal delivery'
  },
  {
    id: 'dealshare',
    name: 'DealShare',
    icon: '/dealshare.png', // Add this image to your public folder
    color: '#D61F5E',
    bgColor: '#FCE4EC',
    available: true,
    type: 'url',
    description: 'Budget grocery'
  }
];

export function generateServiceUrlForItem(serviceId: string, item: string): string {
  // Clean the item (remove quantities and measurements)
  const cleanItem = item
    .replace(/\d+\s*(cup|cups|tbsp|tsp|kg|g|gm|gms|ml|l|ltr|piece|pieces|pcs|oz|lb)/gi, '')
    .trim();

  const encodedItem = encodeURIComponent(cleanItem);

  switch (serviceId) {
    case 'blinkit':
      return `https://blinkit.com/s/?q=${encodedItem}`;
    case 'zepto':
      return `https://www.zeptonow.com/search?query=${encodedItem}`;
    case 'amazon-fresh':
      return `https://www.amazon.in/s?k=${encodedItem}&i=amazonfresh`;
    case 'swiggy-instamart':
      return `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodedItem}`;
    case 'bigbasket':
      return `https://www.bigbasket.com/ps/?q=${encodedItem}`;
    case 'jiomart':
      // Updated to use 'search?q='
      return `https://www.jiomart.com/search?q=${encodedItem}`;
    case 'dealshare':
      // Updated to use 'search?query='
      return `https://www.dealshare.in/search?query=${encodedItem}`;
    default:
      return '#';
  }
}

export function getMobileDeepLinkForItem(serviceId: string, item: string): string | null {
  const cleanItem = item
    .replace(/\d+\s*(cup|cups|tbsp|tsp|kg|g|gm|gms|ml|l|ltr|piece|pieces|pcs|oz|lb)/gi, '')
    .trim();

  const encodedItem = encodeURIComponent(cleanItem);

  switch (serviceId) {
    case 'blinkit':
      return `blinkit://search?query=${encodedItem}`;
    case 'zepto':
      return `zepto://search?query=${encodedItem}`;
    case 'swiggy-instamart':
      return `swiggy://instamart/search?query=${encodedItem}`;
    // JioMart and DealShare mostly rely on web wrappers or don't have public search deep links
    default:
      return null;
  }
}