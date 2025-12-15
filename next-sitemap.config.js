/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://chefini.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  
  // 1. BLOCK everything except the homepage
  exclude: [
    '/dashboard', 
    '/dashboard/*', 
    '/daily-dishes', 
    '/discover', 
    '/cookbook', 
    '/shopping-list', 
    '/debug',
    '/api/*', 
    '/private/*'
  ],

  // 2. Configure Robots.txt to tell Google "Don't look inside the app"
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/', // Allow the homepage
        disallow: [
            '/dashboard', 
            '/daily-dishes', 
            '/discover', 
            '/cookbook', 
            '/shopping-list', 
            '/api/', 
            '/private/'
        ],
      },
    ],
  },

  changefreq: 'daily',
  priority: 1.0, // Homepage gets max priority
  sitemapSize: 5000,
  
  // 3. Transform function simplified (since we only have the homepage left)
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};