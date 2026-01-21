// Pages to crawl (excluding product/shop pages)
export const PAGES = [
  { url: 'https://www.mascp.org/', slug: 'home' },
  { url: 'https://www.mascp.org/about-1', slug: 'about' },
  { url: 'https://www.mascp.org/history', slug: 'history' },
  { url: 'https://www.mascp.org/activities', slug: 'activities' },
  { url: 'https://www.mascp.org/scholarships', slug: 'scholarships' },
  { url: 'https://www.mascp.org/anti-mining', slug: 'anti-mining' },
  { url: 'https://www.mascp.org/fair-trade-1', slug: 'fair-trade' },
  { url: 'https://www.mascp.org/get-involved-1', slug: 'get-involved' },
  { url: 'https://www.mascp.org/donate-1', slug: 'donate' },
  { url: 'https://www.mascp.org/contact-us-1', slug: 'contact' },
  { url: 'https://www.mascp.org/resources-1', slug: 'resources' },
  { url: 'https://www.mascp.org/newsletter-archive', slug: 'newsletter-archive' },
  { url: 'https://www.mascp.org/event-list', slug: 'event-list' },
  { url: 'https://www.mascp.org/upcoming-events', slug: 'upcoming-events' },
  { url: 'https://www.mascp.org/celebrations', slug: 'celebrations' },
  // "copy-of" pages - may be duplicates, included for review
  { url: 'https://www.mascp.org/copy-of-scholarships', slug: 'copy-of-scholarships' },
  { url: 'https://www.mascp.org/copy-of-anti-mining', slug: 'copy-of-anti-mining' },
  { url: 'https://www.mascp.org/copy-of-fair-trade', slug: 'copy-of-fair-trade' },
  { url: 'https://www.mascp.org/copy-of-our-work', slug: 'copy-of-our-work' },
  { url: 'https://www.mascp.org/copy-of-delegations', slug: 'copy-of-delegations' },
  // Legacy page
  { url: 'https://www.mascp.org/2017-holiday-fair-signup', slug: '2017-holiday-fair-signup' },
];

// Event detail pages
export const EVENT_PAGES = [
  { url: 'https://www.mascp.org/event-details/community-organizing-that-leads-to-national-change', slug: 'event-community-organizing' },
  { url: 'https://www.mascp.org/event-details/8-oclock-buzz-interview-with-cintia-and-zulma', slug: 'event-8oclock-buzz' },
  { url: 'https://www.mascp.org/event-details/mascps-annual-pupusa-dinner-and-fundraiser', slug: 'event-pupusa-dinner' },
  { url: 'https://www.mascp.org/event-details/social-mobilization-around-environmental-issues', slug: 'event-social-mobilization' },
  { url: 'https://www.mascp.org/event-details/the-essential-role-of-community-organizing-in-national-change', slug: 'event-essential-organizing' },
  { url: 'https://www.mascp.org/event-details/water-is-life-stories-of-grassroots-environmental-activism-in-el-salvador-and-the-united-states', slug: 'event-water-is-life' },
];

export const OUTPUT_DIR = './output';
export const BASE_URL = 'https://www.mascp.org';
