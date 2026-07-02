'use client';

import { WorldSessionProvider } from '@/lib/context/WorldSessionProvider';

export default function StartStackLayout({ children }) {
  return <WorldSessionProvider>{children}</WorldSessionProvider>;
}