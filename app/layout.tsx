import type { Metadata } from 'next';
import '../shared/styles/globals.css';
import Navbar from './modules/time-management/components/Navbar';

import { Inter, Manrope, Open_Sans } from "next/font/google";
export const inter = Inter({ subsets: ["latin"], variable: "--font-ui", display: "swap" });

export const metadata: Metadata = {
  title: 'HR Management System',
  description: 'Unified HR platform for managing employee lifecycle',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #0f0e1a 0%, #1a1825 25%, #2f2c3c 50%, #25242d 75%, #181623 100%)',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <Navbar />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}