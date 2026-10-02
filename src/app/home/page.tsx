import type { Metadata } from 'next';

import { HomePage } from '@/components/marketing/home';

export const metadata: Metadata = {
  title: {
    absolute: 'Proofline — Good relationships. Clear next steps.',
  },
  description:
    'Rank open deals from your own records, see why each one matters, and approve the next step.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPage() {
  return <HomePage />;
}
