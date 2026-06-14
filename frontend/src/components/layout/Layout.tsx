import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

/** App shell: sticky navbar, page content, footer. */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <Footer />
    </div>
  );
}
