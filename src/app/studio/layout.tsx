import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

/** The studio is a developer showcase for individual 3D props: not served in production. */
export default function StudioLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === 'production') notFound();
  return <>{children}</>;
}
