// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/', 
        '/daily-dishes/', 
        '/discover/', 
        '/cookbook/', 
        '/shopping-list/', 
        '/debug/',
        '/api/', 
        '/private/'
      ],
    },
    sitemap: 'https://chefini.vercel.app/sitemap.xml',
  };
}