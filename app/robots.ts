import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // Block private routes if you have any
    },
    sitemap: 'https://chefini.vercel.app/sitemap.xml',
  };
}