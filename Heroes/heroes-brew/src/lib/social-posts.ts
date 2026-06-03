import { InstagramPost } from '@/types';

/**
 * Curated @americanheroesandbrew photos, self-hosted in public/instagram/.
 * Each image is extracted from the post's public preview and served locally,
 * so it never expires or breaks — rendered as a clean, uniform cropped grid
 * (no Instagram embed chrome). Each tile links back to the original post.
 *
 * To add posts: drop the image in public/instagram/ and add an entry here.
 * If a live feed (BEHOLD_FEED_URL / INSTAGRAM_ACCESS_TOKEN) is configured,
 * it takes precedence over this curated set.
 */
export const CURATED_POSTS: InstagramPost[] = [
  { id: 'DGyS3AqS180', media_url: '/instagram/DGyS3AqS180.jpg', permalink: 'https://www.instagram.com/p/DGyS3AqS180/', caption: 'Now open for breakfast', timestamp: '', media_type: 'IMAGE' },
  { id: 'DDiDL5KSZJB', media_url: '/instagram/DDiDL5KSZJB.jpg', permalink: 'https://www.instagram.com/p/DDiDL5KSZJB/', caption: 'Gift cards available', timestamp: '', media_type: 'IMAGE' },
  { id: 'DCPVnFxyAyP', media_url: '/instagram/DCPVnFxyAyP.jpg', permalink: 'https://www.instagram.com/p/DCPVnFxyAyP/', caption: 'Happy Veterans Day', timestamp: '', media_type: 'IMAGE' },
  { id: 'DAyba3Pv4fV', media_url: '/instagram/DAyba3Pv4fV.jpg', permalink: 'https://www.instagram.com/p/DAyba3Pv4fV/', caption: 'A local favorite', timestamp: '', media_type: 'IMAGE' },
  { id: 'DAWfKcCSfHU', media_url: '/instagram/DAWfKcCSfHU.jpg', permalink: 'https://www.instagram.com/reel/DAWfKcCSfHU/', caption: 'Frozen margaritas', timestamp: '', media_type: 'IMAGE' },
  { id: 'DAWcxPUy9ws', media_url: '/instagram/DAWcxPUy9ws.jpg', permalink: 'https://www.instagram.com/reel/DAWcxPUy9ws/', caption: 'Now open in Carlsbad', timestamp: '', media_type: 'IMAGE' },
  { id: 'C_qZYZfPSK0', media_url: '/instagram/C_qZYZfPSK0.jpg', permalink: 'https://www.instagram.com/p/C_qZYZfPSK0/', caption: 'Football Sundays', timestamp: '', media_type: 'IMAGE' },
  { id: 'C4eNlS9P-nd', media_url: '/instagram/C4eNlS9P-nd.jpg', permalink: 'https://www.instagram.com/p/C4eNlS9P-nd/', caption: 'Our famous Philly', timestamp: '', media_type: 'IMAGE' },
];
