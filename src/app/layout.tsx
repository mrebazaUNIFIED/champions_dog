import type { Metadata } from 'next';
import { Bebas_Neue, Inter } from 'next/font/google';
import AppShell from '../components/layout/AppShell';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: ['400'], variable: '--font-bebas' });

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
      <body className={`${inter.variable} ${bebasNeue.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
