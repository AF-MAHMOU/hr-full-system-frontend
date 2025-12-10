import type { Metadata } from 'next';
import '../shared/styles/globals.css';
import Navbar from './modules/time-management/components/Navbar';

export const metadata: Metadata = {
  title: 'HR Management System',
  description: 'Unified HR platform for managing employee lifecycle',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
