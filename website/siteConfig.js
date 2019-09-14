// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'Klarna',
    image: '/img/users/klarna.svg',
    infoLink: 'https://klarna.com',
    pinned: true,
  },
  {
    caption: 'BBC',
    image: '/img/users/bbc.svg',
    infoLink: 'https://www.bbc.com',
    pinned: true,
  },
];

const siteConfig = {
  title: 'Loki', // Title for your website.
  tagline: 'Visual Regression Testing for Storybook',
  url: 'https://loki.js.org', // Your website URL
  baseUrl: '/', // Base URL for your project */
  docsUrl: '', // Remove docs prefix for backwards compatibility
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'loki',
  organizationName: 'oblador',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'

  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'getting-started', label: 'Getting Started' },
    { doc: 'configuration', label: 'Configuration' },
    { doc: 'command-line-arguments', label: 'Command Line Arguments' },
  ],

  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/logo.svg',
  footerIcon: 'img/favicon.svg',
  favicon: 'img/favicon.png',

  /* Colors for website */
  colors: {
    primaryColor: '#00C3FF',
    secondaryColor: '#005873',
  },

  /* Custom fonts for website */
  /*
  fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },
  */

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Joel Arvidsson`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },

  // Add custom scripts here that would be placed in <script> tags.
  scripts: ['https://buttons.github.io/buttons.js'],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: false,

  // Open Graph and Twitter card images.
  ogImage: 'img/favicon.svg',
  twitterImage: 'img/favicon.svg',

  twitterUsername: 'trastknast',

  // For sites with a sizable amount of content, set collapsible to true.
  // Expand/collapse the links and subcategories under categories.
  // docsSideNavCollapsible: true,

  // Show documentation's last contributor's name.
  // enableUpdateBy: true,

  // Show documentation's last update time.
  enableUpdateTime: true,

  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/oblador/loki',
};

module.exports = siteConfig;
