import type { Metadata } from 'next';
import { Chivo, JetBrains_Mono, Manrope } from 'next/font/google';
import AppShell from '../components/layout/AppShell';
import './globals.css';

const chivo = Chivo({ subsets: ['latin'], weight: ['700', '800', '900'], variable: '--font-chivo' });
const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-manrope' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-jetbrains-mono' });

export const metadata: Metadata = {
  title: '4.º Campeonato Perritos Locos',
  description: 'Gestión del torneo: equipos, partidos, clasificación, rankings y jugadores.',
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className={`${chivo.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
