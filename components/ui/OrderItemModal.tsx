'use client';

import { X, ExternalLink, ChevronRight } from 'lucide-react';

// --- INTERNAL LOGIC MERGED TO FIX IMPORT ERROR ---

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
    // References file at: public/blinkit.png
    icon: '/blinkit.png',
    color: '#F8CB46',
    bgColor: '#FFF9E5',
    available: true,
    type: 'search',
    description: '10-min delivery'
  },
  {
    id: 'zepto',
    name: 'Zepto',
    // References file at: public/zepto.png
    icon: '/zepto.png', 
    color: '#8B5CF6',
    bgColor: '#F3E8FF',
    available: true,
    type: 'search',
    description: 'Quick delivery'
  },
  {
    id: 'swiggy-instamart',
    name: 'Swiggy Instamart',
    // References file at: public/swiggy.png
    icon: '/swiggy.png',
    color: '#FC8019',
    bgColor: '#FFF4ED',
    available: true,
    type: 'search',
    description: 'Fast grocery'
  },
  {
    id: 'amazon-fresh',
    name: 'Amazon Fresh',
    // References file at: public/amazon.png
    icon: '/amazon.png', 
    color: '#FF9900',
    bgColor: '#FFF3E0',
    available: true,
    type: 'url',
    description: 'Same-day delivery'
  },
  {
    id: 'bigbasket',
    name: 'BigBasket',
    // References file at: public/bigbasket.png
    icon: '/bigbasket.png',
    color: '#84C225',
    bgColor: '#F0FFE0',
    available: true,
    type: 'url',
    description: 'Scheduled delivery'
  },
  {
    id: 'jiomart',
    name: 'JioMart',
    icon: '/jiomart.png',
    color: '#008ECC',
    bgColor: '#E1F5FE',
    available: true,
    type: 'url',
    description: 'Hyperlocal delivery'
  },
  {
    id: 'dealshare',
    name: 'DealShare',
    icon: '/dealshare.png',
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
      return `https://www.jiomart.com/catalogsearch/result?q=${encodedItem}`;
    case 'dealshare':
      return `https://www.dealshare.in/search?q=${encodedItem}`;
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
    // JioMart and DealShare often rely on web-wrappers or don't have public deep link schemes for search
    // Returning null falls back to the web URL which opens the app if Universal Links are supported
    default:
      return null;
  }
}

// --- END INTERNAL LOGIC ---

interface OrderItemModalProps {
  item: string;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (service: string) => void;
}

export default function OrderItemModal({ item, isOpen, onClose, onOrderSuccess }: OrderItemModalProps) {
  if (!isOpen) return null;

  const handleServiceClick = (serviceId: string, serviceName: string) => {
    // Try mobile deep link first
    const deepLink = getMobileDeepLinkForItem(serviceId, item);
    const webUrl = generateServiceUrlForItem(serviceId, item);

    if (deepLink) {
      // Create hidden iframe for deep link attempt
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = deepLink;
      document.body.appendChild(iframe);

      // Fall back to web URL after 1.5 seconds
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.open(webUrl, '_blank');
      }, 1500);
    } else {
      // Open web URL directly
      window.open(webUrl, '_blank');
    }

    onOrderSuccess(serviceName);
    onClose();
  };

  // Helper to determine if icon is an image URL or an emoji
  const isImageIcon = (icon: string) => {
    return icon.startsWith('/') || icon.startsWith('http') || icon.includes('.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-70"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white border-4 border-black shadow-brutal-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-chefini-yellow border-b-4 border-black p-6 sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-black mb-2">ORDER THIS ITEM</h2>
              <p className="text-black font-bold text-lg">&quot;{item}&quot;</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-black text-white hover:bg-gray-800 transition-colors ml-4"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Services List */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4 font-bold">
            Select a quick-commerce app to search and order this item:
          </p>

          <div className="space-y-3">
            {shoppingServices.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service.id, service.name)}
                className="w-full p-4 border-2 border-black hover:shadow-brutal hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-between group"
                style={{ 
                  backgroundColor: service.bgColor,
                  borderColor: service.color 
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Conditionally Render Image or Emoji */}
                  <div className="w-12 h-12 flex items-center justify-center bg-white border-black rounded-lg overflow-hidden shrink-0">
                    {isImageIcon(service.icon) ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                            src={service.icon} 
                            alt={service.name} 
                            className="w-full h-full object-cover" 
                        />
                    ) : (
                        <span className="text-3xl leading-none">{service.icon}</span>
                    )}
                  </div>

                  <div className="text-left">
                    <div className="font-black text-black text-lg leading-tight">{service.name}</div>
                    <div className="text-xs text-gray-600 font-medium">{service.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <ExternalLink size={18} className="text-gray-500" />
                  <ChevronRight size={24} className="text-black group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-gray-100 border-2 border-gray-300">
            <p className="text-xs text-gray-700 leading-relaxed">
              <strong>💡 Tip:</strong> The app will open with a search for &quot;{item.replace(/\d+\s*(cup|cups|tbsp|tsp|kg|g|gm|gms|ml|l|ltr|piece|pieces|pcs|oz|lb)/gi, '').trim()}&quot;. 
              You may need to select the exact product and add it to your cart manually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}