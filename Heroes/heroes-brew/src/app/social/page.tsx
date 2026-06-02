import { redirect } from 'next/navigation';

// The social page is hidden for now. Keep the route so existing bookmarks/links
// resolve gracefully to home instead of 404-ing. SocialPageClient and
// src/lib/instagram.ts are left intact — restore the implementation in git
// history (and the nav links in TopNav/BottomNav) to re-enable.
export default function SocialPage() {
  redirect('/');
}
