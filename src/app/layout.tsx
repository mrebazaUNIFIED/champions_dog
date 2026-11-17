import type { Metadata } from 'next';
import { Inter, Rajdhani } from 'next/font/google';
import AppShell from '../components/layout/AppShell';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-rajdhani' });

export const metadata: Metadata = {
  title: '4.º Campeonato Perritos Locos — Selección de Equipos',
  description: 'Selección y distribución automática de jugadores en 6 equipos equilibrados.',
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${rajdhani.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
