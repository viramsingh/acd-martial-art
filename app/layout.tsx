import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'ACD Martial Arts - Sports Club Mandsaur | Official Website & Student Portal',
  description: 'ACD Martial Arts - Sports Club Mandsaur offering professional Taekwondo, Kickboxing, WAKO combat, and Self-Defense training under Master Aditya Chanal Dojang.',
  icons: {
    icon: [
      { url: '/assets/logo.PNG', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/assets/logo.PNG',
    apple: '/assets/logo.PNG',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F19] text-slate-100 min-h-screen flex flex-col antialiased">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
