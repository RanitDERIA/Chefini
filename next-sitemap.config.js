/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://chefini.vercel.app',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/private/'],
      },
    ],
  },
  exclude: ['/api/*', '/private/*'],
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  transform: async (config, path) => {
    // Custom priority for different pages
    let priority = 0.7;
    let changefreq = 'weekly';

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/daily-dishes') {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path === '/dashboard' || path === '/discover') {
      priority = 0.8;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};